
const urlParams = new URLSearchParams(window.location.search);
const guardianId = urlParams.get('id');

if (!guardianId) {
 showStatusMessage("❌ guardianId is missing from the URL.", false);
  document.getElementById("iepForm").style.display = "block";
}

    function toggleSection(header) {
      const content = header.nextElementSibling;
      content.style.display = content.style.display === 'block' ? 'none' : 'block';
    }

    document.getElementById("iepForm").addEventListener("submit", function(e) {
      e.preventDefault();
    });

    let serviceIndex = 0;

function addSupportService() {
  const container = document.getElementById("support-services-container");

  const serviceDiv = document.createElement("div");
  serviceDiv.className = "support-service";
  serviceDiv.style.border = "1px solid #ccc";
  serviceDiv.style.padding = "10px";
  serviceDiv.style.marginBottom = "10px";

  serviceDiv.innerHTML = `
    <h4>خدمة رقم ${serviceIndex + 1}</h4>
    <label for="service_type_${serviceIndex}">نوع الخدمة</label>
    <input type="text" id="service_type_${serviceIndex}" name="services[${serviceIndex}][type]" placeholder="مثل: علاج نطق">

    <label for="sessions_${serviceIndex}">عدد الجلسات</label>
    <input type="number" id="sessions_${serviceIndex}" name="services[${serviceIndex}][sessions]">

    <label for="notes_${serviceIndex}">ملاحظات</label>
    <textarea id="notes_${serviceIndex}" name="services[${serviceIndex}][notes]"></textarea>

    <button type="button" onclick="removeSupportService(this)" style="background-color: #e74c3c; color: white; margin-top: 10px;">🗑 حذف هذه الخدمة</button>
  `;

  container.appendChild(serviceDiv);
  serviceIndex++;
}

function removeSupportService(button) {
  const serviceDiv = button.parentElement;
  serviceDiv.remove();
}
let teamMemberIndex = 0;

function addTeamMember() {
  const container = document.getElementById("team-members-container");

  const memberDiv = document.createElement("div");
  memberDiv.className = "team-member";
  memberDiv.style.border = "1px solid #ccc";
  memberDiv.style.padding = "10px";
  memberDiv.style.marginBottom = "10px";

  memberDiv.innerHTML = `
    <h4>عضو فريق رقم ${teamMemberIndex + 1}</h4>
    <label>الاسم:
      <input type="text" name="team[${teamMemberIndex}][name]" placeholder="اسم العضو" />
    </label>
    <label>الدور الوظيفي:
      <input type="text" name="team[${teamMemberIndex}][role]" placeholder="الدور الوظيفي" />
    </label>
    <button type="button" onclick="removeTeamMember(this)" style="background-color: #e74c3c; color: white; margin-top: 10px;">🗑 حذف هذا العضو</button>
  `;

  container.appendChild(memberDiv);
  teamMemberIndex++;
}

function removeTeamMember(button) {
  const memberDiv = button.parentElement;
  memberDiv.remove();
}


window.onload = function () {
  addSupportService(); // أول خدمة
  document.querySelector('[name="services[0][type]"]').value = "علاج وظيفي";

  addSupportService(); // ثاني خدمة
  document.querySelector('[name="services[1][type]"]').value = "علاج النطق";

  addTeamMember();
  fetchEvaluation();
};


  
let evaluation = null;
async function fetchEvaluation() {
    
    
  try {
    const res = await fetch(`http://localhost:4000/api/v1/evaluation/get/${guardianId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await res.json();
    console.log(data);
    if (!data.evaluation) {
  showStatusMessage("❌ Evaluation not found. Please contact the specialist.", false);
  document.getElementById("iepForm").style.display = "none";
  return;
}
      evaluation = data.evaluation;
      const evalData = data.evaluation;
      const child = evalData.child;

      document.querySelector('[name="child_name"]').value = child.fullName || '';
      document.querySelector('[name="gender"]').value = child.gender === 'male' ? 'ذكر' : 'أنثى';
      document.querySelector('[name="dob"]').value = child.birthDate?.split("T")[0] || '';
      document.querySelector('[name="age"]').value = child.age || '';

    } catch (error) {
  console.error("Error loading evaluation:", error);
  showStatusMessage("⚠️ Error occurred while loading the evaluation.", false);
}
  }


  document.getElementById("iepForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const form = e.target;

   
    const supportServices = [];
    document.querySelectorAll(".support-service").forEach((div, i) => {
      supportServices.push({
        type: div.querySelector(`input[name="services[${i}][type]"]`).value,
        sessions: Number(div.querySelector(`input[name="services[${i}][sessions]"]`).value),
        notes: div.querySelector(`textarea[name="services[${i}][notes]"]`).value,
      });
    });

    // Collect team members data
    const teamMembers = [];
    document.querySelectorAll(".team-member").forEach((div, i) => {
      teamMembers.push({
        name: div.querySelector(`input[name="team[${i}][name]"]`).value,
        role: div.querySelector(`input[name="team[${i}][role]"]`).value,
      });
    });

    // Prepare the payload object
    const payload = { 
    evaluationId:evaluation._id, 
    plan_date: form.plan_date.value,
    diagnosis: form.diagnosis.value,

    healthStatus: {
      hearing: form.hearing.value,
      vision: form.vision.value,
      speech: form.speech.value,
      motor: form.motor.value,
     },
    services: supportServices.map(s => ({
    type: s.type,
    sessions: s.sessions,    
    notes: s.notes,
})),

  team: teamMembers,
  approval_date: form.approval_date.value,
  initialAssessment: {
    motor: {
      strengths: form.motor_strengths.value,
      weaknesses: form.motor_weaknesses.value,
    },
    selfHelp: {
      strengths: form.self_strengths.value,
      weaknesses: form.self_weaknesses.value,
    },
    social: {
      strengths: form.social_strengths.value,
      weaknesses: form.social_weaknesses.value,
    },
    cognitive: {
      strengths: form.cognitive_strengths.value,
      weaknesses: form.cognitive_weaknesses.value,
    },
    communication: {
      strengths: form.communication_strengths.value,
      weaknesses: form.communication_weaknesses.value,
    },
  },
  goals: {
    motor: form.motor_goals.value,
    selfHelp: form.self_help_goals.value,
    social: form.social_goals.value,
    cognitive: form.cognitive_goals.value,
    communication: form.communication_goals.value,
  },
};
 console.log(payload);

    try {
      const response = await fetch("http://localhost:4000/api/v1/TreatmentPlan/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`, 
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();


      if (response.ok) {
        await sendNotification(
      "New Treatment Plan Created",
     `A new treatment plan has been created for your child by <strong>Sky Medical Team</strong>.<br>
      Please review the plan and follow up with your assigned specialist if needed.<br>
      <a href="../Html/ViewTretmentPlan.html">Click here to view the treatment plan</a>`,
      guardianId );
showStatusMessage("✅ The plan has been saved successfully!");
  form.reset(); 
  window.history.back();
} else {
  showStatusMessage("❌ Error: " + (result.message || "Failed to save the plan."), false);
}
} catch (error) {
  console.error("Error submitting data:", error);
  showStatusMessage("⚠️ An error occurred while connecting to the server.", false);
}
  });


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

