document.getElementById('AddUserForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm_password").value;
  const formElement = document.getElementById('AddUserForm');
  if (!formElement) {
    console.error("Error: Form element not found!");
    return;
}

const token = localStorage.getItem('token');
if (!token) {
    showStatusMessage('⚠️ Please sign in first!', false);
    setTimeout(() => {
        window.location.href = '../Html/SignInPage.html';
    }, 1500);
    return;
}

if (name.length < 3) {
    showStatusMessage("Name must be at least 3 characters long.", false);
    return;
}

if (password.length < 7) {
    showStatusMessage("Password must be at least 7 characters long.", false);
    return;
}

if (password !== confirmPassword) {
    showStatusMessage("❌ Passwords didn't match!", false);
    return;
}


  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", document.getElementById("email").value);
  formData.append("password", password);
  formData.append("role", document.getElementById("role").value);

  if (document.getElementById("role").value === "specialist") {
      formData.append("department", document.getElementById("Department").value);
  }
  if (document.getElementById("role").value === "guardian") {
      const selectedDepartments = [];
      document.querySelectorAll('input[name="department"]:checked').forEach((checkbox) => {
          selectedDepartments.push(checkbox.value);
      });
      if (selectedDepartments.length === 0) {
          alert("Please select at least one department.");
          return;
      }
      formData.append("departments", JSON.stringify(selectedDepartments));
      formData.append("childStatus", document.getElementById("childState").value);
  }

  const fileInput = document.getElementById('image');
  if (!fileInput || !fileInput.files.length) {
      alert("Please add a photo");
      return;
  }
  formData.append("image", fileInput.files[0]);

  try {
      const response = await fetch('http://localhost:4000/api/v1/admin/addUser', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`
          },
          body: formData
      });

      const data = await response.json();

      if (response.ok) {
        showStatusMessage("✅ User added successfully! Please check your email.", true);
          const newUserId = data.user._id;

          // إشعار ترحيبي عام
          await sendNotification(
              "Welcome to SKY MEDICAL CENTER Platform!",
              "Thank you for joining us! <a href='UserProfilePage.html'>Don't forget to complete your profile.</a>.",
               newUserId
          );
        
          if (document.getElementById("role").value === "guardian") {
              await sendNotification(
                  "Next Steps for You",
                  "Please submit your first schedule request. <a href='../Html/SchedulesPage(Guardian).html'>Go to schedules</a>.",
                  newUserId
              );

              try {
                const doctorRes = await fetch('http://localhost:4000/api/v1/dep/OccupationalDoctor', {
                  method: 'GET',
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
              
                const doctorData = await doctorRes.json();
               

            
                if (doctorRes.ok && Array.isArray(doctorData.doctors)) {
                  const doctorIds = doctorData.doctors.map(doc => doc.doctorId.toString());
              
                  console.log("Doctor IDs to notify:", doctorIds);

                  await sendNotification(
                    "New Child Registered",
                    `A new child has been registered and requires evaluation.child id is 'newUserId' <a href="../Html/EvaluationForm.html?id=${newUserId}">EvaluationForm child Now!</a>.`,
                    doctorIds
                  );
                }
              } catch (err) {
                console.error("Failed to notify Occupational Therapy doctors:", err);
              }  

             
              window.location.href = "../Html/UserlistPage.html";
          }

          if (document.getElementById("role").value === "specialist") {
              await sendNotification(
                  "Next Steps for Specialists",
                  "Please complete your profile and set your available schedule to start receiving appointments.",
                  newUserId
              );
              const doctorId = newUserId;
              document.getElementById("doctorId").value = doctorId;
              document.getElementById("doctorScheduleModal").style.display = "flex";
              submitDoctorSchedule(doctorId);
          }

          formElement.reset();

      } else {
        showStatusMessage(data.message || "An error occurred.", false);
      }
  } catch (error) {
      console.error('Error:', error);
      showStatusMessage("❌ Error sending data.", false);
  }
});


async function sendNotification(title, message, receivers) {

  if (!Array.isArray(receivers)) {
    receivers = [receivers];  
  }
  receivers = receivers.filter(id => typeof id === 'string' && id.length === 24);

  await fetch(`http://localhost:4000/api/v1/notification/sendNotification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },

    body: JSON.stringify({
      title,
      message,
       userIds: receivers 
    })
  });
}

