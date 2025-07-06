
const token = localStorage.getItem('token');
const urlParams = new URLSearchParams(window.location.search);
const guardianId = urlParams.get('guardianId');

console.log("Guardian ID:", guardianId);

async function fetchGuardianNotes() {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/sessionRecord/guardian-notes/${guardianId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    console.log(data);
    const container = document.getElementById('notesContainer');
    container.innerHTML = '';
    if (!data.notes || data.notes.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:gray">No notes available for this child.</p>';
      return;
    }

    data.notes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';

    let mediaElement = '';
    if (note.media) {

if (note.media.match(/\.(jpeg|jpg|png|gif)$/i)) {
  mediaElement = `<img src="${note.media}" alt="session media" style="max-width:10%; margin-top:10px; border-radius:8px;" />`;
} else if (note.media.match(/\.(mp4|mov|avi|mkv)$/i)) {
  mediaElement = `
    <video controls style="max-width:50%; margin-top:10px; border-radius:8px;">
      <source src="${note.media}" type="video/mp4">
      Your browser does not support the video tag.
    </video>`;
} else {
  mediaElement = `<a href="${note.media}" target="_blank">📎 View attached file</a>`;
}
}

card.innerHTML = `
<div style="display: flex; justify-content: space-between; align-items: center;">
<h3>🧠 ${new Date(note.sessionDate).toLocaleDateString()}</h3>
<div>
  <button onclick="editNote('${note._id}')" title="Edit" style="background: none; border: none; cursor: pointer; font-size: 18px;">🖊️</button>
  <button onclick="deleteNote('${note._id}')" title="Delete" style="background: none; border: none; cursor: pointer; font-size: 18px;">🗑️</button>
</div>
</div>
<p><strong>Note:</strong> ${note.note}</p>
<p><strong>Rating:</strong> ${note.rating}</p>
${mediaElement}
`;

container.appendChild(card);
});

  } catch (err) {
    console.error('Error fetching notes:', err);
    document.getElementById('notesContainer').innerHTML = '<p style="color:red">An error occurred while loading the notes.</p>';
  }
}

function closeModal() {
document.getElementById('editModal').style.display = 'none';
}

let currentNoteData = null; 

function editNote(noteId) {
const allNotes = document.querySelectorAll('.note-card');
for (let card of allNotes) {
const cardNoteId = card.querySelector('button').getAttribute('onclick').match(/'(.+)'/)[1];
if (cardNoteId === noteId) {
  const noteText = card.querySelector('p:nth-of-type(1)').innerText.replace("Note: ", "");
  const ratingText = card.querySelector('p:nth-of-type(2)').innerText.replace("Rating: ", "");
  const dateText = card.querySelector('h3').innerText.replace("🧠 ", "");

  currentNoteData = {
    _id: noteId,
    note: noteText,
    rating: ratingText,
    sessionDate: dateText
  };

  document.getElementById('editNoteId').value = noteId;
  document.getElementById('editNoteText').value = noteText;
  document.getElementById('editNoteDate').innerText = dateText;
  document.getElementById('editNoteRating').value = ratingText;
  document.getElementById('editNoteMedia').value = '';
  document.getElementById('editModal').style.display = 'flex';
  break;
}
}
}

document.getElementById('editForm').addEventListener('submit', async (e) => {
e.preventDefault();

const noteId = document.getElementById('editNoteId').value;
const noteText = document.getElementById('editNoteText').value;
const rating = document.getElementById('editNoteRating').value;



const fileInput = document.getElementById('editNoteMedia');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('note', noteText);
formData.append('rating', rating);
if (file) {
formData.append('media', file);
}

try {
const res = await fetch(`http://localhost:4000/api/v1/sessionRecord/update/${noteId}`, {
method: 'PUT',
headers: {
  Authorization: `Bearer ${token}`
},
body: formData
});

const result = await res.json();

if (res.ok) {
showStatusMessage('✅ Note updated successfully.', true);
console.log(result);
closeModal();
await fetchGuardianNotes();
} else {
showStatusMessage(result.message || '❌ Failed to update note.', false);
}

} catch (err) {
console.error('Error updating note:', err);
showStatusMessage('❌ An error occurred while updating the note.', false);
}

});

function deleteNote(noteId) {
const confirmDelete = confirm("Are you sure you want to delete this note?");
if (!confirmDelete) return;

fetch(`http://localhost:4000/api/v1/sessionRecord/delete/${noteId}`, {
method: 'DELETE',
headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
}
})
.then(response => {
if (!response.ok) throw new Error('Failed to delete the note.');
return response.json();
})
.then(data => {
showStatusMessage('✅ Note deleted successfully.', true);
fetchGuardianNotes();
})
.catch(error => {
console.error(error);
showStatusMessage('❌ An error occurred while deleting the note.', false);
});
}











function ViewEvaluationForm() {
  window.location.href = `../Html/ViewEvaluationForm.html?id=${guardianId}`;
}

function viewTreatmentPlan() {
  window.location.href = `../Html/ViewTretmentPlan.html?id=${guardianId}`;
}

function viewProgressChart() {
  window.location.href = `../Html/ImprovmentLevel(specialist).html?guardianId=${guardianId}`;
}



function MakeanReport(){
window.location.href = `../Html/Report.html?id=${guardianId}`;
}






document.addEventListener('DOMContentLoaded', fetchGuardianNotes);
