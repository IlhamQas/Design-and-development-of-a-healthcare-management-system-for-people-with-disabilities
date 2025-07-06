
function closeRightSidebar() {
    const rightSidebar = document.getElementById('right-sidebar');
    const openRightpar = document.querySelector('.open-btn');
    rightSidebar.style.transform = 'translatey(100%)';
    setTimeout(() => {
    openRightpar.style.display = 'block'; 
     }, 400);

    }


    function openRightSidebar() {
        const rightSidebar = document.getElementById('right-sidebar');
        const openRightpar = document.querySelector('.open-btn');
        rightSidebar.style.display='flex';
        rightSidebar.style.transform = 'translateX(0)';
        openRightpar.style.display = 'none';  
        
    }


    
    let weeklySessions = []; 


    async function fetchGuardianSchedule(guardianId) {
        try {
          const res = await fetch(`http://localhost:4000/api/v1/Guardian/getSchedule/${guardianId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
      
          const data = await res.json();
          const schedule = data.guardianRequests?.[0];
      
          console.log(schedule); 
      
          if (res.ok) {
            console.log("Weekly Sessions:", weeklySessions);

            if (schedule?.sessions?.length) {
              weeklySessions = schedule.sessions;
              renderCalendar(currentMonth, currentYear);
            }
            }
        } catch (err) {
          console.error(err);
        }
      }
          


   
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    function renderCalendar(month, year) {
        const monthYearDiv = document.getElementById('month-year');
        const calendarGrid = document.getElementById('calendar-grid');
        calendarGrid.innerHTML = '';
    
        monthYearDiv.innerText = `${months[month]} ${year}`;
    
        const firstDay = new Date(year, month).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
    
        const dayMap = {
            "Sunday": 0,
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6
        };
    
        const markedDays = new Set();
    
        weeklySessions.forEach(session => {
            const weekday = dayMap[session.dayOfWeek || session.newDay];
            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(year, month, d);
                if (date.getDay() === weekday) {
                    markedDays.add(d);
                }
            }
        });
    
        for (let i = 0; i < firstDay; i++) {
            const blankDiv = document.createElement('div');
            calendarGrid.appendChild(blankDiv);
        }
    
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
    
            const circle = document.createElement('div');
            circle.innerText = i;
            circle.style.width = "28px";
            circle.style.height = "28px";
            circle.style.borderRadius = "50%";
            circle.style.border = "2px solid #ff0000";
            circle.style.display = "flex";
            circle.style.alignItems = "center";
            circle.style.justifyContent = "center";
            circle.style.margin = "0 auto";
            
    
            if (markedDays.has(i)) {
                dayDiv.appendChild(circle);
                dayDiv.style.cursor = 'pointer';
                dayDiv.addEventListener('click', () => {
                    showSessionsForDay(i, month, year);
                });
            } else {
                dayDiv.innerText = i;
            }
    
            calendarGrid.appendChild(dayDiv);
        }
    }
    
    function showSessionsForDay(day, month, year) {
       
        const date = new Date(year, month, day);
        const weekdayIndex = date.getDay();
    
        const dayMapReverse = {
            0: "Sunday",
            1: "Monday",
            2: "Tuesday",
            3: "Wednesday",
            4: "Thursday",
            5: "Friday",
            6: "Saturday"
        };
    
        const dayName = dayMapReverse[weekdayIndex];

        const sessionsForDay = weeklySessions.filter(session => {
            return session.dayOfWeek === dayName || session.newDay === dayName;
        });
    
        let html = `<h4>Sessions on ${dayName}, ${months[month]} ${day}, ${year}</h4>`;
        if (sessionsForDay.length === 0) {
            html += `<p>No sessions scheduled for this day.</p>`;
        } else {
            html += `<ul>`;
            sessionsForDay.forEach(session => {
                html += `<li>
                    <strong>Time:</strong> ${session.newTime || session.time || 'N/A'}<br>
                    <strong>Specialist:</strong> ${session.specialistId?.name || 'Unknown'}<br>
                    <strong>Department:</strong> ${session.department?.name || 'Unknown'}
                </li>`;
            });
            html += `</ul>`;
        }

        let appointmentsDiv = document.querySelector('.appointments');
        if (!appointmentsDiv) {
            appointmentsDiv = document.createElement('div');
            appointmentsDiv.classList.add('appointments');
            document.getElementById('right-sidebar').appendChild(appointmentsDiv);
        }
        appointmentsDiv.innerHTML = html;
    }
    

  


    let doctorSessions = [];

    async function fetchDoctorSchedule(doctorId) {
        try {
            const res = await fetch(`http://localhost:4000/api/v1/Doctor/getS/${doctorId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            const data = await res.json();
            if (res.ok) {
                // Flatten all booked sessions
                doctorSessions = [];
                data.schedule.forEach(day => {
                    const dayName = day.dayOfWeek;
                    day.times.forEach(slot => {
                        if (slot.status === "Booked" && slot.guardian) {
                            doctorSessions.push({
                                dayOfWeek: dayName,
                                time: slot.time,
                                guardian: slot.guardian,
                                department: slot.guardian?.department,
                                specialist: slot.guardian?.name
                            });
                        }
                    });
                });
    
                renderDoctorCalendar(currentMonth, currentYear);
            }
        } catch (err) {
            console.error(err);
        }
    }
    

    function renderDoctorCalendar(month, year) {
        const monthYearDiv = document.getElementById('month-year');
        const calendarGrid = document.getElementById('calendar-grid');
        calendarGrid.innerHTML = '';
    
        monthYearDiv.innerText = `${months[month]} ${year}`;
        const firstDay = new Date(year, month).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
    
        const dayMap = {
            "Sunday": 0,
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6
        };
    
        const markedDays = new Set();
        doctorSessions.forEach(session => {
            const weekday = dayMap[session.dayOfWeek];
            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(year, month, d);
                if (date.getDay() === weekday) {
                    markedDays.add(d);
                }
            }
        });
    
        for (let i = 0; i < firstDay; i++) {
            const blankDiv = document.createElement('div');
            calendarGrid.appendChild(blankDiv);
        }
    
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
    
            const circle = document.createElement('div');
            circle.innerText = i;
            circle.style.width = "28px";
            circle.style.height = "28px";
            circle.style.borderRadius = "50%";
            circle.style.border = "2px solid #007bff";
            circle.style.display = "flex";
            circle.style.alignItems = "center";
            circle.style.justifyContent = "center";
            circle.style.margin = "0 auto";
    
            if (markedDays.has(i)) {
                dayDiv.appendChild(circle);
                dayDiv.style.cursor = 'pointer';
                dayDiv.addEventListener('click', () => {
                    showDoctorSessionsForDay(i, month, year);
                });
            } else {
                dayDiv.innerText = i;
            }
    
            calendarGrid.appendChild(dayDiv);
        }
    }
    


    function showDoctorSessionsForDay(day, month, year) {
        const date = new Date(year, month, day);
        const weekdayIndex = date.getDay();
        const dayMapReverse = {
            0: "Sunday",
            1: "Monday",
            2: "Tuesday",
            3: "Wednesday",
            4: "Thursday",
            5: "Friday",
            6: "Saturday"
        };
        const dayName = dayMapReverse[weekdayIndex];
    
        const sessionsForDay = doctorSessions.filter(session => session.dayOfWeek === dayName);
    
        let html = `<h4>Sessions on ${dayName}, ${months[month]} ${day}, ${year}</h4>`;
        if (sessionsForDay.length === 0) {
            html += `<p>No sessions scheduled for this day.</p>`;
        } else {
            html += `<ul>`;
            sessionsForDay.forEach(session => {
                html += `<li>
                    <strong>Time:</strong> ${session.time}<br>
                    <strong>Guardian:</strong> ${session.guardian?.name || 'Unknown'}<br>
                    <strong>Department:</strong> ${session.department?.name || 'Unknown'}
                </li>`;
            });
            html += `</ul>`;
        }
    
        let appointmentsDiv = document.querySelector('.appointments');
        if (!appointmentsDiv) {
            appointmentsDiv = document.createElement('div');
            appointmentsDiv.classList.add('appointments');
            document.getElementById('right-sidebar').appendChild(appointmentsDiv);
        }
        appointmentsDiv.innerHTML = html;
    }
    
    
   
        const role = JSON.parse(localStorage.getItem('user'))?.role;
        const userid = JSON.parse(localStorage.getItem('user'))?._id;
    
        if (role === "specialist") {
            fetchDoctorSchedule(userid);
        } else if (role === "guardian") {
            fetchGuardianSchedule(userid);
        } else {
            
        }
 


        const today = new Date();
        const currentDate = {
          month: today.getMonth(),
          year: today.getFullYear()
        };
        if(document.getElementById('prev-month')){
        document.getElementById('prev-month').addEventListener('click', () => {
          if (
            (currentYear < currentDate.year) ||
            (currentYear === currentDate.year && currentMonth <= currentDate.month)
          ) {
            return;
          }
        
          currentMonth--;
          if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
          }
        
          if (role === 'specialist') {
            renderDoctorCalendar(currentMonth, currentYear);
          } else {
            renderCalendar(currentMonth, currentYear);
          }
        });
        
    }

    
    if( document.getElementById('next-month')){
    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        if (role === 'specialist') {
            renderDoctorCalendar(currentMonth, currentYear);
        } else {
            renderCalendar(currentMonth, currentYear);
        }
    });
 }

    if (role === "specialist") {
        fetchDoctorSchedule(userid);
        renderDoctorCalendar(currentMonth, currentYear);
    } else if (role === "guardian") {
        fetchGuardianSchedule(userid);
        renderCalendar(currentMonth, currentYear);
    }
    
   
    
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


  function closeModal() {
    var modal = document.getElementById("mediaModal");
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    var modal = document.getElementById("mediaModal");
    if (event.target === modal) {
      closeModal();
    }
  }