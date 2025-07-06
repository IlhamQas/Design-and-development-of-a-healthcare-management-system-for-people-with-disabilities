
  // إضافة صف للأخوة
  function addSibling() {
    const tbody = document.querySelector("#siblingsTable tbody");
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><input type="text" class="sibling_name" required></td>
      <td><input type="number" class="sibling_age" min="0" required></td>
      <td><input type="text" class="sibling_notes"></td>
      <td><button type="button" onclick="this.closest('tr').remove()" class="btn-small">حذف</button></td>
    `;
    tbody.appendChild(tr);
  }

  // إضافة صف للأمراض
  function addDisease() {
    const tbody = document.querySelector("#diseasesTable tbody");
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><input type="text" class="disease_name" required></td>
      <td>
        <select class="disease_hasDisease" required>
          <option value="">اختر</option>
          <option value="true">نعم</option>
          <option value="false">لا</option>
        </select>
      </td>
      <td><input type="text" class="disease_notes"></td>
      <td><button type="button" onclick="this.closest('tr').remove()" class="btn-small">حذف</button></td>
    `;
    tbody.appendChild(tr);
  }


const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
const specialistId = payload._id; 
const specialistName = payload.name || "الاخصائي";
const urlParams = new URLSearchParams(window.location.search);
let childId = urlParams.get('id');
if (!childId) {
  document.getElementById('guardianIdInputWrapper').style.display = 'block';
}


