function showStatusMessage(message, isSuccess = true) {
    const msgDiv = document.getElementById("status-message");
    msgDiv.textContent = message;
    msgDiv.style.backgroundColor = isSuccess ? "#d4edda" : "#f8d7da";
    msgDiv.style.color = isSuccess ? "#155724" : "#721c24";
    msgDiv.style.border = isSuccess ? "1px solid #c3e6cb" : "1px solid #f5c6cb";
    msgDiv.style.display = "block";
  
    setTimeout(() => {
      msgDiv.style.display = "none";
    }, 3000);
  }

  // <script src="../assets/js/apimessages.js"></script>