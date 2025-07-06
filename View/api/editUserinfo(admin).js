const updateForm = document.getElementById("updateForm");
const userIdUpdateInput = document.getElementById("userIdUpdate");
const userNameInput = document.getElementById("userName");
const userEmailInput = document.getElementById("userEmail");
const userRoleInput = document.getElementById("userRole");

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

if (userId) {
    userIdUpdateInput.value = userId;
    userIdUpdateInput.readOnly = true;
}

updateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const userData = {};

    if (userNameInput.value) {
        userData.name = userNameInput.value;
    }
    if (userEmailInput.value) {
        userData.email = userEmailInput.value;
    }
    if (userRoleInput.value) {
        userData.role = userRoleInput.value;
    }

    if (Object.keys(userData).length === 0) {
        showStatusMessage("⚠️ No changes detected.", false);
        return;
    }

    fetch(`http://localhost:4000/api/v1/admin/user/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data && data.findUser && data.findUser._id) {
            fetch(`http://localhost:4000/api/v1/admin/update/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(userData)
            })
            .then(res => res.json())
            .then(updatedUser => {
                showStatusMessage(`✅ User updated successfully: ${updatedUser.name}`);
                setTimeout(() => {
                    window.location.href = "../Html/UserListPage.html";
                }, 1500);
            })
            .catch(err => {
                console.error(err);
                showStatusMessage("❌ Failed to update user data.", false);
            });
        } else {
            showStatusMessage("❌ No user found with this ID.", false);
        }
    })
    .catch(err => {
        console.error(err);
        showStatusMessage("❌ An error occurred while checking the user.", false);
    });
});
