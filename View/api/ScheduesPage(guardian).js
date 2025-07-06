
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

let guardianId = user._id;



console.log(guardianId);
console.log('Type of guardianId:', typeof guardianId);
const departments = user?.department || [];
let currentSessionId = null;
let currentRequestId = null;
window.onload = async function () {
  try {
    const response = await fetch(`http://localhost:4000/api/V1/Guardian/getallStatas`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const result = await response.json();
  


    if (result.status === 'pending' ) {
      document.getElementById("scheduleForm").style.display = 'none';
      document.getElementById("message").innerText = "Your schedule request is pending. When it is ready, we will inform you.";
    
    } else if (result.status === 'approved' ) {
      document.getElementById("scheduleForm").style.display = 'none';
      document.getElementById("message").innerText = "Your schedule request has been approved!";
      fetchGuardianSchedule();

    } else if (result.status === 'modified') {
      document.getElementById("scheduleForm").style.display = 'none';
      document.getElementById("message").innerText = "Your schedule request has been modified.";
      fetchGuardianSchedule();

    } else {
      document.getElementById("message").innerText = "You don't have a schedule request. Click this button to make it ready.";
    }
  } catch (error) {
    console.error("Error fetching request status:", error);
    document.getElementById("message").innerText = "Error fetching status.";
  }
};


document.getElementById("scheduleForm").addEventListener("submit", async function (e) {
      e.preventDefault();

      if (departments.length === 0) {
        return document.getElementById("message").innerText = "No departments found for this user.";
      }

      try {
        const response = await fetch("http://localhost:4000/api/V1/Guardian/Request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            sessions: departments.map(dept => ({ department: dept }))
          })
        });

        const result = await response.json();
        document.getElementById("message").innerText = result.message || "Request submitted. Thank you!";
        await sendNotification(
       "New Request!",
       `new First Schedule Request. Please review your Request .<a href='../Html/GuardianSchededuleRequest.html'>View Schedule</a>"`,
       [], 
       ["manager"]
  );
        location.reload();
      } catch (error) {
        console.error("Submission error:", error);
        document.getElementById("message").innerText = "Error submitting request.";
      }
    });



async function fetchGuardianSchedule() {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/Guardian/getSchedule/${guardianId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    console.log(data)
    if (res.ok) {
      renderCalendar(data.guardianRequests);
    } else {
      document.getElementById("scheduleTable").innerText = data.message || "No schedule found.";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("scheduleTable").innerText = "Failed to fetch schedule.";
  }
}



function renderCalendar(requests) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const scheduleMap = {};
  days.forEach(day => scheduleMap[day] = []);

  requests.forEach(request => {
    request.sessions.forEach(session => {
      session._scheduleId = request._id;
      if (scheduleMap[session.dayOfWeek]) {
        scheduleMap[session.dayOfWeek].push(session);
      }
    });
  });

  const table = document.createElement("table");
  table.className = "calendar-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  days.forEach(day => {
    const th = document.createElement("th");
    th.innerText = day;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const row = document.createElement("tr");

  days.forEach(day => {
    const td = document.createElement("td");

    if (scheduleMap[day].length === 0) {
      td.innerHTML = `<p style="color:#999;">No sessions</p>`;
    } else {
      scheduleMap[day].forEach(session => {
        const div = document.createElement("div");
        div.className = "session-card";
        div.innerHTML = `
       <p><strong>${session.department.name}</strong></p>
       <p>Doctor: ${session.specialistId?.name || "N/A"}</p>
       <p>Time: ${session.time}</p>
       ${session.newTime && session.newDay ? `<p style="color: #007bff;">New Time: ${session.newTime} (${session.newDay})</p>` : ""}
     <div class="session-actions">
    <button class="action-btn edit-btn" onclick="editSession('${session._id}', '${session._scheduleId}')">Edit</button>
    ${session.newTime && session.newDay ? `<button class="action-btn cancel-btn" onclick="cancelModification('${session._scheduleId}', '${session._id}')">Cancel Modification</button>` : ""}
  </div>

`;

        td.appendChild(div);
      });
    }

    row.appendChild(td);
  });

  tbody.appendChild(row);
  table.appendChild(tbody);

  const container = document.getElementById("scheduleTable");
  container.innerHTML = "";
  container.appendChild(table);
}


function openModal() {
  document.getElementById('scheduleModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('scheduleModal').style.display = 'none';
}

function editSession(sessionId, requestId) {
  currentSessionId = sessionId;
  currentRequestId = requestId;
  openModal();
}

document.getElementById("scheduleFormModal").addEventListener("submit", async function (e) {
  e.preventDefault();
  const day = document.getElementById('day').value;
  const time = document.getElementById('time').value;

  const allSessions = [];
  let originalSession = null;

  document.querySelectorAll('.session-card').forEach(card => {
    const session = {
      dayOfWeek: card.getAttribute('data-day'),
      time: card.getAttribute('data-time'),
      _id: card.getAttribute('data-id')
    };

    if (session._id === currentSessionId) {
      originalSession = session;
    }

    allSessions.push(session);
  });

  console.log("All Sessions:", allSessions);
  console.log("Original Session:", originalSession);
  if (originalSession && originalSession.dayOfWeek === day && originalSession.time === time) {
  showStatusMessage("You selected the same time. Please choose a different time.", false);
  return;
}

if (isConflict(day, time, allSessions, currentSessionId)) {
  showStatusMessage("This time slot is already booked for another session. Please choose a different time.", false);
  return;
}

try {
  const response = await fetch(`http://localhost:4000/api/v1/Guardian/update/${currentRequestId}/${currentSessionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ newDay: day, newTime: time })
  });

  const data = await response.json();

  if (response.ok) {
    showStatusMessage("Thank you. Your update request has been sent to the manager.", true);
    closeModal();

    await sendNotification(
      "New update Request!",
      `Please review your Request .<a href='../Html/GuardianSchededuleRequest.html'>Click here</a>"`,
      [],
      ["manager"]
    );

    setTimeout(() => {
      location.reload();
    }, 1000);

    fetchGuardianSchedule();
  } else {
    showStatusMessage(data.message || "Failed to update session.", false);
  }
} catch (error) {
  console.error("Error:", error);
  showStatusMessage("An error occurred while sending the request.", false);
}

});

function isConflict(newDay, newTime, allSessions, currentId) {
  return allSessions.some(session =>
    session._id !== currentId &&
    session.dayOfWeek === newDay &&
    session.time === newTime
  );
}


async function cancelModification(requestId, sessionId) {
  currentSessionId = sessionId;
  currentRequestId = requestId;

  const confirmDelete = confirm("Are you sure you want to cancel the modification for this session?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`http://localhost:4000/api/v1/Guardian/reject/${currentSessionId}/${currentRequestId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();

    if (response.ok) {
      showStatusMessage("The session modification has been cancelled and restored to its original time.", true);
      fetchGuardianSchedule();
    } else {
      showStatusMessage(result.message || "Failed to cancel modification.", false);
    }
  } catch (err) {
    console.error("Error cancelling modification:", err);
    showStatusMessage("An error occurred while cancelling the modification.", false);
  }
}


  function viewTherapyPlan() {
    window.location.href = `../Html/ViewTretmentPlan.html?id=${user._id}`;
  }

 

  async function sendNotification(title, message, userId= [] , roles = []) {
  await fetch(`http://localhost:4000/api/v1/notification/sendNotification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title,
      message,
      userId,
      roles
    })
  });
}
  
