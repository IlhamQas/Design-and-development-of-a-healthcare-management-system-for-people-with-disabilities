
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));
const doctorId = user._id;

let currentSession = null;
let currentGuardianId = null;

function openModal(session) {
    currentSession = session;
    currentGuardianId = session.guardian?._id || null;


    document.getElementById('sessionModal').style.display = 'flex';

    const content = document.getElementById('modalContent');
    content.innerHTML = `
    <p><strong>Time:</strong> ${session.time}</p>
    <p><strong>Status:</strong> ${session.status}</p>
    <p onclick="window.location.href = '../Html/viewotherProfile.html?id=${session.guardian?._id}'"><strong>Guardian: </strong><span style="color: blue; text-decoration: underline; cursor: pointer;"> ${session.guardian?.name || 'N/A'}</span></p>
    <p><strong>Guardian ID:</strong> ${session.guardian?._id || 'N/A'}</p>
    <p><strong>Session ID:</strong> ${session.sessionId}</p>
    <p><strong>childStatus:</strong> ${session.guardian.childStatus}</p>
    <button onclick="viewNotes()">📜 View last Notes</button>
    <button onclick="addNote()">➕ Add Note</button>
  `;

    document.getElementById('noteSection').innerHTML = '';
}

function closeModal() {
    document.getElementById('sessionModal').style.display = 'none';
    currentSession = null;
}

async function fetchDoctorSchedule() {
    try {
        const res = await fetch(`http://localhost:4000/api/v1/Doctor/getS/${doctorId}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        const data = await res.json();
        console.log(data);
        const container = document.getElementById('schedule');
        container.innerHTML = '';

        if (data.schedule && Array.isArray(data.schedule)) {
            data.schedule.forEach(day => {
                const column = document.createElement('div');
                column.className = 'day-column';

                const title = document.createElement('div');
                title.className = 'day-title';
                title.textContent = day.dayOfWeek;
                column.appendChild(title);

                day.times.forEach(slot => {
                    const card = document.createElement('div');
                    card.className = `slot-card ${slot.status}`;
                    card.innerHTML = `
                <div class="time">🕐 ${slot.time}</div>
                <div class="status">Status: ${slot.status}</div>
                ${slot.guardian ? `<div class="guardian">👤 Guardian:${slot.guardian.name}</div>` : ''}
                ${slot.guardian?.department?.name ? `<div class="guardian">🏥 Department: ${slot.guardian.department.name}</div>` : ''}
                ${slot.status === 'Booked' ? `<div style="font-size:10px;color:gray;">Add your weekly note</div>` : ''}
        `;

                    if (slot.status === 'Booked') {
                        card.addEventListener('click', () => openModal(slot));
                    }

                    column.appendChild(card);
                });

                container.appendChild(column);
            });
        }
    } catch (err) {
        console.error(err);
        document.getElementById('schedule').textContent = 'Failed to load schedule.';
    }
}


function addNote() {
    if (!currentSession?.sessionId) return;

    document.getElementById('noteSection').innerHTML = `
<h4>➕ Add Note</h4>
<textarea id="noteText" rows="4" style="width:100%;" placeholder="Enter note..."></textarea><br>
<label>Rating (1-5): <input type="number" id="noteRating" min="1" max="5" /></label><br>
<label>Upload image or video (optional): <input type="file" id="noteMedia" accept="image/*,video/*" /></label><br>
<button onclick="submitNote()">💾 Save Note</button>
`;
}
async function submitNote() {
    const note = document.getElementById('noteText').value.trim();
    const rating = parseInt(document.getElementById('noteRating').value);
    const mediaInput = document.getElementById('noteMedia');
    const file = mediaInput.files[0];

    if (!note) {
        showStatusMessage('❗ Please enter the note text.', false);
        return;
    }

    if (!rating || rating < 1 || rating > 5) {
        showStatusMessage('❗ Please enter a valid rating between 1 and 5.', false);
        return;
    }

    const formData = new FormData();
    formData.append('sessionId', currentSession.sessionId);
    formData.append('guardianId', currentSession.guardian?._id || '');
    formData.append('sessionDate', currentSession.date || new Date().toISOString());
    formData.append('note', note);
    formData.append('rating', rating);
    if (file) {
        formData.append('media', file);
    }

    try {
        const res = await fetch('http://localhost:4000/api/v1/sessionRecord/add', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            await sendNotification(
                "New Note Added",
                `Dr. ${user.name} has added a new note to the session dated ${new Date().toISOString()}. Please review the updated improvement level. If you have any questions, feel free to contact us.`,
                currentSession.guardian._id
            );
            showStatusMessage('✅ Note added successfully.', true);
            viewNotes();
        } else {
            showStatusMessage(`❌ Failed: ${data.message}`, false);
        }
    } catch (err) {
        console.error(err);
        showStatusMessage('❌ Error submitting note.', false);
    }
}


async function viewNotes() {
    if (!currentSession?.sessionId) return;

    try {
        const res = await fetch('http://localhost:4000/api/v1/sessionRecord/getD', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        const data = await res.json();
        console.log(data);
        const note = data.notes?.find(n => n.sessionId === currentSession.sessionId);
        const noteSection = document.getElementById('noteSection');

        if (note) {
            let mediaHtml = '';
            if (note.media) {

                if (note.media.match(/\.(jpeg|jpg|png|gif)$/i)) {
                    mediaHtml = `<img src="${note.media}" alt="Note Media" style="max-width:50%; margin-top:10px; border-radius:8px;">`;
                } else if (note.media.match(/\.(mp4|avi|mkv)$/i)) {
                    mediaHtml = `
        <video controls style="max-width:50%; margin-top:10px; border-radius:8px;">
          <source src="${note.media}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
                } else {
                    mediaHtml = `<a href="${note.media}" target="_blank">View attached file</a>`;
                }
            }

            noteSection.innerHTML = `
    <h4>📝 Session date: ${new Date(note.sessionDate).toLocaleDateString()}</h4>
    <div class="note-box">
      <p><strong>Note:</strong> ${note.note}</p>
      <p><strong>Rating:</strong> ${note.rating}</p>
      <p><strong>Date:</strong> ${new Date(note.sessionDate).toLocaleDateString()}</p>
      ${mediaHtml}
    </div>
    <button onclick="window.location.href='../Html/SessionNote(specialist).html?guardianId=${currentGuardianId}'">🔍 View All Notes</button>
  `;
        } else {
            noteSection.innerHTML = `
    <p>❌ No note found for this session.</p>
    <button onclick="window.location.href='../Html/SessionNote(specialist).html?guardianId=${currentGuardianId}'">🔍 View All Notes</button>
  `;
        }
    } catch (err) {
        console.error(err);
    }
}


window.onload = async function () {
    try {
        const response = await fetch(`http://localhost:4000/api/v1/Doctor/fixed`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Restored missing slots:', result);
        } else {
            console.error('❌ Failed to restore slots:', result.message);
        }
    } catch (error) {
        console.error('🚨 Error restoring slots:', error.message);
    }
};




document.addEventListener('DOMContentLoaded', fetchDoctorSchedule);


async function sendNotification(title, message, userId) {
    await fetch(`http://localhost:4000/api/v1/notification/sendNotification`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            title,
            message,
            userIds: [userId]
        })
    });
}
