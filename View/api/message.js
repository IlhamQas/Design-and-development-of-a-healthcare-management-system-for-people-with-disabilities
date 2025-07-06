
function getRoleFromToken(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role; 
    } catch (e) {
      return null;
    }
  }
  const Role = getRoleFromToken(localStorage.getItem('token'));  
   
  function getUserIdFromToken(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); 
      return payload.id; 
    } catch (e) {
      return null; 
    }
  }

async function fetchMessages() {
    try {
      const res = await fetch(`http://localhost:4000/api/V1/chat/getAllMessage`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
  
      const data = await res.json();
      console.log(getUserIdFromToken(localStorage.getItem('token')));
      const unread = (data.messages || []).filter(m => !m.readBy?.includes(getUserIdFromToken(localStorage.getItem('token'))));
      const dropdowns = document.querySelectorAll('.messagesDropdown');
      dropdowns.forEach(list => list.innerHTML = "");

      const redDots = document.querySelectorAll('.messageDot');
      redDots.forEach(dot => {
        dot.style.display = unread.length > 0 ? 'block' : 'none';
      });
  
      if (!data.messages || data.messages.length === 0) {
        dropdowns.forEach(list => {
          list.innerHTML = "<p>No messages found.</p>";
        });
        return;
      }
  

  
      data.messages.forEach(msg => {
        const div = document.createElement("div");
        div.className = "message";
        const content = msg.mediaType ? "📎 تم إرسال ملف" : msg.message;
          div.innerHTML = `
            <div class="message-item" style="display: flex; align-items: center; gap: 10px; padding: 8px;">
              <img src="${msg.senderImage || 'default-avatar.png'}" alt="sender" style="width: 32px; height: 32px; border-radius: 50%;">
              <div>
                <strong>${msg.senderName || 'Unknown'}</strong><br>
                <span style="color: #555;">${content}</span>
                <div style="font-size: 12px; color: gray;">${new Date(msg.createdAt).toLocaleString()}</div>
              </div>
            </div>
          `;

          div.addEventListener('click', () => {
              window.location.href = 'AllChat.html'; 
  
          });
  
        dropdowns.forEach(container => {
          container.appendChild(div);
        });
      });
  
    } catch (err) {
      console.error("Error fetching messages:", err);
      const dropdowns = document.querySelectorAll('.messagesDropdown');
      dropdowns.forEach(list => {
        list.innerHTML = "<p>Error loading messages</p>";
      });
    }
  }
  

  async function markMessagesAsRead() {
    try {
      await fetch(`http://localhost:4000/api/V1/chat/markMessageAsRead`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      fetchMessages();
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }
  


async function deleteMessage(id) {
  try {
    await fetch(`http://localhost:4000/api/v1/message/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    fetchMessages();
  } catch (err) {
    console.error('Error deleting message:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchMessages();

  const msgIcon = document.getElementById('msgIcon');
  if (msgIcon) {
    msgIcon.addEventListener('click', () => {
      markMessagesAsRead();
    });
  }
});

setInterval(fetchMessages, 700);




