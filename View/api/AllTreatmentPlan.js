const container = document.getElementById('plansContainer');
const searchInput = document.getElementById('searchInput');
const paginationContainer = document.getElementById('pagination');

let allPlans = [];
let currentPage = 1;
const plansPerPage = 1;

const excludedKeys = ['_id', '__v', 'createdBy', 'evaluationId', 'updatedAt', 'guardianId', 'plan_date', 'approval_date', 'createdAt','diagnosis'];


function formatLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function createField(label, value) {
  return `
    <div class="field">
      <label>${label}</label>
      <span>${value ?? 'Not available'}</span>
    </div>
  `;
}

function renderObject(obj) {
  let html = '';
  for (const key in obj) {
    if (excludedKeys.includes(key)) continue;
    const val = obj[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      html += `<div class="section"><h3>${formatLabel(key)}</h3>${renderObject(val)}</div>`;
    } else if (Array.isArray(val)) {
      html += `
        <div class="section">
          <h3>${formatLabel(key)}</h3>
          ${val.map((item) => `<div class="card">${renderObject(item)}</div>`).join('')}
        </div>
      `;
    } else {
      html += createField(formatLabel(key), val);
    }
  }
  return html;
}

function renderPagination(totalPages) {
  paginationContainer.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      renderPlans();
      window.scrollTo(0, 0);
    });
    paginationContainer.appendChild(btn);
  }
}

function renderPlan(plan) {
  const header = `
<div class="section">
<h3>Plan Meta</h3>
${createField('Plan Date', new Date(plan.plan_date).toLocaleDateString())}
${createField('Approval Date', new Date(plan.approval_date).toLocaleDateString())}
${createField('Diagnosis', Array.isArray(plan?.diagnosis) ? plan.diagnosis.join(' ') : plan.diagnosis)}
${createField('Guardian Name', plan?.evaluationId?.guardianId?.name)}
${createField('Guardian Email', plan?.evaluationId?.guardianId?.email)}
</div>
`;

return `<div class="card">
${header}
${renderObject(plan)}
</div>`;
}

async function fetchPlans() {
  const token = localStorage.getItem("token");
  if (!token) {
    container.innerHTML = "<p class='no-results'>You must log in to view the plans.</p>";
    return;
  }

  try {
    const res = await fetch("http://localhost:4000/api/v1/TreatmentPlan/show", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = await res.json(); 
    console.log(data);
    allPlans = data.data || [];
    renderPlans();
  } catch (error) {
    console.error("Error:", error);
    container.innerHTML = "<p class='no-results'>Failed to load plans.</p>";
  }
}

function renderPlans() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredPlans = allPlans.filter(plan => {
    const guardianName = plan?.evaluationId?.guardianId?.name || '';
    return guardianName.toLowerCase().includes(searchTerm);
  });

  const totalPages = Math.ceil(filteredPlans.length / plansPerPage);
  const startIndex = (currentPage - 1) * plansPerPage;
  const endIndex = startIndex + plansPerPage;
  const plansToDisplay = filteredPlans.slice(startIndex, endIndex);

  container.innerHTML = '';

  if (plansToDisplay.length === 0) {
    container.innerHTML = `<p class="no-results">No plans found.</p>`;
  } else {
    plansToDisplay.forEach(plan => {
      container.innerHTML += renderPlan(plan);
    });
  }

  renderPagination(totalPages);
}

searchInput.addEventListener('input', () => {
  currentPage = 1;
  renderPlans();
});

fetchPlans();