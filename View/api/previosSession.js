
    let allNotes = [];
    const token = localStorage.getItem('token');

    async function fetchNotes() {
      try {
        const response = await fetch('http://localhost:4000/api/v1/sessionRecord/getG', {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        allNotes = data.notes;
        populateFilterOptions(allNotes);
        renderTable(allNotes);
      } catch (err) {
        console.error("Error:", err);
      }
    }

    function populateFilterOptions(notes) {
      const set = new Set();
      notes.forEach(n => n.departmentName && set.add(n.departmentName));

      const filter = document.getElementById('departmentFilter');
      set.forEach(dep => {
        const opt = document.createElement('option');
        opt.value = dep;
        opt.textContent = dep;
        filter.appendChild(opt);
      });

      filter.addEventListener('change', () => {
        const selected = filter.value;
        const filtered = selected === 'All'
          ? allNotes
          : allNotes.filter(n => n.departmentName === selected);
        renderTable(filtered);
      });
    }

    function renderTable(notes) {
      const tbody = document.querySelector('#notesTable tbody');
      const noNotesMsg = document.getElementById('noNotes');
      tbody.innerHTML = '';

      if (notes.length === 0) {
        noNotesMsg.style.display = 'block';
        return;
      } else {
        noNotesMsg.style.display = 'none';
      }

      notes.forEach(note => {
        const tr = document.createElement('tr');
        const stars = '★'.repeat(note.rating || 0) + '☆'.repeat(5 - (note.rating || 0));
        const sessionDate = new Date(note.sessionDate).toLocaleDateString();

        tr.innerHTML = `
          <td>${note.doctorId?.name || 'N/A'}</td>
          <td>${note.departmentName || 'N/A'}</td>
          <td>${note.note}</td>
          <td>${sessionDate}</td>
          <td class="stars">${stars}</td>
          <td>${note.media ? `<span class="media-btn" onclick="showMedia('${note.media}')">View</span>` : '-'}</td>
        `;

        tbody.appendChild(tr);
      });
    }

    function showMedia(url) {
      const modal = document.getElementById('mediaModal');
      const img = document.getElementById('modalImage');
      img.src = url;
      modal.style.display = 'flex';
    }

    function closeModal() {
      document.getElementById('mediaModal').style.display = 'none';
    }

    fetchNotes();
 