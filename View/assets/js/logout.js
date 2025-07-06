function logout() {
    localStorage.removeItem("token");  
    localStorage.removeItem("user");  
    localStorage.removeItem("profile"); 
    localStorage.removeItem("cart");
    window.location.href = "../HomePage.html"; 
}