async function fetchAppointments() {
    try {
      const response = await fetch("http://localhost:4000/api/v1/pendingAppointment/all", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await response.json();

      if (response.ok) {
    displayAppointments(data.findAll);
  } else {
    showStatusMessage("Failed to load appointments", false);
  }

} catch (err) {
  console.error("Error fetching appointments:", err);
  showStatusMessage("Error loading data.", false);
}
}

  function displayAppointments(appointments) {
    const container = document.getElementById("appointments");
    container.innerHTML = "";

    appointments.forEach(app => {
      const card = document.createElement("div");
      card.className = "appointment-card";

      const statusClass = `status-${app.status}`;

      card.innerHTML = `
        <p><strong>Name:</strong> ${app.name || "N/A"}</p>
        <p><strong>Email:</strong> ${app.email || "N/A"}</p>
        <p><strong>Phone:</strong> ${app.phonenumber || "N/A"}</p>
        <p><strong>Date:</strong> ${new Date(app.date).toISOString().split("T")[0]}</p>
        <p><strong>Notes:</strong> ${app.notes || "No notes"}</p>
        <p><strong>Status:</strong> <span class="${statusClass}">${app.status}</span></p>

        <div class="actions">
          <button class="edit-btn" onclick="editAppointment('${app._id}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="delete-btn" onclick="deleteAppointment('${app._id}')"><i class="fas fa-trash"></i> Delete</button>
        </div>

        <hr/>
      `;

      container.appendChild(card);
    });
  }

let selectedAppointmentId = null;

function editAppointment(id) {
selectedAppointmentId = id;
document.getElementById("editModal").style.display = "flex";
}

function closeModal() {
document.getElementById("editModal").style.display = "none";
selectedAppointmentId = null;
document.getElementById("newDateInput").value = "";
}

function submitDateChange() {
const newDate = document.getElementById("newDateInput").value;

if (!newDate) {
  alert("Please select a valid date.");
  return;
}

fetch(`http://localhost:4000/api/v1/pendingAppointment/update/${selectedAppointmentId}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  },
  body: JSON.stringify({ date: newDate })
})
.then(res => res.json())
.then(data => {
  showStatusMessage("Appointment updated");
  closeModal();
  fetchAppointments();
})
.catch(err => {
  showStatusMessage("Failed to update appointment", false);
});
}


  function deleteAppointment(id) {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    fetch(`http://localhost:4000/api/v1/pendingAppointment/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(res => res.json())
.then(data => {
  showStatusMessage("Appointment deleted");
  fetchAppointments();
})
.catch(err => {
  showStatusMessage("Failed to delete appointment", false);
});
}

  fetchAppointments();