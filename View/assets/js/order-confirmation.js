
function decodeToken(token) {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
}

function getToken() {
    return localStorage.getItem('token');
}

function redirectToDashboard() {
    const token = getToken();

    if (!token) {
        window.location.href = 'SignInPage.html';
        return;
    }

    const decodedToken = decodeToken(token);
    const userRole = decodedToken.role; 
switch (userRole) {
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
   window.location.href = "DashboardPage(Manager).html";
   break;
case "marketing_agents":
   window.location.href = "DashboardPage(Marketagent).html";    }

}

function showSuccessMessage() {
    const successContainer = document.getElementById('success-container');
    setTimeout(() => {
        successContainer.style.display = 'flex';
        setTimeout(() => {
            successContainer.style.opacity = 1; 
        }, 150);

        setTimeout(() => {
            redirectToDashboard();
        }, 3000); 
    }, 500);
}
showSuccessMessage();