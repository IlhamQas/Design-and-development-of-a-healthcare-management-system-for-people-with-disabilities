
const senderStr = localStorage.getItem("user");
const sender = senderStr ? JSON.parse(senderStr) : null;
const senderId = sender ? sender._id : null;
const token = localStorage.getItem("token");
const socket = io("http://localhost:4000");

let receiverId = "";

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const header = document.getElementById("chat-header");
const doctorList = document.getElementById("doctor-list");

const chatHeaderImg = document.getElementById("chat-header-img");
const chatHeaderName = document.getElementById("chat-header-name");

socket.emit("addUser", senderId);

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function displayMessage(isMine, text, createdAt, mediaUrl = null, mediaType = null) {
const msg = document.createElement("div");
msg.className = `message ${isMine ? "" : "theirs"}`;

let content = "";

if (mediaUrl) {
if (mediaType.startsWith("image")) {
  content += `<img src="${mediaUrl}" alt="image" style="max-width: 100%; border-radius: 8px; margin-top: 8px;" />`;
} else if (mediaType.startsWith("video")) {
  content += `<video controls style="max-width: 100%; border-radius: 8px; margin-top: 8px;">
                <source src="${mediaUrl}" type="${mediaType}" />
                Your browser does not support the video tag.
              </video>`;
}
}

if (text) {
content = `<p>${text}</p>` + content;
}

msg.innerHTML = `
${content}
<div class="timestamp">${formatTime(createdAt)}</div>
${isMine ? '<div class="you-label">You</div>' : ''}
`;

chatBox.appendChild(msg);
chatBox.scrollTop = chatBox.scrollHeight;
}

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}


async function loadMessages() {
chatBox.innerHTML = "";
const res = await fetch(`http://localhost:4000/api/V1/chat/getMessage/${senderId}/${receiverId}`, {
method: "GET",
headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
});

const messages = await res.json();
messages.forEach(msg => {
const isMine = msg.senderId.toString() === senderId;
displayMessage(isMine, msg.message, msg.createdAt, msg.mediaUrl, msg.mediaType);
});
scrollToBottom();
}

sendBtn.addEventListener("click", async () => {
const text = input.value.trim();
const fileInput = document.getElementById("media-input");
const file = fileInput.files[0];

if (!text && !file) return;

const formData = new FormData();
formData.append("receiverId", receiverId);
if (text) formData.append("message", text);
if (file) formData.append("media", file);

try {
const res = await fetch("http://localhost:4000/api/V1/chat/sendMessage", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const data = await res.json();
if (res.ok) {
  const { newMessage } = data;
  displayMessage(true, newMessage.message, newMessage.createdAt, newMessage.mediaUrl, newMessage.mediaType);
  input.value = "";
  fileInput.value = null;
} else {
  alert(data.message || "Failed to send");
}
} catch (err) {
console.error(err);
alert("Error sending message");
}
});


socket.on("privateMessage", ({ senderId: incomingSender, message, mediaUrl, mediaType, createdAt }) => {
if (incomingSender === receiverId) {
displayMessage(false, message, createdAt, mediaUrl, mediaType);
scrollToBottom();
}
});


function selectDoctor(name, id, image) {
  receiverId = id;
  chatHeaderName.textContent = name;
  chatHeaderImg.src = image || "https://via.placeholder.com/48?text=Dr";

  localStorage.setItem("selectedDoctor", JSON.stringify({ _id: id, name, image }));

  loadMessages();
}

function renderDoctors(doctors) {
  doctorList.innerHTML = "";
  doctors.forEach((doc) => {
    const div = document.createElement("div");
    div.className = "doctor";
    const img = document.createElement("img");
    img.src = doc.image || "https://via.placeholder.com/48?text=Dr";
    img.alt = doc.name;
    div.appendChild(img);

    const nameSpan = document.createElement("span");
    nameSpan.className = "name";
    nameSpan.textContent = doc.name;

div.appendChild(img);
div.appendChild(nameSpan);

div.onclick = () => selectDoctor(doc.name, doc._id, doc.image);

doctorList.appendChild(div);
});

}


input.addEventListener("keypress", (e) => {
if (e.key === "Enter") {
sendBtn.click();
}
});




async function getDoctors() {
try {
const storedDoctors = localStorage.getItem("doctorsList");

let doctors;

if (storedDoctors) {
  doctors = JSON.parse(storedDoctors);
} else {
  const res = await fetch(`http://localhost:4000/api/V1/Guardian/getdoctors/${senderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  doctors = data.doctors || data;

  localStorage.setItem("doctorsList", JSON.stringify(doctors));
}

renderDoctors(doctors);
const selectedDoctor = localStorage.getItem("selectedDoctor");

if (selectedDoctor) {
const doctor = JSON.parse(selectedDoctor);
const foundDoctor = doctors.find(d => d._id === doctor._id);
if (foundDoctor) {
selectDoctor(foundDoctor.name, foundDoctor._id, foundDoctor.image);
}
} else if (doctors.length > 0) {
const first = doctors[0];
selectDoctor(first.name, first._id, first.image);
}

} catch (error) {
console.error("Failed to load doctors:", error);
}
}

getDoctors();

window.addEventListener("beforeunload", function () {
localStorage.removeItem("selectedDoctor");
localStorage.removeItem("doctorsList");
});

function goToProfile() {
if (receiverId) {
window.location.href = `viewotherprofile.html?id=${receiverId}`;
}
}
