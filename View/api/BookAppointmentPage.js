document.getElementById("bookingForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitButton = document.getElementById("submitButtonv");
    submitButton.disabled = true;

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const date = document.getElementById("date").value;
    const notes = document.getElementById("notes").value;
    const phone = document.getElementById("phone").value;

    try {
        const response = await fetch("http://localhost:4000/api/v1/appointment/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: name,
                date: date,
                email: email,
                notes: notes,
                phonenumber: phone
            })
        });

        const result = await response.json();

        if (response.ok) {
        showStatusMessage('Appointment booked successfully, check your Email for more Information!!', true);
        document.getElementById("bookingForm").reset();
    } else {
        showStatusMessage(result.message || "Something went wrong.", false);
    }
} catch (error) {
    showStatusMessage("Failed to connect to the server.", false);
    console.error("Error:", error);
} finally {
    submitButton.disabled = false;
}
});