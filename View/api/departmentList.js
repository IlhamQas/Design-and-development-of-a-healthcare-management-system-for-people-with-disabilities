const token = localStorage.getItem('token');

async function fetchDepartments() {
  try {
    const response = await fetch('http://localhost:4000/api/v1/dep/allDep', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    displayDepartments(data.departments || []);
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    showStatusMessage("Failed to fetch departments.", false);
  }
}

function displayDepartments(departments) {
  const container = document.getElementById("departmentsContainer");
  container.innerHTML = "";
  departments.forEach(dep => {
    const div = document.createElement("div");
    div.className = "department";

    const doctors = dep.doctors.length > 0
      ? dep.doctors.map(d => `
        <li>
          <span class="doctor-name" onclick="showDoctorModal('${d.doctorId}', '${dep._id}')">${d.doctorName}</span>
        </li>
      `).join("")
      : "<li>No doctors yet</li>";

    div.innerHTML = `
      <span class="delete-icon" onclick="deleteDepartment('${dep._id}', this)">×</span>
      <h3>${dep.name}</h3>
      <strong>Doctors:</strong>
      <ul class="doctors-list">${doctors}</ul>
      <form class="add-doctor-form" onsubmit="addDoctor(event, '${dep._id}')">
        <input type="text" placeholder="Enter Doctor ID" name="doctorId" required />
        <button type="submit">Add Doctor</button>
      </form>
    `;

    const editBtn = document.createElement("button");
    editBtn.innerHTML = "✏️";
    editBtn.classList.add("edit-dep-btn");
    editBtn.title = "Edit department name";

    editBtn.onclick = async () => {
      const newName = prompt("Enter new department name:", dep.name);
      if (!newName || newName.trim() === "") return;

      try {
        const response = await fetch(`http://localhost:4000/api/v1/dep/updateName/${dep._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name: newName.trim() })
        });

        const result = await response.json();
        showStatusMessage(result.message, response.ok);
        fetchDepartments();
      } catch (error) {
        console.error("Error updating department name:", error);
        showStatusMessage("Something went wrong.", false);
      }
    };
    div.appendChild(editBtn);

    container.appendChild(div);
  });
}

async function addDoctor(event, departmentId) {
  event.preventDefault();
  const doctorId = event.target.doctorId.value;
  try {
    const response = await fetch(`http://localhost:4000/api/v1/dep/addDocToDep/${departmentId}/${doctorId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();
    showStatusMessage(result.message, response.ok);
    fetchDepartments();
  } catch (error) {
    console.error("Error adding doctor:", error);
    showStatusMessage("Something went wrong.", false);
  }
}

fetchDepartments();

let currentDepartmentId = null;
let currentDoctorId = null;

async function showDoctorModal(doctorId, departmentId) {
  try {
    const response = await fetch(`http://localhost:4000/api/v1/admin/user/${doctorId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const doctor = await response.json();

    document.getElementById("doctorName").innerText = doctor.findUser.name;
    document.getElementById("doctorEmail").innerText = "Email: " + doctor.findUser.email;
    document.getElementById("doctorImage").src = doctor.findUser.image;
    document.getElementById("doctorid").innerText = "ID: " + doctor.findUser._id;

    currentDoctorId = doctorId;
    currentDepartmentId = departmentId;
    console.log(doctor);
    document.getElementById("doctorModal").style.display = "flex";
  } catch (error) {
    console.error("Failed to load doctor:", error);
    showStatusMessage("Error fetching doctor details.", false);
  }
}

function closeDoctorModal() {
  document.getElementById("doctorModal").style.display = "none";
}

document.getElementById("removeDoctorBtn").addEventListener("click", async () => {
  if (!currentDoctorId || !currentDepartmentId) return;

  const confirmDelete = confirm("Are you sure you want to remove this doctor?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`http://localhost:4000/api/v1/dep/deleteDep/${currentDepartmentId}/${currentDoctorId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();
    showStatusMessage(result.message, response.ok);
    closeDoctorModal();
    fetchDepartments();
  } catch (error) {
    console.error("Error removing doctor:", error);
    showStatusMessage("Failed to remove the doctor.", false);
  }
});

async function deleteDepartment(id, iconElement) {
  if (!confirm('Are you sure you want to delete this department?')) return;

  try {
    const response = await fetch(`http://localhost:4000/api/v1/dep/delete/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (response.ok) {
      iconElement.parentElement.remove();
      showStatusMessage('Department deleted successfully.', true);
    } else {
      showStatusMessage(result.message || 'Failed to delete the department.', false);
    }
  } catch (error) {
    console.error('Error deleting department:', error);
    showStatusMessage('An error occurred while deleting.', false);
  }
}
