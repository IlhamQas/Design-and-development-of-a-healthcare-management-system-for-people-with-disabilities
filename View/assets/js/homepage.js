

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


// تحسين القوائم المنسدلة بالنقر
    
    // جلب جميع العناصر التي تحتوي على قوائم منسدلة
    const dropdowns = document.querySelectorAll('.dropdown');

    // إخفاء كل القوائم عند تحميل الصفحة
    window.addEventListener('DOMContentLoaded', () => {
      dropdowns.forEach(dropdown => {
        const menu = dropdown.querySelector('.dropdown-menu');
        menu.style.display = 'none';
      });
    });

    // إضافة حدث التأشير (mouseover) لإظهار القوائم
    dropdowns.forEach(dropdown => {
      const menu = dropdown.querySelector('.dropdown-menu');

      dropdown.addEventListener('mouseover', () => {
        menu.style.display = 'block'; // إظهار القائمة
      });

      dropdown.addEventListener('mouseout', () => {
        menu.style.display = 'none'; // إخفاء القائمة عند إزالة التأشير
      });
    });









    document.addEventListener("DOMContentLoaded", () => {
            const serviceBoxes = document.querySelectorAll(".service-box");

            const observerServices = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    }
                });
            }, { threshold: 0.5 });

            serviceBoxes.forEach(box => {
                observerServices.observe(box);
            });
        });
  



   document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector(".section");
    
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                section.classList.add("visiblee");
            }
        });
    }, { threshold: 0.2 });  

    observer.observe(section);  
});




    let currentIndex = 0;

    function moveSlide(direction) {
      const carousel = document.querySelector('.carousel-item');
      const slides = document.querySelectorAll('.carousel-img');
      currentIndex += direction;

      if (currentIndex < 0) {
        currentIndex = slides.length - 1;
      } else if (currentIndex >= slides.length) {
        currentIndex = 0;
      }

      const offset = -currentIndex * 10;
     carousel.style.transform = `translateX(${offset}%)`;
    }

    // Auto scroll functionality
    setInterval(() => moveSlide(1), 5000);


  





    let text = document.querySelector(".marquee-text");
    let container = document.querySelector(".marquee-container");
    
    function moveText() {
        let pos = container.clientWidth;
        let speed = 1.5; // سرعة التحرك (كلما زادت القيمة، زادت السرعة)
        
        function step() {
            pos -= speed;
            if (pos < -text.clientWidth) {
                pos = container.clientWidth; // إعادة التعيين عند الخروج من الشاشة
            }
            text.style.left = pos + "px";
            requestAnimationFrame(step);
        }

        step();
    }

    moveText();





    document.addEventListener("DOMContentLoaded", function () {
    let cards = document.querySelectorAll(".department-card");

    let observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.animation = `fadeInUp 0.6s ease-out forwards`;
                    }, index * 400); 
                }
            });
        },
        { threshold: 0.2 }
    );

    cards.forEach((card) => observer.observe(card));
});




document.addEventListener("DOMContentLoaded", function () {
    let header = document.querySelector(".header");
    let lastScrollY = 0;

    window.addEventListener("scroll", function () {
        if (window.scrollY > 100 && lastScrollY <= 100) {
            header.classList.add("scrolled", "fade-in");
        } else if (window.scrollY <= 100 && lastScrollY > 100) {
            header.classList.remove("scrolled", "fade-in");
        }
        lastScrollY = window.scrollY;
    });
});
    