
function showStatusMessage(message, isSuccess = true) {
  const msgDiv = document.getElementById("status-message");
  msgDiv.textContent = message;
  msgDiv.style.backgroundColor = isSuccess ? "#d4edda" : "#f8d7da";
  msgDiv.style.color = isSuccess ? "#155724" : "#721c24";
  msgDiv.style.border = isSuccess ? "1px solid #c3e6cb" : "1px solid #f5c6cb";
  msgDiv.style.display = "block";

  setTimeout(() => {
    msgDiv.style.display = "none";
  }, 3000);
}
async function checkProfile() {
  try {
    const response = await fetch("http://localhost:4000/api/v1/profile/getProfile", {
      method: "GET",
      headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
    });

    const data = await response.json();
    localStorage.setItem("profile", JSON.stringify(data.profile));
   console.log(data);
    if (response.ok) {
      const {
        user,
        profile,
        allUsers,
        allMedicalReports,
        allFinancialRecords,
        allProfiles,
        medicalReports,
        financialRecords,
        createdReports,
        myProducts
      } = data;

      // Basic info
     // document.getElementById('name').textContent = user.name;
     document.getElementById('createdAt').textContent = user.createdAt;
     document.getElementById('status').textContent = user.status;
      document.getElementById('email').textContent = user.email;
      document.getElementById('phone').textContent = profile?.phone || '';
      document.getElementById('bio').textContent = profile?.bio || '';
      document.getElementById('address').textContent = profile?.address || '';
      document.getElementById('specialization').textContent = profile?.specialization || '';
      document.getElementById('workplace').textContent = profile?.workplace || '';
      document.getElementById('user-profile-name').textContent = user.name;
      document.getElementById('@userName').textContent = "@" + user.name.split(" ")[0];
      if (user.image) document.getElementById('profile-img').src = user.image;

      document.getElementById('profile-section').classList.remove('hidden');
      document.getElementById('edit-profile').classList.add('hidden');

      const extraDataSection = document.getElementById('extra-data');
      extraDataSection.innerHTML = '';

      // 🧩 Toggle details logic
      window.toggleDetails = function (id) {
        const el = document.getElementById(id);
        el.style.display = el.style.display === "none" ? "block" : "none";
      };

      // 🧠 Reusable Card Renderer
      function renderCard(title, items, type = "generic") {
        const card = document.createElement('div');
        card.className = 'card';
        card.style = `
          border: 1px solid #ccc;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 20px;
          background-color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        `;

        const titleEl = document.createElement('h3');
        titleEl.textContent = `${title} (${items.length})`;
        titleEl.style = 'margin-bottom: 10px; color: #333;';
        card.appendChild(titleEl);

        const ul = document.createElement('ul');
        ul.style = 'list-style: none; padding: 0;';

        items.forEach((item, index) => {
          const li = document.createElement('li');
          li.style = `
            background: #f9f9f9;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 12px;
          `;

          let content = '';
          const id = `${type}-${index}`;

          if (type === 'user') {
            content = `
              <strong>${item.name}</strong> - <span style="color:#007bff;">${item.role}</span><br>
              <small>Email: ${item.email}</small>
            `;
          } else if (type === 'report') {
            content = `
              📝 Report Date: ${new Date(item.reportDate || item.childBD || item.createdAt).toLocaleDateString()}<br>
              Specialist: ${item.specialistId || 'N/A'}<br>
              Guardian: ${item.patientId || 'N/A'}<br>
              <a href="#" onclick="toggleDetails('${id}')">View More</a>
              <div id="${id}" style="display:none; margin-top:10px;">
                Diagnosis: ${item.diagnosis || 'N/A'}<br>
                Cognitive: ${item.cognitiveSkills || 'N/A'}<br>
                Motor (Large): ${item.motorSkillsLarge || 'N/A'}<br>
                Motor (Fine): ${item.motorSkillsFine || 'N/A'}<br>
                Self Care: ${item.selfCareSkills || 'N/A'}<br>
                Social Behavior: ${item.socialBehaviorSkills || 'N/A'}<br>
                Recommendations: ${item.recommendations || 'None'}<br>
                Notes: ${item.notes || 'None'}
              </div>
            `;
          } else if (type === 'transaction') {
            content = `
              💳 Type: ${item.type.toUpperCase()}<br>
              Amount: ${item.amount}₪<br>
              Balance After: ${item.balanceAfterTransaction || 'N/A'}₪<br>
              Description: ${item.description || 'N/A'}<br>
              Date: ${new Date(item.createdAt).toLocaleDateString()}
            `;
          } else if (type === 'product') {
            content = `
              📦 ${item.name}<br>
              Price: ${item.price || 'N/A'}₪<br>
              ${item.description || ''}
            `;
          } else {
            content = JSON.stringify(item, null, 2);
          }

          li.innerHTML = content;
          ul.appendChild(li);
        });

        card.appendChild(ul);
        extraDataSection.appendChild(card);
      }

      // 📌 Role-specific rendering
      if (user.role === 'admin'||user.role === 'manager') {
        renderCard("All Users", allUsers || [], "user");
        renderCard("All Medical Reports", allMedicalReports || [], "report");
        renderCard("All Financial Records", allFinancialRecords || [], "transaction");

      } else if (user.role === 'guardian') {
        renderCard("Your Medical Reports", medicalReports || [], "report");
        renderCard("Your Financial Records", financialRecords || [], "transaction");
      } else if (user.role === 'specialist') {
        renderCard("Created Medical Reports", createdReports || [], "report");
      } else if (user.role === 'marketing_agents') {
        renderCard("Your Products", myProducts || [], "product");
      }

    } else if (response.status === 404) {
      showStatusMessage("⚠️ You don’t have a profile. Please complete it.", false);
      const modal = document.getElementById('completeProfileModal');
      if (modal) modal.classList.remove('hidden');
    }

  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById('message').textContent = "An error occurred while loading data.";
  }
}