////////////////////////////////////////////////////

    const roleSelect = document.getElementById("role");
    const departmentField = document.getElementById("departmentField");
    const guardianDepartmentsField = document.getElementById("guardianDepartmentField");
    const childStates = document.getElementById("childStateField");

    roleSelect.addEventListener("change", function () {
        if (this.value === "specialist") {
          departmentField.style.display = "block";
          guardianDepartmentField.style.display = "none";
          childStates.style.display="none";
        } else if (this.value === "guardian") {
          departmentField.style.display = "none";
          guardianDepartmentField.style.display = "block";
          childStates.style.display="block";
        } else {
          departmentField.style.display = "none";
          guardianDepartmentField.style.display = "none";
        }
      });
      


function goBack() {
    window.history.back();
}


//////////////////////////////////////////////////


async function loadDepartments() {
    const token=localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:4000/api/v1/dep/allDep', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();  
        const departments = data.departments; 
        const departmentSelect = document.getElementById('Department');
        
      
        const defaultOption = document.createElement('option');
        defaultOption.text = ' choose the department';
        departmentSelect.add(defaultOption);

       
        departments.forEach(department => {
            const option = document.createElement('option');
            option.value =department.name;  
            option.text = department.name;  
            departmentSelect.add(option);
        });

    } catch (error) {
        console.error('Error loading departments:', error);
    }
}


async function loadGuardianDepartments() {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:4000/api/v1/dep/allDep', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const data = await response.json();
      const departments = data.departments;
      const container = document.getElementById('guardianDepartmentsContainer');
      container.innerHTML = ''; // تنظيف قبل الإضافة
  
      departments.forEach(department => {
        const checkboxWrapper = document.createElement('div');
  
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'department';
        checkbox.value = department.name;
  
        const label = document.createElement('label');
        label.textContent = department.name;
        label.style.marginLeft = '5px';
  
        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(label);
        container.appendChild(checkboxWrapper);
      });
  
    } catch (error) {
      console.error('Error loading guardian departments:', error);
    }
  }


  loadDepartments();          
  loadGuardianDepartments();  
  



//////////////////////////////////////////////////////////////


async function submitDoctorSchedule(doctorId) {
    const token = localStorage.getItem("token");
    const messageDiv = document.getElementById("scheduleMessage");
    setTimeout(async () => {
    try {
        const res = await fetch(`http://localhost:4000/api/v1/Doctor/addS/${doctorId}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
        });

        const data = await res.json();
        if (res.ok) {
            messageDiv.style.color = "green";
            messageDiv.textContent = data.message || "Schedule created!";

            await sendNotification(
              "Automatic Schedule Created",
              "Your automatic schedule with temporary available slots has been successfully created.<a href='../Html/SchedulesPage(specialist).html'>Go to schedule</a>.",
              doctorId
          );

            setTimeout(() => {
                document.getElementById("doctorScheduleModal").style.display = "none";
                window.location.href = "../Html/UserlistPage.html";
            }, 1500);
        } else {
            messageDiv.style.color = "red";
            messageDiv.textContent = data.message || "Error creating schedule.";
        }
    } catch (err) {
        messageDiv.style.color = "red";
        messageDiv.textContent = "Failed to connect to server.";
    }
}, 2000); 
}




/////////////////////////////////////////////////////////////

function previewImage(event) {
    const input = event.target;
    const preview = document.getElementById('imagePreview');
    const file = input.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
      }
      reader.readAsDataURL(file);
    }
  }