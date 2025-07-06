function parseJwt(token) {
    try {
      const base64Payload = token.split('.')[1];
      const payload = atob(base64Payload);
      return JSON.parse(payload);
    } catch (e) {
      return null;
    }
  }
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user._id;
  
  console.log("User ID length:", userId);
  
  
  window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.email) {
        const emailInput = document.getElementById('email');
        emailInput.value = payload.email;
        emailInput.readOnly = true;
      }
    }
  });
  document.getElementById("accountSettingsForm").addEventListener("submit", async function(event) {
    event.preventDefault();
  
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
  
    if (!password || !confirmPassword) {
      showStatusMessage("⚠️ All fields are required!", false);
      return;
    }
    if (password !== confirmPassword) {
      showStatusMessage("❌ Passwords do not match", false);
      return;
    }
  
    const updatedData = {
      newPassword: password
    };
  
    try {
      const response = await fetch("http://localhost:4000/api/v1/updateImage/updatePassword", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedData)
      });
  
      if (response.ok) {
        showStatusMessage("✅ Password updated successfully!", true);
        setTimeout(() => {
          window.location.href = "UserprofilePage.html";
        }, 1500);
      } else {
        const result = await response.json();
        showStatusMessage("❌ " + (result.message || "An error occurred while updating."), false);
      }
    } catch (error) {
      console.error("Error:", error);
      showStatusMessage("⚠️ Could not connect to the server!", false);
    }
  });
  