document.getElementById('profile-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const profileData = {
    phone: document.getElementById('input-phone').value,
    address: document.getElementById('input-address').value,
    bio: document.getElementById('input-bio').value,
    specialization: document.getElementById('input-specialization').value,
    workplace: document.getElementById('input-workplace').value,
  };

  try {
    const response = await fetch("http://localhost:4000/api/v1/profile/addProfile", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('token')}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) throw new Error("Failed to create profile");
    showStatusMessage("✅ Profile created successfully!", true);
    document.getElementById('message').textContent = "Profile created successfully!";
    setTimeout(() => location.reload(), 700);
  } catch (error) {
    console.error("Error:", error);
    showStatusMessage("❌ An error occurred while loading data.", false);
    document.getElementById('message').textContent = "An error occurred while creating the profile.";
  }
});

// ✅ استدعاء البيانات عند تحميل الصفحة
checkProfile();



function openModal() {
    const modalOverlay = document.getElementById("imageModalOverlay");
    const profileImg = document.getElementById("profile-img").src;
    document.getElementById("modalImage").src = profileImg;
    modalOverlay.classList.remove("hidden");
  }

  function closeImageModal() {
    document.getElementById("imageModalOverlay").classList.add("hidden");
  }

  function triggerImageUpload() {
    document.getElementById("hidden-file-input").click();
  }

  async function uploadNewPhoto() {
    const input = document.getElementById("hidden-file-input");
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:4000/api/v1/updateImage/update", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log(data)
      if (response.ok) {
        document.getElementById("profile-img").src = data.image;
        document.getElementById("modalImage").src = data.image;
        closeImageModal();
        showStatusMessage("✅ Profile image updated successfully", true);

      } else {
        showStatusMessage(data.message || "❌ Failed to update the profile photo", false);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showStatusMessage("❌ An error occurred while uploading the photo", false);
    }
  }


  const redirectToDashboard = (role) => {
    switch (role) {
      
        case "admin":
            window.location.href = "DashbordPage(Admin).html";
            break;
        case "guardian":
            window.location.href = "DashboardPage(Guardian).html";
            break;
        case "specialist":
            window.location.href = "DashboardPage(Specialist).html";
            break;
        case "manager":
            window.location.href = "DashboardPage(Manger).html";
            break;
        case "marketing_agents":
            window.location.href = "DashboardPage(Marketagent).html";    
    
    }
  }
    