if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

  
function handleScroll() {
            const section = document.getElementById("animated-section");
            const sectionPosition = section.getBoundingClientRect().top;
            const screenHeight = window.innerHeight;

            if (sectionPosition < screenHeight * 0.85) {
                section.classList.add("visible");
            }
        }

   
    window.addEventListener("scroll", handleScroll);

    const dropdowns = document.querySelectorAll('.dropdown');

    window.addEventListener('DOMContentLoaded', () => {
      dropdowns.forEach(dropdown => {
        const menu = dropdown.querySelector('.dropdown-menu');
        menu.style.display = 'none';
      });
    });


    dropdowns.forEach(dropdown => {
      const menu = dropdown.querySelector('.dropdown-menu');

      dropdown.addEventListener('mouseover', () => {
        menu.style.display = 'block'; 
      });

      dropdown.addEventListener('mouseout', () => {
        menu.style.display = 'none'; 
      });
    });






