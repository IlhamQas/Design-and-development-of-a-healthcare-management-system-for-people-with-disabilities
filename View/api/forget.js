  
  document.getElementById('SendCode').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const email = document.getElementById("email").value;
    const messageEl = document.getElementById("message");
  
    if (!email) {
      showStatusMessage("Please enter your email.", false);
      return;
    }
  
    if (!/\S+@\S+\.\S+/.test(email)) {
      showStatusMessage( "Please enter A valid email.", false);
      return;
    }
  
    try {
      const response = await fetch("http://localhost:4000/api/v1/auth/sendcode", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
  
      const data = await response.json();
      console.log(data);
  
      if (response.ok) {
        showStatusMessage("The code has been sent to your email.", true);
        document.getElementById("forgetpassword").style.display = "none";
        document.getElementById("ResetPassword").style.display = "block";
  
      } else {
        showStatusMessage( data.message || "An error occurred while submitting the code.", false);
      }
    } catch (error) {
      showStatusMessage( "An error occurred while submitting the code.", false);
    }
  });
  
  document.getElementById('ResetPass').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const email = document.getElementById("email1").value;
    const code = document.getElementById("code").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

  
    if (newPassword !== confirmPassword) {
      showStatusMessage( "Passwords do not match.", false);
      return;
    }
    if (!email || !code || !newPassword) {
      showStatusMessage("Please enter all fields.", false);
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showStatusMessage("Please enter a valid email address.", false);
      return;
    }
  
    try {
      const response = await fetch("http://localhost:4000/api/v1/auth/forgetpassword", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email, newPassword })
      });
  
      const data = await response.json();
      console.log(data);
  
      if (response.status === 200) {
        showStatusMessage("Your password has been reset successfully!", true);
        window.location.href = "SignInPage.html";
  
      } else {
        showStatusMessage( data.message || "An error occurred during reset.", false);
      }
    } catch (error) {
      showStatusMessage("An error occurred during reset.", false);
    }
  });
  