const apiBase = 'http://localhost:4000';
const token = localStorage.getItem('token');

function getUserInfoFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.id, role: payload.role };
  } catch (e) {
    return null;
  }
}

const userInfo = getUserInfoFromToken(token);
const userId = userInfo?.id;
const userRole = userInfo?.role;

async function fetchNotifications() {
  if (!token || !userId) return;
  try {
    const res = await fetch(`${apiBase}/api/v1/notification/allNotification`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const unread = (data.notifications || []).filter(n => !n.readBy.includes(userId));

    const dropdowns = document.querySelectorAll('.notificationsDropdown');
    dropdowns.forEach(list => list.innerHTML = "");

    const redDots = document.querySelectorAll('.redDot');
    redDots.forEach(dot => {
      dot.style.display = unread.length > 0 ? 'block' : 'none';
    });

    if (data.notifications.length === 0) {
      dropdowns.forEach(list => {
        list.innerHTML = "<p>No notifications found.</p>";
      });
      return;
    }

    const isDetailedPage = window.location.pathname.includes('notifications.html');

    data.notifications.forEach(notif => {
      const div = document.createElement("div");
      div.className = "notification";

      if (isDetailedPage) {
        div.innerHTML = `
          <div class="notification-card">
            <div>
              <strong>${notif.title}</strong><br>
              <small>${notif.message}</small><br>
              <div class="notification-time">${new Date(notif.createdAt).toLocaleString()}</div>
            </div>
            <div class="icon-container">
              <i style="font-size: 10px;">Sends To ${notif.roles.length > 0 ? notif.roles : 'you'}</i><br>
              <i class="fa-solid fa-check" onclick="markAsRead()" title="Mark as Read"></i>
              ${userRole === 'admin' ? `<i class="fa-solid fa-trash" onclick="deleteNotification('${notif._id}')" title="Delete" style="cursor:pointer; margin-left: 10px;"></i>` : ''}
            </div>
          </div>
        `;
      } else {
        div.innerHTML = `
          <strong>${notif.title}</strong><br>
          <div class="notification-time">${new Date(notif.createdAt).toLocaleString()}</div>
          <div class="notification-item">
            <div class="notification-message">${notif.message}</div>
          </div>
        `;
        div.addEventListener('click', () => {
          window.location.href = 'notifications.html';
        });
      }

      dropdowns.forEach(container => {
        container.appendChild(div);
      });
    });

  } catch (err) {
    console.error("Error fetching notifications:", err);
    const dropdowns = document.querySelectorAll('.notificationsDropdown');
    dropdowns.forEach(list => {
      list.innerHTML = "<p>Error loading notifications</p>";
    });
  }
}

async function markAsRead() {
  try {
    await fetch(`${apiBase}/api/v1/notification/readNotification`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    fetchNotifications();
  } catch (err) {
    console.error('Error marking notifications as read:', err);
  }
}

async function deleteNotification(id) {
  const confirmDelete = confirm("Are you sure you want to delete this notification?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`${apiBase}/api/v1/notification//deleteNotification/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert("✅ Notification deleted");
      fetchNotifications();
    } else {
      alert("❌ Failed to delete notification");
    }
  } catch (err) {
    console.error("Error deleting notification:", err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchNotifications();

  const notifIcon = document.getElementById('notifIcon');
  if (notifIcon) {
    notifIcon.addEventListener('click', () => {
      markAsRead();
    });
  }
});

setInterval(fetchNotifications, 60000);
