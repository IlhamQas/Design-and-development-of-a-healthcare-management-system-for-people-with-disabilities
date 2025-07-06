

const user = JSON.parse(localStorage.getItem('user'));
const username = document.getElementById('userName').innerHTML = `Welcome Back, ${user.name}!`;
const profilepicture = document.getElementById('profile-picture').src = user.image;
document.getElementById('profileDropdownImg').src = user.image;


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

document.getElementById('profileDropdownImg').addEventListener('click', function () {
    window.location.href = '../Html/UserprofilePage.html';
});


async function fetchStats() {
    try {
        const res = await fetch('http://localhost:4000/api/v1/admin/getSystemStats', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch data from the server');
        }

        const data = await res.json();

        if (data.message !== "إحصائيات النظام") { // Can also change this if API supports English
            throw new Error('Unexpected response from the server');
        }

        const stats = data.stats;

        const container = document.getElementById('stats-container');
        container.innerHTML = `
<div class="cardss">
<h3>Total Users</h3>
<p>${stats.totalUsers}</p>
</div>
<div class="cardss">
<h3>Number of Departments</h3>
<p>${stats.departmentsCount}</p>
</div>
<div class="cardss">
<h2>Confirmed Users</h2>
<p>${stats.confirmedUsers}</p>
</div>
<div class="cardss">
<h3>Users by Role</h3>
<ul class="role-list">
 ${Object.entries(stats.roleCounts).map(([role, count]) => `<li>${role}: ${count}</li>`).join('')}
</ul>
</div>
`;

    } catch (err) {
        document.getElementById('error').textContent = err.message;
    }
}


fetchStats();


let chartInstance;

async function loadSystemStats() {
    try {
        const res = await fetch('http://localhost:4000/api/v1/auth/loadSystemStats');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');

        const usedMemGB = data.totalMemGB - data.freeMemGB;
        const usedDiskGB = data.diskTotalGB - data.diskFreeGB;

        document.getElementById('stats').innerHTML = `
<p><strong>CPU Model:</strong> ${data.cpuModel}</p>
<p><strong>CPU Cores:</strong> ${data.cpuCores}</p>
<p><strong>Total Memory:</strong> ${data.totalMemGB} GB</p>
<p><strong>Free Memory:</strong> ${data.freeMemGB} GB</p>
<p><strong>Disk Total:</strong> ${data.diskTotalGB} GB</p>
<p><strong>Disk Free:</strong> ${data.diskFreeGB} GB</p>
<p><strong>System Uptime:</strong> ${data.uptimeMinutes} minutes</p>
`;

        const ctx = document.getElementById('systemChart').getContext('2d');

        if (chartInstance) chartInstance.destroy(); // إعادة تعيين إذا تم التحديث

        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Used Memory', 'Free Memory', 'Used Disk', 'Free Disk'],
                datasets: [{
                    label: 'System Usage',
                    data: [usedMemGB, data.freeMemGB, usedDiskGB, data.diskFreeGB],
                    backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0'],
                    borderColor: ['#fff'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'System Resource Usage (GB)'
                    }
                }
            }
        });

    } catch (error) {
        document.getElementById('stats').textContent = 'Error loading system stats';
    }
}
loadSystemStats();
async function loadMonthlyRevenue() {
    const res = await fetch('http://localhost:4000/api/v1/sale/getMonthlyRevenue', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();

    const labels = data.monthlyRevenue.map(item => `${item._id.month}/${item._id.year}`);
    const revenues = data.monthlyRevenue.map(item => item.totalRevenue);

    new Chart(document.getElementById("monthlyChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Revenue",
                data: revenues,
                backgroundColor: "#2980b9"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function loadTotalSales() {
    const res = await fetch('http://localhost:4000/api/v1/sale/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    document.getElementById("totalRevenue").textContent = `$${data.totalRevenue.toFixed(2)}`;
}

// Top Products
async function loadTopSellingProducts() {
    const res = await fetch('http://localhost:4000/api/v1/sale/getTopSellingProducts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();

    const tbody = document.querySelector("#topProductsTable tbody");
    tbody.innerHTML = "";
    data.topProducts.forEach((prod, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
<td>${index + 1}</td>
<td>${prod.productDetails.name}</td>
<td>${prod.totalSold}</td>
`;
        tbody.appendChild(row);
    });
}

loadTotalSales();
loadTopSellingProducts();
loadMonthlyRevenue();

document.getElementById('dashboardSearchInput').addEventListener('input', function () {
    const searchValue = this.value.trim().toLowerCase();
    const cards = document.querySelectorAll('.dashboard-section .card');

    if (searchValue === "") {
        cards.forEach(card => {
            card.style.display = 'block';
        });
    } else {
        cards.forEach(card => {
            const title = card.getAttribute('data-title')?.toLowerCase() || '';
            if (title.includes(searchValue)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
});
