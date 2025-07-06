

function toggleDropdown(id) {
    document.querySelectorAll(".dropdown-content").forEach(dropdown => {
        if (dropdown.id !== id) {
            dropdown.style.display = "none";
        }
    });

    let dropdown = document.getElementById(id);
    dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
}

document.addEventListener("click", function(event) {
    if (!event.target.closest(".dropdown")) {
        document.querySelectorAll(".dropdown-content").forEach(dropdown => {
            dropdown.style.display = "none";
        });
    }
    });
    
    
    
    function openModal(src) {
        var modal = document.getElementById("mediaModal");
        var modalImg = document.getElementById("modalImage");
        modal.style.display = "block";
        modalImg.src = src;
      }
    
      // Function to Close Modal
      function closeModal() {
        var modal = document.getElementById("mediaModal");
        modal.style.display = "none";
      }
    
      // Close Modal on Outside Click
      window.onclick = function(event) {
        var modal = document.getElementById("mediaModal");
        if (event.target === modal) {
          closeModal();
        }
      }