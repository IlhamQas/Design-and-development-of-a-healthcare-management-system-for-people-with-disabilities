document.getElementById('addDeptForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const token = localStorage.getItem('token');
  const submitButton = this.querySelector('button[type="submit"]');

  if (!name) {
    showStatusMessage("⚠️ Please enter a department name.", false);
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Adding...";

  try {
    const response = await fetch('http://localhost:4000/api/v1/dep/addDep', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });

    const result = await response.json();

    if (response.ok) {
      showStatusMessage("✅ " + result.message, true);
      document.getElementById('addDeptForm').reset();
    } else {
      showStatusMessage("❌ " + (result.message || "Failed to add department"), false);
    }
  } catch (error) {
    console.error(error);
    showStatusMessage("⚠️ Server error. Please try again.", false);
  }

  submitButton.disabled = false;
  submitButton.textContent = "Add Department";
});
