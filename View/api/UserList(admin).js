async function fetchSpecialists() {
    await fetchUsersByRole("specialist", "specialistsContainer");
}

async function fetchManagers() {
    await fetchUsersByRole("manager", "managersContainer");
}

async function fetchGuardians() {
    await fetchUsersByRole("guardian", "guardiansContainer");
}
//market agent
async function fetchmarketagent() {
  await fetchUsersByRole("marketing_agents", "marketingagentsContainer");
}
async function fetchUsersByRole(role, containerId) {
    
    try {
        const response = await fetch("http://localhost:4000/api/v1/admin/allUser",{
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
        }); 
        const data = await response.json();
        if (!data) {
          showStatusMessage("No data available", false);
        }
        
        console.log(data);
        if (data.message === "sucsses") {
            const users = data.find.filter(user => user.role === role);
            const container = document.getElementById(containerId);
          console.log(users);
            container.innerHTML = "";

            users.forEach(user => {
                const userCard = document.createElement("div");
                userCard.classList.add("user-card");
                userCard.id = `user-${user._id}`;
                userCard.innerHTML = `
                    <img src="${user.image || '../assets/images/defultUserProfilepic1.jpg'}" alt="Profile Picture" width="100" height="100">
                    <div style="flex: 1; display: flex; justify-content: space-between; align-items: start;">
                      <div>
                        <strong>ID:</strong> ${user._id}<br>
                        <strong>Full Name:</strong> ${user.name}<br>
                        <strong>Status:</strong> ${user.status} <br>
                        <strong>Email:</strong> ${user.email} <br>
                        <strong>Balance:</strong> ${user.balance}<br>
                      </div>
                      <div class="icon-container">
                        <i class="fa-solid fa-pen" onclick="editUserAccount('${user._id}')"></i>
                        <i class="fa-solid fa-trash" onclick="removeUserAccount('${user._id}')"></i>
                      </div>
                    </div>
                `;
                userCard.style.cursor = "pointer";
                userCard.addEventListener("click", (e) => {
                const clickedInsideIcons = e.target.closest('.icon-container');
                 if (!clickedInsideIcons) {
                     window.location.href = `../Html/viewotherProfile.html?id=${user._id}`;
                   }
           });
                container.appendChild(userCard);
            });
        } else {
            document.getElementById(containerId).innerHTML = "<p>No data available</p>";
        }
    } catch (error) {
        document.getElementById(containerId).innerHTML = `<p>An error occurred: ${error.message}</p>`;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    fetchSpecialists();
    fetchManagers();
    fetchGuardians();
    fetchmarketagent() 
});


function goBack() {
window.history.back();
}


function removeUserAccount(userId) {
  showStatusMessage("⚠️ This will permanently delete the account from the server!", false);

  if (confirm("Are you sure you want to delete this account?")) {
    fetch(`http://localhost:4000/api/v1/admin/deleteUser/${userId}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(async (response) => {
      const data = await response.json();
      if (response.ok) {
        showStatusMessage("User deleted successfully", true);
        
        // إزالة بطاقة المستخدم من الواجهة
        const userCard = document.getElementById(`user-${userId}`);
        if (userCard) userCard.remove();

      } else {
        showStatusMessage(`Error: ${data.message}`, false);
      }
    })
    .catch(error => {
      showStatusMessage("An error occurred while deleting the user: " + error.message, false);
    });
  }
}


  

  function editUserAccount(userId) {
    window.location.href = `../Html/editUsers(Admin).html?id=${userId}`;

  }
  

  