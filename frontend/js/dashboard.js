// Dashboard Page JavaScript

// Protect page - redirect if not logged in
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token) {
  alert('Please login to access dashboard');
  window.location.href = 'login.html';
}

window.onload = function() {
  if (user) {
    document.getElementById('userInfo').textContent = `Hello, ${user.firstName}`;

    //show /hide based on role
    if(user.userType === 'employer'){
      document.getElementById('createJobSection').style.display = 'block';
      document.getElementById('myJobsSection').style.display = 'block';
    } else {
      document.getElementById('createJobSection').style.display = 'none';
      document.getElementById('myJobsSection').stylea.display = 'none';
    }
  }
  loadMyJobs();
};

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'home.html';
}

async function createJob(event) {
  event.preventDefault();
  const messageDiv = document.getElementById('createMessage');

  const jobData = {
    title: document.getElementById('title').value,
    company: document.getElementById('company').value,
    location: document.getElementById('location').value,
    description: document.getElementById('description').value,
    jobType: document.getElementById('jobType').value,
    salary: document.getElementById('salary').value,
    category: document.getElementById('category').value,
    skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s)
  };

  try {
    const response = await fetch('http://localhost:3000/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(jobData)
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('createMessage', 'success', '✓ Job created successfully!');
      event.target.reset();
      loadMyJobs();
    } else {
      showMessage('createMessage', 'error', '✗ ' + data.message);
    }
  } catch (error) {
    showMessage('createMessage', 'error', '✗ Error: ' + error.message);
  }
}

async function loadMyJobs() {
  const jobsList = document.getElementById('myJobsList');

  try {
    const response = await fetch('http://localhost:3000/api/my-jobs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data.jobs) {
      if (data.jobs.length > 0) {
        jobsList.innerHTML = data.jobs.map(job => `
          <div class="job-card">
            <h3>${job.title}</h3>
            <p><strong>Company:</strong> ${job.company}</p>
            <p><strong>Location:</strong> ${job.location}</p>
            <p>${job.description}</p>
            ${job.salary ? `<p><strong>Salary:</strong> ${job.salary}</p>` : ''}
            <div class="job-actions">
              <button class="btn-delete" onclick="deleteJob('${job._id}', '${job.title}')">Delete</button>
            </div>
          </div>
        `).join('');
      } else {
        jobsList.innerHTML = '<p style="text-align:center;color:#999;">No jobs posted yet</p>';
      }
    } else {
      showMessage('myJobsMessage', 'error', '✗ Error loading jobs');
      jobsList.innerHTML = '';
    }
  } catch (error) {
    showMessage('myJobsMessage', 'error', '✗ Error: ' + error.message);
    jobsList.innerHTML = '';
  }
}

async function deleteJob(jobId, jobTitle) {
  if (!confirm(`Delete "${jobTitle}"?`)) return;

  try {
    const response = await fetch(`http://localhost:3000/api/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('myJobsMessage', 'success', '✓ Job deleted successfully!');
      loadMyJobs();
    } else {
      alert('✗ ' + data.message);
    }
  } catch (error) {
    alert('✗ Error: ' + error.message);
  }
}

function showMessage(elementId, type, msg) {
  const div = document.getElementById(elementId);
  div.innerHTML = `<div class="message ${type}">${msg}</div>`;
  setTimeout(() => { div.innerHTML = ''; }, 3000);
}

