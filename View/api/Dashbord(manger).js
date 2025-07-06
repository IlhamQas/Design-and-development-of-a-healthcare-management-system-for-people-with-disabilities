
const currentSpecialist = JSON.parse(localStorage.getItem('user')); 
const profilepicture = document.getElementById('profile-picture').src = currentSpecialist.image;
const username =document.getElementById('userName').innerHTML=`Welcome Back, ${currentSpecialist.name}!`;
document.getElementById('profileDropdownImg').src=currentSpecialist.image;
let currentEditingPostId = null;            
              

async function fetchRequest() {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/guardian/getguardianScheduleRequest`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    console.log(data);
    if (res.ok) {
        renderRequestInsideCard(data.requests);
    } else {
      document.getElementById('requestContent').innerHTML = '';
    }

  } catch (err) {
    console.error('خطأ أثناء تحميل الطلبات:', err);
    document.getElementById('requestContent').innerHTML = '<p>حدث خطأ أثناء تحميل الطلبات.</p>';
  }
}

function renderRequestInsideCard(requests) {
  
  const container = document.getElementById('requestContent');
  container.innerHTML = '';

  if (!requests || requests.length === 0) {
    container.innerHTML = `<p>No schedule requests found.</p>`;
    return;
  }

  const latestRequests = requests
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  latestRequests.forEach(req => {
    const { guardianId, status, createdAt, sessions, _id } = req;

 
    const departmentNames = sessions.map(s => s.department?.name || 'N/A').join(', ');
    const specialistNames = sessions.map(s => s.specialistId?.name || 'N/A').join(', ');

    const taskCard = document.createElement('div');
    taskCard.classList.add('card');
    taskCard.style.cursor = 'pointer';
    taskCard.style.marginBottom = '1rem';
    taskCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    taskCard.style.borderRadius = '8px';
    taskCard.style.padding = '13px';
    taskCard.style.backgroundColor = '#fff';
    taskCard.style.transition = 'transform 0.2s ease';

    taskCard.addEventListener('mouseenter', () => {
      taskCard.style.transform = 'scale(1.02)';
      taskCard.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
    taskCard.addEventListener('mouseleave', () => {
      taskCard.style.transform = 'scale(1)';
      taskCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    });

    taskCard.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
        <span style="font-size: 20px;">📌</span>
        <h5 style="margin: 0;">Guardian: ${guardianId?.name || 'Unknown'}</h5>
      </div>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Session Count:</strong> ${sessions.length}</p>
      <p style="color: #555;"><strong>Requested at:</strong> ${new Date(createdAt).toLocaleString()}</p>
    `;

    taskCard.addEventListener('click', () => {
      window.location.href = `GuardianSchededuleRequest.html`;
    });

    container.appendChild(taskCard);
  });
}

