document.getElementById('LoginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('message');
    const loginBtn = document.getElementById('Login-btn');
    
    try {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        
        const response = await fetch('http://localhost:4000/api/V1/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        
        const data = await response.json();
        if (!response.ok) {
            // Handle validation errors
            if (data.errors) {
                const errorMessages = data.errors.flatMap(errorObj => {
                    return Object.values(errorObj).flat().map(err => err.message);
                });
                messageElement.textContent = errorMessages.join('\n');
            } else {
                messageElement.textContent = "Login failed";
            }
            messageElement.style.color = "red";
            return;
        }; 

        // Success case
        messageElement.textContent = "Login successful!";
        messageElement.style.color = "green";        

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem("justLoggedIn", "true");
        redirectToDashboard(data.user.role);
        
    } catch (error) {
        messageElement.textContent = "Login failed. Please try again.";
        messageElement.style.color = "red";
        console.error('Error:', error);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});



const redirectToDashboard = (role) => {
switch (role) {
    case "admin":
        window.location.href = "DashbordPage(Admin).html";
        break;
    case "guardian":
        window.location.href = "DashboardPage(Guardian).html";
        break;
    case "specialist":
        window.location.href = "DashboardPage(Specialist).html";
        break;
    case "manager":
        window.location.href = "DashboardPage(Manger).html";
        break;
    case "marketing_agents":
        window.location.href = "DashboardPage(Marketagent).html";    

}



const checkUserSession = () => {
const token = localStorage.getItem("token");
const userRole = localStorage.getItem("userRole");

if (!token) {
    alert("You must log in first!");
    window.location.href = "../html/SinginPage.html"; 
} else {
    console.log(`Wellcom , ${localStorage.getItem("username")}! تم تسجيل الدخول بنجاح.`);
}
};
}

