async function sendNotification() {
  const message = document.getElementById("message").value.trim();
  const title = document.getElementById("title").value.trim();
  const userIdsRaw = document.getElementById("userIds").value.trim();
  const rolesSelect = document.getElementById("roles");
  const selectedRole = rolesSelect.value;

  const userIds = userIdsRaw ? userIdsRaw.split(',').map(id => id.trim()) : [];
  let roles = [];

  const token = localStorage.getItem("token"); 
  const responseBox = document.getElementById("response");
  responseBox.style.display = "none";

  if ((userIds.length > 0 && selectedRole !== "") || (userIds.length === 0 && selectedRole === "")) {
    responseBox.style.display = "block";
    responseBox.className = "response error";
    responseBox.innerText = "❌ Please fill either user IDs OR roles, not both or none.";
    return;
  }

  if (userIds.length > 0) {
    roles = []; 
  } else if (selectedRole !== "") {
    roles = [selectedRole];
  }

  try {
    const res = await fetch("http://localhost:4000/api/v1/notification/sendNotification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        message,
        userIds,
        roles
      })
    });

    const data = await res.json();
    responseBox.style.display = "block";

    if (res.ok) {
      responseBox.className = "response success";
      responseBox.innerText = "✅ Notification sent successfully.";
      setTimeout(() => {
        window.location.href = "notifications.html";
      }, 700);
    } else {
      responseBox.className = "response error";
      responseBox.innerText = "❌ Failed to send: ${data.message}";
    }
  } catch (err) {
    responseBox.style.display = "block";
    responseBox.className = "response error";
    responseBox.innerText = "Error connecting to server.";
  }
}