const date = new Date().toDateString();
         document.getElementById('post-date').textContent = date;

         const doctorName = currentSpecialist.name;
         document.getElementById('post-user').textContent = doctorName;

        document.getElementById('post-image').src = currentSpecialist.image || 'https://via.placeholder.com/50';

        document.getElementById('publishPost').addEventListener('click', async (e) => {
         e.preventDefault();

        const caption = document.getElementById('post-caption-input').value;
       const fileInput = document.getElementById('file-upload');
       const file = fileInput.files[0];

    if (!file) {
        alert('يجب اختيار صورة أو فيديو');
        return;
    }

    const formData = new FormData();
    formData.append('doctorName', doctorName);
    formData.append('DateOfPost', date);
    formData.append('postDesc', caption);
    formData.append('photo', file);

  

    try {
        const res = await fetch(`http://localhost:4000/api/v1/post/add/${currentSpecialist._id}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        const result = await res.json();
        if (res.ok) {
            showStatusMessage('✅ Post submitted successfully!', true);
            fetchUserPostss();
            document.getElementById('post-caption-input').value = '';
            fileInput.value = '';
            
        }
    } catch (err) {
      showStatusMessage('❌ Failed to submit the post.', false);
        console.error(err);
    }
});
fetchRequest();
fetchUserPostss();
async function fetchUserPostss() {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/post/allpost/${currentSpecialist._id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (!res.ok) {
        document.getElementById('post-display-containerss').innerHTML = `
       <div class="no-posts-message">
        <i class="fas fa-inbox"></i>
        <p>No posts yet.</p>
        <span>Create your first post and share something awesome!</span>
      </div>
    `;
        return;
      }
      
      allPosts = data.posts; 
      displayPosts(data.posts);
    } catch (error) {
      document.getElementById('post-display-containerr').innerHTML = `<p>فشل تحميل المنشورات</p>`;
    }
  }
  
async function fetchUsersExceptManagers(containerId) {
  try {
    const response = await fetch("http://localhost:4000/api/v1/admin/allUser", {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (data.message === "sucsses") {
      const users = data.find.filter(user => user.role !== 'Manager');
      const container = document.getElementById(containerId);
      container.innerHTML = "";

      users.forEach(user => {
        const userCard = document.createElement("div");
        userCard.classList.add("user-card");

        const statusClass = user.status === "active" ? "active" : "pending";

        userCard.innerHTML = `
          <img src="${user.image || '../assets/images/defultUserProfilepic1.jpg'}" alt="Profile Picture">
          <div class="user-infoo">
            <div class="user-name-status">
              <span class="status-dot ${statusClass}"></span>
              <strong>${user.name}</strong>
            </div>
            <small>${user.email}</small>
          </div>
          <div class="icon-container">
            <button title="Profile"  onclick="viewProfile('${user._id}')"><i style="color: black;" class="fa fa-user"></i></button>
          </div>
       
        `;

        container.appendChild(userCard);
      });
    } else {
      document.getElementById(containerId).innerHTML = "<p>No data available</p>";
    }
  } catch (error) {
    document.getElementById(containerId).innerHTML = `<p>An error occurred: ${error.message}</p>`;
  }
}


function viewProfile(userId) {
    window.location.href = `../Html/viewotherProfile.html?id=${userId}`;
}

document.addEventListener("DOMContentLoaded", function () {
    fetchUsersExceptManagers("users-list"); 
});

async function showPosts() {
    const dashboardSection = document.querySelector(".dashboard-section");
    if (dashboardSection) {dashboardSection.style.display = "none";
    document.getElementById('userName').style.display="none";}


    const requestContent = document.getElementById("requestContent");

    requestContent.style.display = "none";

    await fetchUserPosts();
  }

  let allPosts = [];
  async function fetchUserPosts() {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/post/allpost`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        document.getElementById('post-display-containers').innerHTML = `
          <div class="no-posts-message">
            <i class="fas fa-inbox"></i>
            <p>No posts yet.</p>
            <span>Create your first post and share something awesome!</span>
          </div>
        `;
        return;
      }

      allPosts = data.posts;
      displayPosts(data.posts);
    } catch (error) {
      document.getElementById('post-display-containers').innerHTML = `<p>فشل تحميل المنشورات</p>`;
    }
  }

  function displayPosts(posts) {
    const container = document.getElementById('post-display-containers');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    container.innerHTML = '';
    console.log(posts);
    posts.forEach(post => {
      const postDiv = document.createElement('div');
      postDiv.className = 'post-card';

      const isVideo = post.photo && post.photo.match(/\.(mp4|avi|mkv)$/i);
      const isOwner = currentUser && post.userId && currentUser._id === post.userId._id;
      postDiv.innerHTML = `
        <div class="post-header">
          <div class="user-info">
            <img src="${post.userId?.image || 'https://via.placeholder.com/50'}" class="user-avatar">
            <div>
              <h4>${post.userId?.name || 'Unknown'}</h4>
              <p>${new Date(post.DateOfPost).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div class="post-desc">${post.postDesc || ''}</div>
        <div class="post-media-container">
          ${isVideo ? `
            <video class="post-media" controls>
              <source src="${post.photo}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          ` : post.photo ? `
            <img src="${post.photo}" class="post-media" onclick="showImage('${post.photo}')">
          ` : ''}
        </div>
        ${isOwner ? `
        <div class="post-actions">
          <i class="fas fa-pen edit-icon" onclick="editPost('${post._id}')" title="Edit"></i>
          <i class="fas fa-trash delete-icon" onclick="deletePost('${post._id}')" title="Delete"></i>
        </div>
      ` : ''}
      `;

      container.appendChild(postDiv);
    });
  }

  function filterPostsBySearch() {
  const input = document.getElementById("postSearchInput").value.toLowerCase();
  const filtered = allPosts.filter(post =>
    (post.postDesc && post.postDesc.toLowerCase().includes(input)) ||
    (post.userId?.name && post.userId.name.toLowerCase().includes(input))
  );
  displayPosts(filtered);
}

window.addEventListener('load', function () {
    const justLoggedIn = localStorage.getItem("justLoggedIn");

    if (justLoggedIn === "true") {
      setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        localStorage.removeItem("justLoggedIn"); 
        showStatusMessage("✅ Welcome back!");
      }, 500); 

    } else {
      document.getElementById('loading-screen').style.display = 'none';
    }


  });
        
 






