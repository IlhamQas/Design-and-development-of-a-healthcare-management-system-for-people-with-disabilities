
    let sessionsWithImprovements = [];
    let allGuardians = [];
     

  const user = JSON.parse(localStorage.getItem("user"));
  let url = "";

  if(user.role === "specialist"){
    url="http://localhost:4000/api/v1/sessionRecord/getallImprovmentbydoctor"
  }else if (user.role === "manager"){
    url="http://localhost:4000/api/v1/sessionRecord/getallImprovment"
  } else {
  alert("You don't have permission to access this page.");
}


    async function fetchData() {
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        console.log(data);
        if (res.ok) {
          sessionsWithImprovements = data.sessionsWithImprovements || [];
  
          const guardianMap = new Map();
          sessionsWithImprovements.forEach(session => {
            if (!guardianMap.has(session.guardian.id)) {
                guardianMap.set(session.guardian.id, session.guardian.name);
            }
          });
          allGuardians = Array.from(guardianMap.entries()); 
          renderGuardianOptions();
          renderCards(sessionsWithImprovements);
        } else {
          alert(data.message || "Error fetching data");
        }
      } catch (error) {
        alert("Failed to connect to server");
        console.error(error);
      }
    }
  
    function renderGuardianOptions() {
      const select = document.getElementById('guardianSelect');
      allGuardians.forEach(([id, name]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name;
        select.appendChild(option);
      });
    }

    function parseDate(dateStr) {
      return new Date(dateStr);
    }
  
    function renderCards(data) {
      const container = document.getElementById('cardsContainer');
      container.innerHTML = '';
  
      if (data.length === 0) {
        container.innerHTML = '<p class="no-data">No data to display</p>';
        return;
      }
  
      const grouped = {};
      data.forEach(session => {
        const id = session.guardian.id;
        if (!grouped[id]) {
          grouped[id] = {
            guardian: session.guardian,
            sessions: []
          };
        }
        grouped[id].sessions.push(session);
      });
  
      Object.values(grouped).forEach(group => {
        const card = document.createElement('div');
        card.className = 'card';
  
        card.innerHTML = `
          <div class="guardian-name">${group.guardian.name}</div>
          <table>
            <thead>
              <tr>
                <th>Session Date</th>
                <th>Improvement Date</th>
                <th>Improvement Level</th>
                <th>Note</th>
                <th>Doctor</th>
              </tr>
            </thead>
            <tbody id="tbody-${group.guardian.id}">
            </tbody>
          </table>
          <canvas id="chart-${group.guardian.id}" height="150"></canvas>
        `;
  
        container.appendChild(card);

if (user.role === "specialist") {
  const guardianId = group.guardian.id;
  card.style.cursor = "pointer";
  card.addEventListener("click", () => {
    window.location.href = `../Html/SessionNote(specialist).html?guardianId=${guardianId}`;
  });
}

  
        const tbody = card.querySelector(`#tbody-${group.guardian.id}`);
        let allImprovements = [];
  
        group.sessions.forEach(session => {
          session.improvements.forEach(imp => {
            allImprovements.push({
              sessionDate: session.sessionDate,
              date: imp.date,
              improvementLevel: imp.improvementLevel,
              note: imp.note,
              doctorName: imp.doctorName
            });
          });
        });
  
        allImprovements.sort((a, b) => new Date(a.date) - new Date(b.date));
  
        if (allImprovements.length === 0) {
          tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#999;">No improvements available</td></tr>`;
        } else {
            allImprovements.forEach(imp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td>${imp.sessionDate}</td>
            <td>${new Date(imp.date).toLocaleDateString()}</td>
            <td class="improvement-cell"">${imp.improvementLevel}</td>
            <td>${imp.note || '-'}</td>
            <td>${imp.doctorName}</td>
            `;

            tbody.appendChild(tr);
          });
        }
  
        createChart(group.guardian.id, allImprovements);
      });
    }
  
    function createChart(guardianId, improvements) {
      const ctx = document.getElementById(`chart-${guardianId}`).getContext('2d');
      if (!ctx) return;

      if (window['chart_' + guardianId]) {
        window['chart_' + guardianId].destroy();
      }
      

      const labels = improvements.map(imp => new Date(imp.date).toLocaleDateString());
      const dataPoints = improvements.map(imp => imp.improvementLevel);
  
      window['chart_' + guardianId] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Improvement Level',
            data: dataPoints,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              stepSize: 1
            }
          }
        }
      });
    }
  
    function filterAndRender() {
      const selectedId = document.getElementById('guardianSelect').value;
      const filtered = sessionsWithImprovements.filter(session =>
        !selectedId || session.guardian.id === selectedId
      );
      renderCards(filtered);
    }
  
    document.getElementById('guardianSelect').addEventListener('change', filterAndRender);
  
    fetchData();
  