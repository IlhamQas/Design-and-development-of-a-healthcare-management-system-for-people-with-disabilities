
      function formatLabel(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  const excludedKeys = ['_id', '__v', 'guardianId', 'specialistId', 'createdAt', 'updatedAt'];

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
      } else {
        html += createField(formatLabel(key), val);
      }
    }
    return html;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const evalContainer = document.getElementById("evaluations-container");

    if (!token) {
      evalContainer.innerHTML = "<p class='error'>يجب تسجيل الدخول</p>";
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/v1/evaluation/getbySpecialist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.evaluations || data.evaluations.length === 0) {
        evalContainer.innerHTML = `<p class='error'>${data.message || "لا يوجد تقييمات"}</p>`;
        return;
      }

      let html = '';

      data.evaluations.forEach((evalData, index) => {
        const specialistName = evalData.specialistId?.name || "غير متاح";
        const specialistId = evalData.specialistId?._id || "#";
        const guardianName = evalData.guardianId?.name || "Guardian";

        html += `
          <div class="container">
            <div class="section">
              <h3>Evaluation number ${index + 1}</h3>
              <div class="field"><label>Child name :</label><span>${guardianName}</span></div>
              <div class="field"><label>Written by :</label>
                <span><a href="../Html/viewotherProfile.html?id=${specialistId}" style="color:#2980b9">${specialistName}</a></span>
              </div>
              ${renderObject(evalData)}
            </div>
          </div>
        `;
      });

      evalContainer.innerHTML = html;

    } catch (err) {
      console.error("Fetch error:", err);
      evalContainer.innerHTML = "<p class='error'>فشل في تحميل التقييمات</p>";
    }
  });
