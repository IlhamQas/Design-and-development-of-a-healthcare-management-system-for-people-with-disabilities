
document.addEventListener('DOMContentLoaded', function () {
    fetchNames();
});

const urlParams = new URLSearchParams(window.location.search);
const user = JSON.parse(localStorage.getItem('user'));
const patientId = urlParams.get('id');
console.log(patientId);

async function fetchNames() {
    try {
        const res = await fetch(`http://localhost:4000/api/v1/medical/getName/${patientId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        const result = await res.json();
        console.log(result);
        if (res.ok) {
            document.getElementById('child-name').value = result.patientName;
            document.getElementById('specialist-name').value = result.specialistName;
        } else {
            console.error('فشل في جلب البيانات:', result.message);
            alert('فشل في جلب أسماء المستخدمين.');
        }
    } catch (err) {
        console.error('Error fetching names:', err);
        alert('حدث خطأ أثناء تحميل البيانات.');
    }
}


async function sendReport() {
    const childBD = document.getElementById('dob').value;
    const motorSkillsLarge = document.getElementById('motor-skills-large').value;
    const motorSkillsFine = document.getElementById('motor-skills-fine').value;
    const selfCareSkills = document.getElementById('self-care-skills').value;
    const cognitiveSkills = document.getElementById('cognitive-skills').value;
    const socialBehaviorSkills = document.getElementById('social-behavior-skills').value;
    const recommendations = document.getElementById('recommendations').value;
    const reportDate = document.getElementById('report-date').value;

    if (patientId && childBD && motorSkillsLarge && motorSkillsFine && selfCareSkills && cognitiveSkills && socialBehaviorSkills && recommendations && reportDate) {
        const reportData = {
            childBD,
            motorSkillsLarge,
            motorSkillsFine,
            selfCareSkills,
            cognitiveSkills,
            socialBehaviorSkills,
            recommendations,
            reportDate
        };

        try {
            const res = await fetch(`http://localhost:4000/api/v1/medical/add/${patientId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(reportData)
            });

            const result = await res.json();
            console.log(result);

            if (res.ok) {
                showStatusMessage("Report submitted successfully!");
                fetchReports();
                await sendNotification(
                    "New Medical Report Available",
                    `A new report has been uploaded by ${user.name} for your review. Please log in to check the details. <a href='viewReport.html'>Click here</a>`,
                    patientId
                );
            } else {
                showStatusMessage("Failed to submit report: " + result.message, false);
            }
        } catch (err) {
            console.error('Error sending report:', err);
            showStatusMessage("An error occurred while sending the report.", false);
        }

    }
}





