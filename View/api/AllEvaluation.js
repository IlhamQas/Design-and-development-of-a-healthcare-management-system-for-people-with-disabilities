

  const container = document.getElementById('evaluationsContainer');
  const searchInput = document.getElementById('searchInput');
  let evaluations = [];
  let filteredEvaluations = [];
  let currentPage = 1;
  const itemsPerPage = 1;

  const excludedKeys = ['_id', '__v', 'guardianId', 'specialistId', 'createdAt', 'updatedAt'];

  function formatLabel(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  function createField(label, value) {
    return `
      <div class="field">
        <label>${label}</label>
        <span>${value ?? 'لا يوجد تقييم'}</span>
      </div>
    `;
  }

  function renderObject(obj, level = 1) {
    let html = '';
    for (const key in obj) {
      if (excludedKeys.includes(key)) continue;
      const val = obj[key];

      if (val && typeof val === 'object' && !Array.isArray(val)) {
        html += level === 1
          ? `<section class="section"><h3>${formatLabel(key)}</h3>${renderObject(val, level + 1)}</section>`
          : `<div class="subsection"><h4>${formatLabel(key)}</h4>${renderObject(val, level + 1)}</div>`;
      } else if (Array.isArray(val)) {
        if (val.length === 0) {
          html += createField(formatLabel(key), 'لا توجد بيانات');
        } else {
          html += level === 1
            ? `<section class="section"><h3>${formatLabel(key)}</h3>`
            : `<div class="subsection"><h4>${formatLabel(key)}</h4>`;

          val.forEach((item, idx) => {
            if (typeof item === 'object') {
              html += `<div class="subsection"><h4>${formatLabel(key)} ${idx + 1}</h4>${renderObject(item, level + 2)}</div>`;
            } else {
              html += createField(`${formatLabel(key)} ${idx + 1}`, item);
            }
          });

          html += level === 1 ? `</section>` : `</div>`;
        }
      } else {
        html += createField(formatLabel(key), val);
      }
    }
    return html;
  }

  async function fetchEvaluations() {
    const token = localStorage.getItem("token");
    if (!token) {
      container.innerHTML = "<p class='no-results'>You must be logged in to view this page.</p>";
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/v1/evaluation/getall", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      evaluations = data.evaluations || [];
      filteredEvaluations = evaluations;

      renderEvaluations();
    } catch (err) {
      console.error(err);
      container.innerHTML = "<p class='no-results'>Failed to load evaluations.</p>";
    }
  }

  function renderEvaluations() {
    container.innerHTML = '';

    if (filteredEvaluations.length === 0) {
      container.innerHTML = '<p class="no-results">No evaluations found.</p>';
      return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredEvaluations.slice(startIndex, endIndex);

    pageItems.forEach(evaluation => {
      const guardianName = evaluation.guardianId?.name || "Unknown Guardian";
      const specialistName = evaluation.specialistId?.name || "Unknown Specialist";
      const card = document.createElement('div');
      card.className = 'card';

      const headerInfo = `
        <div class="field">
          <label> Name</label>
          <span>${guardianName}</span>
        </div>
        <div class="field">
          <label>Specialist</label>
          <span>${specialistName}</span>
        </div>
        <div class="field">
          <label>Created At</label>
          <span>${new Date(evaluation.createdAt).toLocaleDateString()}</span>
        </div>
      `;

      card.innerHTML = headerInfo + renderObject(evaluation);
      container.appendChild(card);
    });

    renderPagination();
  }
  function renderPagination() {
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);
  if (totalPages <= 1) return;

  const paginationDiv = document.createElement('div');
  paginationDiv.className = 'pagination';
  paginationDiv.style.textAlign = 'center';
  paginationDiv.style.marginTop = '20px';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.style.margin = '0 5px';
    btn.style.padding = '8px 14px';
    btn.style.border = '1px solid #ccc';
    btn.style.borderRadius = '6px';
    btn.style.backgroundColor = i === currentPage ? '#5f9ddb' : '#fff';
    btn.style.color = i === currentPage ? '#fff' : '#333';
    btn.style.cursor = 'pointer';

    btn.addEventListener('click', () => {
      currentPage = i;
      renderEvaluations();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    paginationDiv.appendChild(btn);
  }

  container.appendChild(paginationDiv);
}


  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    filteredEvaluations = evaluations.filter(ev =>
      ev.guardianId?.name?.toLowerCase().includes(query)
    );
    currentPage = 1;
    renderEvaluations();
  });

  fetchEvaluations();

