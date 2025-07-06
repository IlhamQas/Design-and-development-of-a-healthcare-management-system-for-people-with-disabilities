document.addEventListener("DOMContentLoaded", async () => {
    try {
      const tableBody = document.querySelector("#paymentTable tbody");
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:4000/api/v1/financial/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        alert(data.message || "An error occurred");
        return;
      }

      if (data.find.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="5">No records found for this child ID.</td>`;
        tableBody.appendChild(row);
      } else {
        data.find.forEach(record => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${new Date(record.createdAt).toLocaleString()}</td> 
            <td>${record.userId}</td>
            <td>${record.amount} ₪</td>
            <td>${record.type === "credit" ? "Credit" : "Debit"}</td>
            <td>${record.description || "-"}</td>
            <td>${record.balanceAfterTransaction} ₪</td>
           
          `;
          tableBody.appendChild(row);
        });
      }

    } catch (error) {
      console.error("Fetch error:", error);
      alert("Error fetching payment records.");
    }
  });
 
 document.getElementById("searchButton").addEventListener("click", async () => {
    const childId = document.getElementById("childId").value.trim();
    const tableBody = document.querySelector("#paymentTable tbody");
    tableBody.innerHTML = "";

    if (!childId) {
      alert("Please enter a child ID.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:4000/api/v1/financial/find?id=${childId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "An error occurred");
        return;
      }

      if (data.records.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="5">No records found for this child ID.</td>`;
        tableBody.appendChild(row);
      } else {
        data.records.forEach(record => {
          const row = document.createElement("tr");
          row.innerHTML = `
          <td>${new Date(record.createdAt).toLocaleString()}</td> 
            <td>${record.userId}</td>
            <td>${record.amount} ₪</td>
            <td>${record.type === "credit" ? "Credit" : "Debit"}</td>
            <td>${record.description || "-"}</td>
          `;
          tableBody.appendChild(row);
        });
      }

    } catch (error) {
      console.error("Fetch error:", error);
      alert("Error fetching payment records.");
    }
  });