async function fetchReports() {
    try {
        const res = await fetch(`http://localhost:4000/api/v1/medical/getUserReports/${patientId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        console.log(data);
        if (res.ok && data.reports && data.reports.length > 0) {
            const reportsModalBody = document.getElementById('modal-body');
            reportsModalBody.innerHTML = '';

            data.reports.forEach(report => {
                const reportElement = document.createElement('div');
                reportElement.classList.add('report');
                reportElement.innerHTML = `
  <p><strong>تاريخ التقرير:</strong> ${new Date(report.reportDate).toLocaleDateString()}</p>
  <p><strong>المهارات الحركية الكبيرة:</strong> ${report.motorSkillsLarge}</p>
  <p><strong>المهارات الحركية الدقيقة:</strong> ${report.motorSkillsFine}</p>
  <p><strong>مهارات العناية الذاتية:</strong> ${report.selfCareSkills}</p>
  <p><strong>المهارات الإدراكية:</strong> ${report.cognitiveSkills}</p>
  <p><strong>المهارات الاجتماعية السلوكية:</strong> ${report.socialBehaviorSkills}</p>
  <p><strong>التوصيات:</strong> ${report.recommendations}</p>
  <button type="button" class="print-btn">print report </button>
  <button type="button" class="delete-btn">delete report</button>
  <hr>
`;


                const printBtn = reportElement.querySelector('.print-btn');
                const deleteBtn = reportElement.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => deleteReport(report._id));
                printBtn.addEventListener('click', () => printReport(report));

                reportsModalBody.appendChild(reportElement);
            });

            document.getElementById("modal").style.display = "block";

        } else {
            alert('لا توجد تقارير متاحة.');
        }

    } catch (error) {
        console.error('خطأ في استرجاع التقارير:', error);
        alert('حدث خطأ أثناء جلب التقارير.');
    }
}
function printReport(report) {
    const reportDate = new Date(report.reportDate).toLocaleDateString('ar-EG');
    const childBD = new Date(report.childBD).toLocaleDateString('ar-EG');

    const htmlContent = `
<html lang="ar">
<head>
<meta charset="UTF-8">
<title>تقرير تقييم شامل</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
<style>
body {
  direction: rtl;
  font-family: 'Cairo', sans-serif;
  padding: 50px;
  line-height: 2;
  background-color: #fff;
  color: #000;
}
header {
  text-align: center;
  border-bottom: 2px solid #2c3e50;
  padding-bottom: 10px;
  margin-bottom: 30px;
}
header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
}
.section {
  border: 1px solid #ccc;
  padding: 20px;
  margin-bottom: 25px;
  border-radius: 8px;
  background-color: #f9f9f9;
}
.section h3 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 20px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
}
.field {
  margin: 10px 0;
}
.field strong {
  display: inline-block;
  width: 180px;
}
footer {
  margin-top: 60px;
  text-align: left;
  font-size: 16px;
}
</style>
</head>
<body>
<header>
<h2>مركز سكاي مديكال للتقييم والتأهيل</h2>
</header>

<div class="section">
<h3>معلومات التقرير</h3>
<div class="field"><strong>اسم الطفل:</strong> ${report.patientId.name}</div>
<div class="field"><strong>اسم الأخصائي:</strong> ${report.specialistId.name}</div>
<div class="field"><strong>تاريخ ميلاد الطفل:</strong> ${childBD}</div>
<div class="field"><strong>تاريخ إعداد التقرير:</strong> ${reportDate}</div>
</div>

<div class="section">
<h3>لمن يهمه الأمر</h3>
<p>
  حضر/ت الطفل/ة <strong>${report.patientId.name}</strong> إلى مركز سكاي مديكال، وتم إجراء تقييم شامل للجوانب النمائية والسلوكية والمعرفية، وقد تبين التالي:
</p>
</div>

<div class="section">
<h3>تفاصيل التقييم</h3>
<div class="field"><strong>المهارات الحركية الكبيرة:</strong> ${report.motorSkillsLarge}</div>
<div class="field"><strong>المهارات الحركية الدقيقة:</strong> ${report.motorSkillsFine}</div>
<div class="field"><strong>مهارات العناية الذاتية:</strong> ${report.selfCareSkills}</div>
<div class="field"><strong>المهارات الإدراكية المعرفية:</strong> ${report.cognitiveSkills}</div>
<div class="field"><strong>السلوك الاجتماعي:</strong> ${report.socialBehaviorSkills}</div>
</div>

<div class="section">
<h3>التوصيات</h3>
<p>${report.recommendations || "لا توجد توصيات محددة في الوقت الحالي."}</p>
</div>

<footer>
<p>اسم الأخصائي: ${report.specialistId.name}</p>
</footer>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
}

async function deleteReport(reportId) {
    const confirmDelete = confirm("Are you sure you want to delete this report?");
    if (!confirmDelete) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:4000/api/v1/medical/deleteMedicalReport/${reportId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete the report');
        }

        showStatusMessage("Report deleted successfully!");
        fetchReports();
    } catch (error) {
        console.error('Error deleting the report:', error);
        showStatusMessage("An error occurred while deleting the report.", false);
    }
}


async function sendNotification(title, message, userId) {
    await fetch(`${baseURL}/notification/sendNotification`, {
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

