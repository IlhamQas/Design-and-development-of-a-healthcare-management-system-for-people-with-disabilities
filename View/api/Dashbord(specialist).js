
const currentSpecialist = JSON.parse(localStorage.getItem('user'));
const profilepicture = document.getElementById('profile-picture').src = currentSpecialist.image;
const username = document.getElementById('userName').innerHTML = `Welcome Back, ${currentSpecialist.name}!`;
document.getElementById('profileDropdownPic').src = profilepicture;
window.addEventListener('DOMContentLoaded', async () => {

    const addEvalLink = document.getElementById('add-evaluation-link');
    const myEvalLink = document.getElementById('my-evaluation-link');


    try {
        const doctorRes = await fetch('http://localhost:4000/api/v1/dep/OccupationalDoctor', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const doctorData = await doctorRes.json();
        const doctors = doctorData.doctors || [];

        const isOccupationalDoctor = doctors.some(doc => doc.doctorId === currentSpecialist._id);

        if (isOccupationalDoctor) {
            addEvalLink.style.display = 'block';
            myEvalLink.style.display = 'block';
            myEvalLink.href = '../Html/myEvaluation.html'
            addEvalLink.href = '../Html/EvaluationForm.html';
        } else {
            addEvalLink.style.display = 'none';
            myEvalLink.style.display = 'none';
        }

    } catch (error) {
        console.error('Error fetching occupational doctors:', error);
        addEvalLink.style.display = 'none';
    }
});



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
            fetchUserPosts();
            document.getElementById('post-caption-input').value = '';
            fileInput.value = '';

        }
    } catch (err) {
        showStatusMessage('❌ Failed to submit the post.', false);
        console.error(err);
    }
});


async function showPosts() {
    const dashboardSection = document.querySelector(".dashboard-section");
    if (dashboardSection) {
        dashboardSection.style.display = "none";
        document.getElementById('userName').style.display = "none";
    }


    const requestContent = document.getElementById("notificationsContent");

    requestContent.style.display = "none";

    await fetchUserPosts();
}


let allPosts = [];
async function fetchUserPosts() {
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
            document.getElementById('post-display-container').innerHTML = `
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
        document.getElementById('post-display-container').innerHTML = `<p>فشل تحميل المنشورات</p>`;
    }
}

function displayPosts(posts) {
    const container = document.getElementById('post-display-container');
    container.innerHTML = '';
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';

        const isVideo = post.photo.match(/\.(mp4|avi|mkv)$/i);

        postDiv.innerHTML = `
<div class="post-header">
<div class="user-info">
<img src="${post.userId.image || 'https://via.placeholder.com/50'}" class="user-avatar">
<div>
<h4>${post.userId.name}</h4>
<p>${new Date(post.DateOfPost).toLocaleDateString()}</p>
</div>
</div>
<div class="post-actions">
<i class="fas fa-pen edit-icon" onclick="editPost('${post._id}')" title="Edit"></i>
<i class="fas fa-trash delete-icon" onclick="deletePost('${post._id}')" title="Delete"></i>
</div>
</div>
<div class="post-desc">${post.postDesc || ''}</div>
<div class="post-media-container">
${isVideo ? `
<video class="post-media" controls>
<source src="${post.photo}" type="video/mp4">
Your browser does not support the video tag.
</video>
` : `
<img src="${post.photo}" class="post-media" onclick="showImage('${post.photo}')">
`}
</div>
`;

        container.appendChild(postDiv);
    });
}



function showImage(src) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    modalImg.src = src;
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('image-modal').style.display = 'none';
}





let currentEditingPostId = null;

function editPost(postId) {
    currentEditingPostId = postId;

    const post = [...document.querySelectorAll('.post-card')].find(card => card.querySelector('.edit-icon').getAttribute('onclick').includes(postId));
    if (!post) return alert('Post not found');


    document.getElementById('doctorName').value = post.querySelector('.post-header h4').textContent || '';
    document.getElementById('DateOfPost').value = new Date(post.querySelector('.post-header p').textContent).toISOString().slice(0, 10);
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
            showStatusMessage(data.message || '❌ Failed to update post', false);
            return;
        }
        showStatusMessage('✅ Post updated successfully');
        closeEditModal();

        fetchUserPosts();

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
                showStatusMessage(data.message || '✅ Post deleted successfully.');
                fetchUserPosts();
            } else {
                showStatusMessage(data.message || '❌ Failed to delete the post.', false);
            }
        } catch (err) {
            showStatusMessage('⚠️ Failed to delete the post.', false);
            console.error(err);
        }
    }
}



async function fetchNotifications() {
    try {
        const res = await fetch(`http://localhost:4000/api/v1/notification/allNotification`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        console.log('data' + data);
        if (res.ok) {
            renderNotificationsInsideCard(data.notifications);
        } else {
            document.getElementById('notificationsContent').innerHTML = '<p>لا توجد إشعارات حاليًا.</p>';
        }

    } catch (err) {
        console.error('خطأ أثناء تحميل الإشعارات:', err);
        document.getElementById('notificationsContent').innerHTML = '<p>حدث خطأ أثناء تحميل الإشعارات.</p>';
    }
}