function editPost(postId) {
  currentEditingPostId = postId;

  const post = [...document.querySelectorAll('.post-card')].find(card => card.querySelector('.edit-icon').getAttribute('onclick').includes(postId));
  if (!post) return alert('Post not found');

 
  document.getElementById('doctorName').value = post.querySelector('.post-header h4').textContent || '';
  document.getElementById('DateOfPost').value = new Date(post.querySelector('.post-header p').textContent).toISOString().slice(0,10);
  document.getElementById('postDesc').value = post.querySelector('.post-desc').textContent || '';
  document.getElementById('photo').value = '';

  document.getElementById('editPostModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editPostModal').style.display = 'none';
  currentEditingPostId = null;
}

document.getElementById('editPostForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentEditingPostId) return alert('No post selected for editing');

  const form = e.target;
  const formData = new FormData();

  formData.append('doctorName', form.doctorName.value);
  formData.append('DateOfPost', form.DateOfPost.value);
  formData.append('postDesc', form.postDesc.value);
  if (form.photo.files.length > 0) {
    formData.append('photo', form.photo.files[0]);
  }

  try {
    const res = await fetch(`http://localhost:4000/api/v1/post/update/${currentEditingPostId}`, {
      method: 'PATCH', 
      headers: {
        Authorization: `Bearer ${token}`,  
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      showStatusMessage(data.message || '❌ Failed to update post',false);
      return;
    }
    showStatusMessage('✅ Post updated successfully');
    closeEditModal();

    fetchUserPostss();

  } catch (err) {
    alert('Error updating post: ' + err.message);
    showStatusMessage('⚠️ Error updating post: ' + err.message, false);
  }
});

   
  
async function deletePost(postId) {
  if (confirm('Are you sure you want to delete this post?')) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showStatusMessage('Please sign in first.', false);
        return;
      }

      const res = await fetch(`http://localhost:4000/api/v1/post/deletePost/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        showStatusMessage(data.message || 'Post deleted successfully.');
        fetchUserPostss();
      } else {
        showStatusMessage(data.message || 'Failed to delete the post.', false);
      }
    } catch (err) {
      showStatusMessage('Failed to delete the post.', false);
      console.error(err);
    }
  }
}



async function sendWeeklyReminderIfThursday() {
  const today = new Date();
  const isThursday = today.getDay() === 4;

  const todayStr = today.toISOString().split("T")[0];
  const lastSent = localStorage.getItem("lastWeeklyReminder");

  if (isThursday && lastSent !== todayStr) {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/admin/allUser`, {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const result = await response.json();
       console.log(result);
      if (response.ok && result.find?.length > 0) {
        const specialists = result.find.filter(user => user.role === 'specialist');
        const specialistIds = specialists.map(user => user._id);
        console.log(specialists);
        if (specialistIds.length === 0) {
          console.warn("⚠️ No specialists found.");
          return;
        }

       
        await fetch(`http://localhost:4000/api/v1/notification/sendNotification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: "Weekly Reminder",
            message: "Please remember to complete your weekly patient reports.",
            userIds: specialistIds,
          }),
        });

        console.log("✅ Weekly reminder sent to specialists.");
        localStorage.setItem("lastWeeklyReminder", todayStr);
      } else {
        console.warn("⚠️ No users found.");
      }
    } catch (err) {
      console.error("🚨 Error sending weekly reminder:", err);
    }
  }
}

sendWeeklyReminderIfThursday();

      
