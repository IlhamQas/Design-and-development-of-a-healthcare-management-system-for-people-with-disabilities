
function goBack() {
    window.history.back();
}
 function openModal() {
            const imgSrc = document.getElementById('profile-img').src;
            document.getElementById('modalImage').src = imgSrc;
            document.getElementById('imageModal').style.display = 'flex';
        }

       
        function closeModal() {
            document.getElementById('imageModal').style.display = 'none';
        }

        
        function changeProfilePhoto() {
            const file = document.getElementById('profile-photo').files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profile-img').src = e.target.result;
                closeModal(); 
            }
            reader.readAsDataURL(file);
        }