function renderNotificationsInsideCard(notifications) {
    const container = document.getElementById('notificationsContent');
    container.innerHTML = '';

    if (!notifications || notifications.length === 0) {
        const emptyCard = document.createElement('div');
        emptyCard.classList.add('card');
        emptyCard.style.opacity = '0.6';
        emptyCard.innerHTML = `
<div class="card-body">
<div class="card-title-with-icon">
<span class="pin-icon">📌</span>
<h5 class="card-title">No Tasks</h5>
</div>
<p class="card-text">No tasks available at the moment.</p>
<p class="card-text"><small class="text-muted">--</small></p>
</div>
`;
        container.appendChild(emptyCard);
        return;
    }

    const now = new Date();
    const validNotifications = notifications.filter(notification => {
        const createdAt = new Date(notification.createdAt);
        const hoursPassed = (now - createdAt) / (1000 * 60 * 60);
        return hoursPassed <= 24;
    });

    if (validNotifications.length === 0) {
        container.innerHTML = `
<div class="card" style="opacity: 0.6;">
<div class="card-body">
<div class="card-title-with-icon">
<span class="pin-icon">📌</span>
<h5 class="card-title">No Tasks</h5>
</div>
<p class="card-text">No tasks available at the moment.</p>
<p class="card-text"><small class="text-muted">--</small></p>
</div>
</div>
`;
        return;
    }

    const latestTasks = validNotifications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);

    latestTasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.classList.add('card');

        taskCard.innerHTML = `
<div class="card-body">
<div class="card-title-with-icon">
<span class="pin-icon">📌</span>
<h5 class="card-title">${task.title || 'Task'}</h5>
</div>
<p class="card-text">${task.message || ''}</p>
<p class="card-text"><small class="text-muted">${new Date(task.createdAt).toLocaleString()}</small></p>
</div>
`;

        container.appendChild(taskCard);
    });
}



fetchNotifications();
fetchUserPosts();



window.addEventListener('load', function () {
    const justLoggedIn = localStorage.getItem("justLoggedIn");

    if (justLoggedIn === "true") {
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            localStorage.removeItem("justLoggedIn");
            showStatusMessage("✅Welcome Back!");
        }, 500);

    } else {
        document.getElementById('loading-screen').style.display = 'none';
    }


});

const searchInput = document.querySelector('.search-bar input');
const postContainer = document.getElementById('post-display-container');
const postsContainer = document.querySelector('.post-container');
const notificationsContent = document.querySelector('.card-body');
const dashboardsection = document.querySelector('.dashboard-section');



function filterPosts() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        postsContainer.style.display = '';
        notificationsContent.style.display = '';
        dashboardsection.style.display = '';
        displayPosts(allPosts);

    } else {

        postsContainer.style.display = 'none';
        notificationsContent.style.display = 'none';
        dashboardsection.style.display = 'none';


        const filtered = allPosts.filter(post =>
            post.postDesc && post.postDesc.toLowerCase().includes(query)
        );

        displayPosts(filtered);
    }

}


const filtered = allPosts.filter(post => {
    return post.postDesc && post.postDesc.toLowerCase().includes(query);
});


displayPosts(allPosts);
postsContainer.style.display = '';
notificationsContent.style.display = '';
dashboardsection.style.display = '';


searchInput.addEventListener('input', filterPosts);




