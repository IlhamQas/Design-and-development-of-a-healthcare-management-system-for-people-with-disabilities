
const user = JSON.parse(localStorage.getItem('user'));
const username =document.getElementById('userName').innerHTML=`Welcome Back, ${user.name}!`;
document.getElementById('profileDropdownImg').src=user.image;

function goToEvaluations(event) {
event.preventDefault();
if(userId) {
  window.location.href = `../Html/ViewEvaluationForm.html?id=${user ? user._id : null}`;
} else {
  alert('User ID not found!');
}
}
function goToTretmentPlan(event) {
event.preventDefault();
if(userId) {
  window.location.href = `../Html/ViewTretmentPlan.html?id=${user ? user._id : null}`;
} else {
  alert('User ID not found!');
}
}


async function showPosts() {
const dashboardSection = document.querySelector(".dashboard-section");
if (dashboardSection) {dashboardSection.style.display = "none";
document.getElementById('userName').style.display="none";}


const requestContent = document.getElementById("progressChartcontaner");

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
document.getElementById('post-display-container').innerHTML = `<p>${data.message}</p>`;
return;
}

allPosts = data.posts; 
displayPosts(data.posts);
} catch (error) {
document.getElementById('post-display-container').innerHTML = `<p>فشل تحميل المنشورات</p>`;
}
}

function displayPosts(posts) {
const container = document.getElementById('post-display-containerr');
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
<h4 onclick="window.location.href='viewotherProfile.html?id=${post.userId._id}'">${post.userId.name}</h4>
<p>${new Date(post.DateOfPost).toLocaleDateString()}</p>
</div>
</div>

</div>
<div class="post-desc">${post.postDesc || ''}</div>
<div class="post-media-container">
${isVideo ? `
<video class="post-media" controls>
<source src="${post.photo}" type="video/mp4">
متصفحك لا يدعم تشغيل الفيديو.
</video>
` : `
<img src="${post.photo}" class="post-media" onclick="showImage('${post.photo}')">
`}
</div>
`;

container.appendChild(postDiv);
});
}


async function fetchAndDisplayData() {
try {
const res = await fetch("http://localhost:4000/api/v1/sessionRecord/getImprovment", {
headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const data = await res.json();
console.log(data);

const chartLabels = [];
const chartRatings = [];

if (!data.sessionsWithImprovement || data.sessionsWithImprovement.length === 0) {
document.getElementById('chartMessage').textContent = "There is no data to show the level of improvement currently.";
return;
}

data.sessionsWithImprovement.forEach(session => {
const improvementsArray = session.improvements || [];

if (improvementsArray.length > 0) {
const latestImprovements = [...improvementsArray]
.sort((a, b) => new Date(b.date) - new Date(a.date))
.slice(0, 2);

latestImprovements.forEach(i => {
const formattedDate = new Date(i.date).toLocaleDateString();
chartLabels.push(`${formattedDate} - ${session.department}`);
chartRatings.push(i.improvementLevel);
});
}
});

if (chartRatings.length === 0) {
document.getElementById('chartMessage').textContent = "There are no levels of improvement recorded yet.";
return;
}

drawChart(chartLabels, chartRatings);
} catch (error) {
console.error("Error fetching improvement data:", error);
document.getElementById('chartMessage').textContent = "Failed to load improvement data.";
}
}


function drawChart(labels, ratings) {
const ctx = document.getElementById('progressChart').getContext('2d');
new Chart(ctx, {
type: 'line',
data: {
labels,
datasets: [{
label: 'Improvement Level',
data: ratings,
borderColor: '#00b4d8',
backgroundColor: 'rgba(0,180,216,0.1)',
fill: true,
tension: 0.3,
pointRadius: 4,
pointHoverRadius: 6
}]
},
options: {
responsive: true,
plugins: {
legend: { display: true }
},
scales: {
y: {
beginAtZero: true,
suggestedMax: 5,
title: {
display: true,
text: 'Rating (1 to 5)'
}
},
x: {
title: {
display: true,
text: 'Session Date & Department'
}
}
}
}
});
}



async function checkProfile() {
const messageDiv = document.getElementById('message');

try {
const response = await fetch("http://localhost:4000/api/v1/profile/getProfile", {
method: "GET",
headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
});

if (response.status === 404) {
const card = document.getElementById('cheakProfile');
if (card) card.style.display = '';
} else if (response.ok) {
const data = await response.json();
console.log("Profile found:", data);
const card = document.getElementById('cheakProfile');
if (card) card.style.display = 'none';
}
} catch (error) {
console.log("No profile found or server error.");
}
}

async function cheakSchedules() {
const messageDiv = document.getElementById('message');

if (!user || !user._id) return;

try {
const response = await fetch(`http://localhost:4000/api/v1/Guardian/getSchedule/${user._id}`, {
method: "GET",
headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
});

const card = document.getElementById('cheakSchedules');

if (!response.ok) {
if (card) card.style.display = '';
} else {
const data = await response.json();
console.log("Schedule found:", data);
if (card) card.style.display = 'none';
}
} catch (error) {
console.log("No schedule found or server error.");
}
}


cheakSchedules();
checkProfile();
fetchAndDisplayData();
fetchUserPosts();


const searchInput = document.querySelector('.search-bar input');
const postContainer = document.getElementById('post-display-container');
const dashboardsection = document.querySelector('.dashboard-section');
const cardy = document.querySelector('.cardy');
const noResultsMessage = document.getElementById('no-results-message');

function filterPosts() {
const query = searchInput.value.trim().toLowerCase();

if (!query) {
cardy.style.display = '';
dashboardsection.style.display = '';
displayPosts(allPosts);
noResultsMessage.style.display = 'none'; 
} else {
cardy.style.display = 'none';
dashboardsection.style.display = 'none';

const filtered = allPosts.filter(post =>
post.postDesc && post.postDesc.toLowerCase().includes(query)
);

displayPosts(filtered);  
if (filtered.length === 0) {
noResultsMessage.style.display = 'block';
} else {
noResultsMessage.style.display = 'none';
}
}
}


displayPosts(allPosts);
cardy.style.display = '';
dashboardsection.style.display = '';
searchInput.addEventListener('input', filterPosts);



window.addEventListener('load', function () {
const justLoggedIn = localStorage.getItem("justLoggedIn");

if (justLoggedIn === "true") {
setTimeout(() => {
document.getElementById('loading-screen').style.display = 'none';
localStorage.removeItem("justLoggedIn"); 
showStatusMessage("✅ Welcome back! Check the latest news 👇");

}, 500); 

} else {
document.getElementById('loading-screen').style.display = 'none';
}


});




