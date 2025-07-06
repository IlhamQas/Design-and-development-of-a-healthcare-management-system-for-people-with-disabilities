
const token = localStorage.getItem("token");
const baseURL = "http://localhost:4000/api/v1";

let currentRequestId = "";
let currentDepartments = [];
let selectedSessions = [];
let currentDepartmentIndex = 0;
let guardianId = "";
let selectedTime = null;
let selectedDay = null;

window.onload = async function () {
  await fetchPendingRequests(); 
  switchPage('make');            
};



async function fetchPendingRequests() {
  try {
    const res = await fetch(`${baseURL}/Guardian/get`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
   
    if (res.ok) {
      onloadavailableSlot();
      displayPendingRequests(data.pendingRequests);
    } else {
      document.getElementById("message").innerText = data.message || "No pending requests found.";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("message").innerText = "Failed to fetch requests.";
  }
}


async function fetchmodifiedRequests() {
  try {
    const res = await fetch(`${baseURL}/Guardian/getStatas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
   
    if (res.ok) {
      onloadavailableSlot();
      displaymodifiedRequests(data.modifiedRequests);
    } else {
      document.getElementById("message2").innerText = data.message || "No pending requests found.";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("message2").innerText = "Failed to fetch requests.";
  }
}



function displayPendingRequests(requests) {
  const container = document.getElementById("requestContainer");
  container.innerHTML = "";

  requests.forEach(request => {
    const departmentNames = request.sessions.map(s => s.department.name).join(", ");
    const card = document.createElement("div");
    card.classList.add("request-card");

    card.innerHTML = `
      <p><strong>Guardian:</strong> ${request.guardianId.name}</p>
      <p><strong>Departments:</strong> ${departmentNames}</p>
      <button onclick="startApproval('${request._id}', '${encodeURIComponent(JSON.stringify(request.sessions.map(s => s.department)))}', '${request.guardianId._id}')">Make Schedule</button>
    `;

    container.appendChild(card);
  });
}

function displaymodifiedRequests(requests) {
const container = document.getElementById("requestContainer2");
container.innerHTML = "";
console.log(requests);
requests.forEach(request => {
 
    const modifiedSessions = request.sessions.filter(session => session.newDay && session.newTime);

    if (modifiedSessions.length === 0) return;

    const card = document.createElement("div");
    card.classList.add("request-card");
    let sessionsHTML = modifiedSessions.map(session => {
        return `
            <p><strong>Department:</strong> ${session.department.name}</p>
            <p><strong>Guardian:</strong> ${request.guardianId.name}</p>
            <p><strong>New Day:</strong> ${session.newDay} <strong>New Time:</strong> ${session.newTime}</p>
            <p><strong>Specialist:</strong> ${session.specialistId.name}</p>
            <p><strong>Note:</strong> The guardian wants to move the session from <strong>${session.time}</strong> on <strong>${session.dayOfWeek}</strong> to <strong>${session.newTime}</strong> on <strong>${session.newDay}</strong>.</p>
            <button onclick="approveModifiedRequest('${session._id}','${request._id}', '${request.guardianId._id}')">Approve</button>
            <button onclick="rejectModifiedRequest('${session._id}','${request._id}', '${request.guardianId._id}')">Reject</button>
        `;
    }).join("");

    card.innerHTML = sessionsHTML;
    container.appendChild(card);
});
}

function startApproval(requestId, encodedDepartments,guardianIdParam) {
  guardianId = guardianIdParam;
  currentRequestId = requestId;
  currentDepartments = JSON.parse(decodeURIComponent(encodedDepartments));
  selectedSessions = [];
  currentDepartmentIndex = 0;
  selectedDay = null;
  selectedTime = null;
  document.getElementById("scheduleModal").style.display = "flex";
  loadCurrentDepartment();
}

function loadCurrentDepartment() {
  const department = currentDepartments[currentDepartmentIndex];


  const departmentSelect = document.getElementById("departmentSelect");
  departmentSelect.innerHTML = `<option value="${department._id}">${department.name}</option>`;


  document.getElementById("doctorSelect").innerHTML = '<option value="">-- Choose Doctor --</option>';
  document.getElementById("scheduleDetails").innerHTML = '';
  selectedDay = null;
  selectedTime = null;

  document.querySelectorAll(".time-badge").forEach(b => b.classList.remove("selected"));


  const confirmBtn = document.querySelector('.modal-content button:nth-of-type(2)');
  confirmBtn.textContent = (currentDepartmentIndex === currentDepartments.length - 1)
    ? "Finish & Submit"
    : "Confirm Appointment";

  document.getElementById("stepMessage").style.display = "none";
  fetchDoctors(department._id);
}

function closeModal() {
  document.getElementById("scheduleModal").style.display = "none";
}

function goBack() {
  if (currentDepartmentIndex > 0) {
    currentDepartmentIndex--;
    loadCurrentDepartment();
  } else {
    alert("You are already at the first department.");
  }
}

async function fetchDoctors(departmentId) {
  const res = await fetch(`${baseURL}/dep/all/${departmentId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const doctorSelect = document.getElementById("doctorSelect");
  doctorSelect.innerHTML = '<option value="">-- Choose Doctor --</option>';

  data.department.doctors.forEach(doc => {
    const option = document.createElement("option");
    option.value = doc.doctorId;
    option.textContent = doc.doctorName;
    doctorSelect.appendChild(option);
  });
}

async function fetchDoctorSchedule() {
  const doctorId = document.getElementById("doctorSelect").value;
  const res = await fetch(`${baseURL}/Doctor/allbyId/${doctorId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const container = document.getElementById("scheduleDetails");
  container.innerHTML = '';

  const slots = data.find.availableSlots;
  if (!slots || slots.length === 0) {
    container.innerHTML = `<p>No available slots.</p>`;
    return;
  }

  container.innerHTML = `<h3>Available Slots:</h3>`;
  slots.forEach(slot => {
    const timesHTML = slot.times.map(time =>
      `<span class="time-badge" onclick="selectTime(this, '${slot.dayOfWeek}', '${time}')">${time}</span>`
    ).join(" ");
    container.innerHTML += `
      <div class="slot-card">
        <strong>${slot.dayOfWeek}</strong>
        <div>${timesHTML}</div>
      </div>`;
  });
}

function selectTime(element, day, time) {
  selectedDay = day;
  selectedTime = time;
  document.querySelectorAll(".time-badge").forEach(badge => badge.classList.remove("selected"));
  element.classList.add("selected");
}

function hasConflict(day, time) {
  return selectedSessions.some(session => session.day === day && session.time === time);
}

async function confirmSingleAppointment() {
const doctorId = document.getElementById("doctorSelect").value;

if (!selectedDay || !selectedTime || !doctorId) {
showStatusMessage("Please choose doctor and time.", false);
return;
}

if (hasConflict(selectedDay, selectedTime)) {
showStatusMessage("This slot conflicts with another session. Please choose another time.", false);
return;
}

  selectedSessions.push({
    department: currentDepartments[currentDepartmentIndex]._id,
    doctor: doctorId,
    day: selectedDay,
    time: selectedTime
  });

  if (currentDepartmentIndex < currentDepartments.length - 1) {
    currentDepartmentIndex++;
    loadCurrentDepartment();

    const msg = document.getElementById("stepMessage");
    msg.innerText = "✔ Appointment saved. Proceed to the next department.";
    showStatusMessage("Appointment saved. Proceed to the next department.");
    msg.style.display = "block";
  } else {
    await sendFinalSessions();
    closeModal();
    fetchPendingRequests();
  }
}

async function sendFinalSessions() {
try {
const res = await fetch(`${baseURL}/Guardian/approve/${currentRequestId}`, {
  method: 'PATCH',
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ sessions: selectedSessions })
});

console.log(selectedSessions);
const data = await res.json();
console.log(data);

if (res.ok) {
  showStatusMessage("All sessions confirmed successfully!", true);

  await sendNotification(
    "Schedule created successfully!",
    `A sessions has been added to your Schedule by <strong>Sky Medical Manager</strong> Please check your schedule. If you object, please contact us or request a change.<a href="../Html/SchedulesPage(Guardian).html">Click here</a> Thanks.`,
    guardianId
  );

  const notifiedDoctors = new Set();

  for (const session of selectedSessions) {
    if (!notifiedDoctors.has(session.doctor)) {
      await sendNotification(
        "New session added to your schedule!",
        `A new session has been added by <strong>Sky Medical Manager</strong>. Please check your schedule. <a href="../Html/SchedulesPage(Specialist).html">Click here</a>.`,
        session.doctor
      );
      notifiedDoctors.add(session.doctor);
    }
  }

} else {
  showStatusMessage("Error: " + (data.message || "Failed to save sessions."), false);
}
} catch (err) {
console.error(err);
showStatusMessage("Failed to save sessions.", false);
}
}




async function onloadavailableSlot(){
try {
  const response = await fetch(`${baseURL}/Doctor/fixed`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}` 
    }
  });

  const result = await response.json();

  if (response.ok) {
    console.log('✅ Restored missing slots:', result);
  } else {
    console.error('❌ Failed to restore slots:', result.message);
  }
} catch (error) {
  console.error('🚨 Error restoring slots:', error.message);
}
};



async function approveModifiedRequest(sessionId, requestId, guardianId) {
try {
const response = await fetch(`${baseURL}/Guardian/approveupdate/${sessionId}/${requestId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
});

const result = await response.json();
console.log(result);

if (response.ok) {
  showStatusMessage("Session modification approved successfully!", true);
  await sendNotification(
    "Session modification approved successfully!",
    `Your request to modify your schedule has been approved. Please review your updated schedule for the latest changes. <a href='../Html/SchedulesPage(Guardian).html'>View Schedule</a>`,
    guardianId
  );
  setTimeout(() => location.reload(), 2000);
} else {
  showStatusMessage("Error: " + (result.message || "Failed to approve modification."), false);
}
} catch (error) {
console.error("Error approving modified session:", error);
showStatusMessage("An unexpected error occurred.", false);
}
}

async function rejectModifiedRequest(sessionId, requestId, guardianId) {
try {
const response = await fetch(`${baseURL}/Guardian/reject/${sessionId}/${requestId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
});

const result = await response.json();

if (response.ok) {
  showStatusMessage("Session modification rejected.", false);
  await sendNotification(
    "Your Schedule Change Request Was Rejected",
    "Unfortunately, your request to modify the session time has been rejected. You can reach out to the Manager to discuss the reason on <a href='../Html/chatSupport.html?to=manager'>Chat manager</a> or suggest an alternative schedule.",
    guardianId
  );
  setTimeout(() => location.reload(), 2000);
} else {
  showStatusMessage("Error: " + (result.message || "Failed to reject modification."), false);
}
} catch (error) {
console.error("Error rejecting modified session:", error);
showStatusMessage("An unexpected error occurred.", false);
}
}





function switchPage(page) {
  const makeSection = document.getElementById("makeScheduleSection");
  const modifySection = document.getElementById("modifyScheduleSection");
  const makeBtn = document.getElementById("makeScheduleBtnHeader");
  const modifyBtn = document.getElementById("modifyScheduleBtnHeader");

  if (page === 'make') {
    fetchPendingRequests();
    makeSection.style.display = "block";
    modifySection.style.display = "none";
    makeSection.classList.add("fade");
    makeBtn.classList.add("active");
    modifyBtn.classList.remove("active");
  } else {
    fetchmodifiedRequests();
    makeSection.style.display = "none";
    modifySection.style.display = "block";
    modifySection.classList.add("fade");
    modifyBtn.classList.add("active");
    makeBtn.classList.remove("active");
  }
}


async function sendNotification(title, message, userId) {
await fetch(`${baseURL}/notification/sendNotification`, {
method: "POST",
headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
},
body: JSON.stringify({
  title,
  message,
  userIds: [userId]
})
});
}


