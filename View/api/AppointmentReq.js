async function fetchRequests() {
    try {
      const response = await fetch("http://localhost:4000/api/v1/appointment/all", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        displayRequests(data);
      } else {
        alert("❌ Failed to load requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    }
  }

  function displayRequests(requests) {
    const container = document.getElementById("requests");
    container.innerHTML = '';

    if (requests.length === 0) {
      container.innerHTML = `<p class="no-requests">There are no appointment requests at the moment.</p>`;
      return;
    }

    requests.forEach(request => {
      const card = document.createElement("div");
      card.classList.add("request-card");
      card.innerHTML = `
        <div class="request-details">
          <p><strong>Name:</strong> ${request.name}</p>
          <p><strong>Email:</strong> ${request.email}</p>
          <p><strong>Date:</strong> ${new Date(request.date).toLocaleDateString()}</p>
          <p><strong>Notes:</strong> ${request.notes || 'No additional notes'}</p>
        </div>
        <div class="request-actions">
          <button class="approve-btn" onclick="approveRequest('${request._id}')">Approve</button>
          <button class="reject-btn" onclick="rejectRequest('${request._id}')">Reject</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  async function updateRequestStatus(id, status) {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/pendingAppointment/change/${id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      const result = await res.json();
      if (res.ok) {
        showStatusMessage(`✅ Request ${status === 'approved' ? 'approved' : 'rejected'} successfully.`, true);
        fetchRequests(); 
      } 
    } catch (err) {
      console.error(`${status} error:`, err);
      alert("⚠️ Server error");
    }
  }

  function approveRequest(id) {
    updateRequestStatus(id, "approved");
  }

  function rejectRequest(id) {
    updateRequestStatus(id, "cancelled");
  }

  fetchRequests();