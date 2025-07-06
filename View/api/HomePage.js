      
  document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');

    if (!token) {
        return;
    }

    const signInBtn = document.getElementById("SinginBtn");
    const DashBtn = document.getElementById("DashBtn");

    if (signInBtn && DashBtn) {
        signInBtn.style.display = "none";
        DashBtn.style.display = "inline-block";
        document.getElementById("bookappointmentbtn").style.display = "none";

        const Data = localStorage.getItem('user');
        console.log(JSON.parse(Data));
        const profileImg = document.getElementById('user-icon');

        if (Data && profileImg) {
            try {
                const profile = JSON.parse(Data);
                if (profile.image) {
                    profileImg.src = profile.image;
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
});



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
        window.location.href = 'Html/SignInPage.html';
        return;
    }

    const decodedToken = decodeToken(token);
    const userRole = decodedToken.role; 
switch (userRole) {
 case "admin":
   window.location.href = "Html/DashbordPage(Admin).html";
   break;
case "guardian":
   window.location.href = "Html/DashboardPage(Guardian).html";
   break;
case "specialist":
   window.location.href = "Html/DashboardPage(Specialist).html";
   break;
case "manager":
   window.location.href = "Html/DashboardPage(Manger).html";
   break;
case "marketing_agents":
   window.location.href = "Html/DashboardPage(Marketagent).html";    }

}
 


function redirectToshop(){
 window.location.href = 'Html/shop.html';
}


