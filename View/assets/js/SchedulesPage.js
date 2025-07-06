
// Open the appointment modal
function openModal(day, time) {
    currentAppointment = appointments.find(app => app.day === day && app.time === time);
    document.getElementById('modalTitle').textContent = `Appointment Details (${day} at ${time})`;
    document.getElementById('modalInfo').innerHTML = `
      Patient: ${currentAppointment.patient} <br>
      Doctor: ${currentAppointment.doctor} <br>
      Department: ${currentAppointment.department}
    `;
    document.getElementById('appointmentModal').style.display = "block";
    resetModal();
  }
  
  
  // Confirm appointment
  function confirmAppointment() {
    alert("Appointment confirmed!");
    closeModal();
  }
  
  // Decline appointment
  function declineAppointment() {
    document.getElementById('actionButtons').style.display = "none";
    document.getElementById('declineOptions').style.display = "block";
  }
  
  // Show available appointments for rescheduling
  function showAvailableAppointments() {
    document.getElementById('declineOptions').style.display = "none";
    document.getElementById('availableAppointments').style.display = "block";
    document.getElementById('sendButton').style.display = "block";
   
    
  
  
    const container = document.getElementById('availableCards');
    container.innerHTML = "";
    availableAppointments.forEach(app => {
      const card = document.createElement('div');
      card.className = 'card';
      card.textContent = `Available: ${app.time}`;
      card.onclick = () => {
        selectedNewAppointment = app.time;
        alert(`You selected ${app.time}`);
      };
      container.appendChild(card);
    });
  }
  
  
  
  function confirmAppointmentt(){
      document.getElementById('confirmModifyBtn').style.display = "block"; 
      document.getElementById('sendButton').style.display = "none";
  }
  
  
  // Show reason input for deletion
  function showDeleteReason() {
    document.getElementById('declineOptions').style.display = "none";
    document.getElementById('deleteReason').style.display = "block";
    document.getElementById('sendButton').style.display = "block";
  }
  
  
  // Send response for appointment action
  function sendResponse() {
    if (selectedNewAppointment) {
      alert(`Appointment rescheduled to ${selectedNewAppointment}`);
    } else if (document.getElementById('deleteReason').style.display === "block") {
      const reason = document.getElementById('reason').value;
      alert(`Appointment deleted. Reason: ${reason}`);
    } else {
      alert("Response sent!");
    }
    closeModal();
  }
  
  
  // Reset modal to default view
  function resetModal() {
    document.getElementById('actionButtons').style.display = "block";
    document.getElementById('declineOptions').style.display = "none";
    document.getElementById('availableAppointments').style.display = "none";
    document.getElementById('deleteReason').style.display = "none";
    document.getElementById('sendButton').style.display = "none";
    document.getElementById('reason').value = "";
    selectedNewAppointment = null;
  }
  
  function closeModal() {
    const modal = document.getElementById("appointmentModal");
    modal.style.display = "none";
  }
  
  
  window.onload = generateSchedule;

  







  document.addEventListener("DOMContentLoaded", function () {
    generateSchedule(); // Generate schedule for a single one
});

function toggleDropdown(id) {
    document.querySelectorAll(".dropdown-content").forEach(dropdown => {
        if (dropdown.id !== id) {
            dropdown.style.display = "none";
        }
    });

    let dropdown = document.getElementById(id);
    dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
}

document.addEventListener("click", function (event) {
    if (!event.target.closest(".dropdown")) {
        document.querySelectorAll(".dropdown-content").forEach(dropdown => {
            dropdown.style.display = "none";
        });
    }
});






function goHome() {
window.location.href = "../Html/DashboardPage(Guardian).html"; 
}
