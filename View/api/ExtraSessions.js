const baseURL = "http://localhost:4000/api/v1";
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));
const senderName = user?.name || "the administrator";

let guardians = [];

async function fetchGuardians() {
  try {
    const res = await fetch(`${baseURL}/admin/allUser`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok) {
      guardians = data.find.filter(user => user.role === 'guardian');
      renderGuardians();
    } else {
  showStatusMessage("❌ Failed to fetch guardians: " + (data.message || ""), false);
}
} catch (error) {
showStatusMessage("⚠️ Error fetching guardians: " + error.message, false);
}
}

function renderGuardians() {
  const select = document.getElementById("guardianSelect");
  select.innerHTML = '<option value="">-- Choose Guardian --</option>';
  guardians.forEach(guardian => {
    const option = document.createElement("option");
    option.value = guardian._id;
    option.textContent = guardian.name || guardian.email;
    select.appendChild(option);
  });
}

async function fetchDepartments() {
  const res = await fetch(`${baseURL}/dep/allDep`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const departmentSelect = document.getElementById("departmentSelect");
  departmentSelect.innerHTML = '<option value="">-- Choose Department --</option>';
  data.departments.forEach(dep => {
    const option = document.createElement("option");
    option.value = dep._id;
    option.textContent = dep.name;
    departmentSelect.appendChild(option);
  });
}

async function fetchDoctors() {
  const depId = document.getElementById("departmentSelect").value;
  const doctorSelect = document.getElementById("doctorSelect");
  doctorSelect.innerHTML = '<option value="">-- Choose Doctor --</option>';
  if (!depId) return;

  const res = await fetch(`${baseURL}/dep/all/${depId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
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
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const container = document.getElementById("scheduleContainer");
  container.innerHTML = '';

  if (!data.find.availableSlots || data.find.availableSlots.length === 0) {
    container.innerHTML = `<p class="error">No available appointments.</p>`;
    return;
  }

  data.find.availableSlots.forEach(slot => {
    const slotDiv = document.createElement("div");
    slotDiv.className = "slot-card";
    slotDiv.innerHTML = `<div class="slot-day">${slot.dayOfWeek}</div>`;
    slot.times.forEach(time => {
      const timeBtn = document.createElement("span");
      timeBtn.className = "time-badge";
      timeBtn.textContent = time;
      timeBtn.onclick = () => bookSession(slot.dayOfWeek, time);
      slotDiv.appendChild(timeBtn);
    });
    container.appendChild(slotDiv);
  });
}

async function bookSession(dayOfWeek, time) {
const confirmBooking = confirm(`Do you want to book this session?\nDay: ${dayOfWeek}\nTime: ${time}`);
if (!confirmBooking) return;

const guardianId = document.getElementById("guardianSelect").value;
const department = document.getElementById("departmentSelect").value;
const specialistId = document.getElementById("doctorSelect").value;

if (!guardianId || !department || !specialistId) {
showStatusMessage("⚠️ Please select all fields before booking.", false);
return;
}

try {
const res = await fetch(`${baseURL}/Guardian/addextraSession`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ guardianId, department, specialistId, dayOfWeek, time })
});

const data = await res.json();

if (res.ok) {
  showStatusMessage("✅ Session booked successfully.", true);

  await sendNotification(
    "Extra Session Added",
    `A new session has been added on ${dayOfWeek} at ${time} by <strong>Sky Medical Manager</strong>. Please check your updated schedule. If you object, please contact us or request a change. <a href="../Html/SchedulesPage(Gurdian).html">Click here</a>`,
    guardianId
  );

  await sendNotification(
    "Extra Session Assigned",
    `A new session has been scheduled for you on ${dayOfWeek} at ${time} assigned by <strong>Sky Medical Manager</strong>. If you object, please contact us or request a change. <a href="../Html/SchedulesPage(Specialist).html">Click here</a>`,
    specialistId
  );

} else {
  showStatusMessage(`❌ ${data.message || "Failed to book session."}`, false);
}
} catch (error) {
console.error(error);
showStatusMessage("⚠️ Server error. Please try again.", false);
}
}


fetchGuardians();

window.onload = async function () {
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