document.getElementById("specialistId").value = specialistId;
document.getElementById("specialistName").innerText = specialistName;



    document.getElementById("evaluationForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    let childId = urlParams.get('id');
    if (!childId) {
     childId = document.getElementById('guardianId').value?.trim();
  }

 console.log("Child ID:", childId);
  if (!childId) {
    alert("❌ يرجى إدخال معرف الطفل (Child ID) قبل الإرسال.");
    return;
  }

    const getValue = id => document.getElementById(id)?.value?.trim() || "";
    const getNumber = id => Number(document.getElementById(id)?.value) || undefined;

  
    const child = {
      fullName: getValue("child_fullName"),
      age: getNumber("child_age"),
      birthDate: getValue("child_birthDate"),
      birthPlace: getValue("child_birthPlace"),
      gender: getValue("child_gender"),
      homePhone: getValue("child_homePhone"),
      address: getValue("child_address"),
      referralSource: getValue("child_referralSource"),
      schoolName: getValue("child_schoolName"),
      gradeLevel: getValue("child_gradeLevel"),
    };

    // 👪 بيانات الأهل
    const parents = {
      motherName: getValue("parents_motherName"),
      fatherName: getValue("parents_fatherName"),
      motherEducation: getValue("parents_motherEducation"),
      fatherEducation: getValue("parents_fatherEducation"),
      motherJob: getValue("parents_motherJob"),
      fatherJob: getValue("parents_fatherJob"),
      motherMobile: getValue("parents_motherMobile"),
      fatherMobile: getValue("parents_fatherMobile"),
      motherWorkplace: getValue("parents_motherWorkplace"),
      fatherWorkplace: getValue("parents_fatherWorkplace"),
    };

    // 👨‍👩‍👧‍👦 بيانات الأسرة
    const family = {
      parentRelationship: getValue("family_parentRelationship"),
      speechProblems: getValue("family_speechProblems"),
    };

    // 👶 مراحل النمو
    const development = {
      motherAgeDuringPregnancy: getNumber("development_motherAgeDuringPregnancy"),
      motherSmoker: getValue("development_motherSmoker"),
      miscarriages: getValue("development_miscarriages"),
      pregnancyDuration: getValue("development_pregnancyDuration"),
      motherPregnancyProblems: getValue("development_motherPregnancyProblems"),
      fetusProblems: getValue("development_fetusProblems"),
    };

    // 🍼 ما بعد الولادة
    const postBirth = {
      birthType: getValue("postBirth_birthType"),
      birthWeight: getNumber("postBirth_birthWeight"),
      birthProblems: getValue("postBirth_birthProblems"),
      feedingType: getValue("postBirth_feedingType"),
      surgery: {
        type: getValue("postBirth_surgery_type"),
        result: getValue("postBirth_surgery_result"),
      },
      medications: getValue("postBirth_medications"),
    };

    // 🧑‍🤝‍🧑 الإخوة
    const siblings = Array.from(document.querySelectorAll("#siblingsTable tbody tr")).map(row => ({
      name: row.querySelector(".sibling_name").value.trim(),
      age: Number(row.querySelector(".sibling_age").value),
      notes: row.querySelector(".sibling_notes").value.trim()
    }));

    // 🦠 الأمراض
    const diseases = Array.from(document.querySelectorAll("#diseasesTable tbody tr")).map(row => ({
      diseaseName: row.querySelector(".disease_name").value.trim(),
      hasDisease: row.querySelector(".disease_hasDisease").value === "true",
      notes: row.querySelector(".disease_notes").value.trim()
    }));

    // 💪 المهارات الحركية
    const motorDevelopment = {
      headLift: getValue("motor_headLift"),
      crawling: getValue("motor_crawling"),
      sitting: getValue("motor_sitting"),
      standing: getValue("motor_standing"),
      walking: getValue("motor_walking"),
      sleepingAlone: getValue("motor_sleepingAlone"),
      toilet: getValue("motor_toilet"),
      eatingTeething: getValue("motor_eatingTeething"),
  
    };

    // 🗣️ المهارات اللغوية
    const speechDevelopment = {
      firstWordTime: getValue("speech_firstWordTime"),
      understandingOthers: getValue("speech_understandingOthers"),
      sentenceProduction: getValue("speech_sentenceProduction"),
      sentenceWordCount: getValue("speech_sentenceWordCount"),
      vocabularyPresence: getValue("speech_vocabularyPresence"),
      voiceEvaluation: {
        hyponasal: getValue("voice_hyponasal"),
        hypernasal: getValue("voice_hypernasal"),
        normalVoice: getValue("voice_normal"),
        breathing: getValue("voice_breathing"),
      },
      stuttering: {
        disfluency: getValue("stutter_disfluency"),
        speechSpeed: getValue("stutter_speechSpeed"),
        startAge: getValue("stutter_startAge"),
        situations: getValue("stutter_situations"),
      },
    
    };

    // 🧠 التقييم المعرفي
    const cognitiveAssessment = {
      concentration: getValue("cognitive_concentration"),
      attentionSpan: getValue("cognitive_attentionSpan"),
      playsWithToys: getValue("cognitive_playsWithToys"),
      goodMemory: getValue("cognitive_goodMemory"),
      problemSolving: getValue("cognitive_problemSolving"),
      autism: {
        isVerbal: getValue("autism_isVerbal"),
        communicationMethod: getValue("autism_communicationMethod"),
        repetitiveBehaviors: getValue("autism_repetitiveBehaviors"),
        toeWalking: getValue("autism_toeWalking"),
        repetitiveSounds: getValue("autism_repetitiveSounds"),
      },
    };

    // 🌍 المجال الاجتماعي
    const socialDomain = {
      interactionFamily: getValue("social_interactionFamily"),
      spontaneousSpeech: getValue("social_spontaneousSpeech"),
      understandOthers: getValue("social_understandOthers"),
      adaptationNewEnv: getValue("social_adaptationNewEnv"),
      helpWithoutRequest: getValue("social_helpWithoutRequest"),
      activityLevel: getValue("social_activityLevel"),
      hyperactivity: getValue("social_hyperactivity"),
      nonverbalExpression: getValue("social_nonverbalExpression"),
      childPersonality: getValue("social_childPersonality"),
      childFeelingsProblem: getValue("social_childFeelingsProblem"),
      interactionOthers: getValue("social_interactionOthers"),
      teacherResponse: getValue("social_teacherResponse"),
      isCalm: getValue("social_isCalm"),
      focusDuration: getValue("social_focusDuration"),
      isSocial: getValue("social_isSocial"),
      separatesEasily: getValue("social_separatesEasily"),
      isIndependent: getValue("social_isIndependent"),
      selfConfidence: getValue("social_selfConfidence"),
      problemHistory: {
        fingerSucking: getValue("social_fingerSucking"),
        bedwetting: getValue("social_bedwetting"),
        attentionDeficit: getValue("social_attentionDeficit"),
        sleepDisorders: getValue("social_sleepDisorders"),
        eatingDisorders: getValue("social_eatingDisorders"),
        anxiety: getValue("social_anxiety"),
        stubbornness: getValue("social_stubbornness"),
        aggressiveness: getValue("social_aggressiveness"),
        tension: getValue("social_tension"),
        moodSwings: getValue("social_moodSwings"),
      },
      peerActivities: getValue("social_peerActivities"),
      peerRelationships: getValue("social_peerRelationships"),
      initiatesPlay: getValue("social_initiatesPlay"),
      competitionParticipation: getValue("social_competitionParticipation"),
      socialActivities: getValue("social_socialActivities"),
      responseFear: getValue("social_responseFear"),
      responseHappy: getValue("social_responseHappy"),
      responseSad: getValue("social_responseSad"),
      likes: getValue("social_likes"),
      dailyRoutine: getValue("social_dailyRoutine"),
      freeTime: getValue("social_freeTime"),
      treatmentExpectations: getValue("social_treatmentExpectations"),
    };

    // 🧼 مهارات المساعدة الذاتية
    const selfHelpSkills = {
      pointUpDown: getValue("selfHelp_pointUpDown"),
      pointRightLeft: getValue("selfHelp_pointRightLeft"),
      whereGoLion: getValue("selfHelp_whereGoLion"),
      whereBuyChips: getValue("selfHelp_whereBuyChips"),
      whereGoWhenSick: getValue("selfHelp_whereGoWhenSick"),
      whatDoWhenThirsty: getValue("selfHelp_whatDoWhenThirsty"),
      whenSleep: getValue("selfHelp_whenSleep"),
      whenSunrise: getValue("selfHelp_whenSunrise"),
      chickenLegs: getValue("selfHelp_chickenLegs"),
      biggerTreeOrFlower: getValue("selfHelp_biggerTreeOrFlower"),
      hotSeason: getValue("selfHelp_hotSeason"),
      nightColor: getValue("selfHelp_nightColor"),
  
    };

    // ⚙️ مهارات أخرى
    const otherSkills = {
      grossMotorSkills: {
        walking: getValue("gross_walking"),
        running: getValue("gross_running"),
        jumping: getValue("gross_jumping"),
      },
      fineMotorSkills: {
        grasping: getValue("fine_grasping"),
        eyeHandCoordination: getValue("fine_eyeHandCoordination"),
        scissorUse: getValue("fine_scissorUse"),
      },
      cognitiveSkills: {
        concentration: getValue("cognitiveSkill_concentration"),
        memory: getValue("cognitiveSkill_memory"),
        planning: getValue("cognitiveSkill_planning"),
      },
      visualCognitiveSkills: {
        visualDiscrimination: getValue("visual_discrimination"),
        visualMemory: getValue("visual_memory"),
        visualTracking: getValue("visual_tracking"),
      },
      dailyLifeActivities: {
        handWashing: getValue("daily_handWashing"),
        teethBrushing: getValue("daily_teethBrushing"),
        toiletUse: getValue("daily_toiletUse"),
      },
    };

    // تجميع كامل
    const evaluation = {
      child,
      parents,
      family,
      development,
      postBirth,
      siblings,
      diseases,
      motorDevelopment,
      speechDevelopment,
      cognitiveAssessment,
      socialDomain,
      selfHelpSkills,
      otherSkills,
    };

  
    try {
  const response = await fetch(`http://localhost:4000/api/v1/evaluation/addEvaluation/${childId}`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(evaluation),
  });

  const result = await response.json();

  if (response.ok) {
    showStatusMessage("✅ Evaluation submitted successfully", true);

    this.reset();
    document.querySelector("#siblingsTable tbody").innerHTML = "";
    document.querySelector("#diseasesTable tbody").innerHTML = "";

    try {
      const doctorRes = await fetch(`http://localhost:4000/api/v1/Guardian/getdoctors/${childId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const doctorData = await doctorRes.json();
      console.log(doctorData);

      if (doctorRes.ok && Array.isArray(doctorData.doctors)) {
        const doctorIds = doctorData.doctors
          .map(doc => doc._id?.toString())
          .filter(Boolean);

        console.log("Doctor IDs to notify:", doctorIds);

        await sendNotification(
          "Evaluation Completed",
          `The <a href="../Html/viewotherProfile.html?id=${childId}">child</a> evaluation is ready. You can now create the treatment plan.
          <a href="../Html/ViewEvaluationForm.html?id=${childId}" target="_blank">View Evaluation</a> and 
          <a href="../Html/CreateTretmentPlan.html?id=${childId}" target="_blank">Create Treatment Plan</a>.`,
          doctorIds
        );

        await sendNotification(
          "Evaluation Completed",
          `Your child's evaluation is ready. 
          <a href="../Html/ViewEvaluationForm.html?id=${childId}" target="_blank">View it here</a>.`,
          childId
        );
      }

    } catch (err) {
      console.error("Notification sending failed:", err);
      showStatusMessage("⚠️ Failed to send notifications", false);
    }
  }

} catch (err) {
  showStatusMessage("❌ Server error while submitting evaluation", false);
  console.error(err);
}

  });



  
async function sendNotification(title, message, receivers) {

if (!Array.isArray(receivers)) {
  receivers = [receivers];  
}
receivers = receivers.filter(id => typeof id === 'string' && id.length === 24);

await fetch(`http://localhost:4000/api/v1/notification/sendNotification`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem('token')}`
  },

  body: JSON.stringify({
    title,
    message,
    userIds: receivers 
  })
});
}