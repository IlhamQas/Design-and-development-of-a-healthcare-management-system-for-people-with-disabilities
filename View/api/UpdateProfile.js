document.getElementById('update-profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    let profileData = {};
    const fields = ["phone", "address", "bio", "specialization", "workplace"];

    fields.forEach(field => {
        const value = document.getElementById(`input-${field}`).value.trim();
        if (value) {
            profileData[field] = value;
        }
    });
    if (Object.keys(profileData).length === 0) {
        showStatusMessage("No changes made!", false);
        return;
    }

    try {
        const response = await fetch("http://localhost:4000/api/v1/profile/updateProfile", {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(profileData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to update profile");
        }

        showStatusMessage("Profile updated successfully!", true);

        setTimeout(() => {
            window.location.href = "UserprofilePage.html";
        }, 1000);

    } catch (error) {
        console.error("Error:", error);
        showStatusMessage("An error occurred while updating the profile.", false);
    }
});