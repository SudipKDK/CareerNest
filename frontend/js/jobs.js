// Jobs Page JavaScript

window.onload = function() {
  updateNav();
  loadJobs();
};

function updateNav() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const authButtons = document.getElementById('authButtons');
  const userInfo = document.getElementById('userInfo');

  if (token && user) {
    userInfo.textContent = `Hello, ${user.firstName}`;
    authButtons.innerHTML = `
      <button class="btn-dashboard" onclick="window.location.href='dashboard.html'">Dashboard</button>
      <button class="btn-logout" onclick="logout()">Logout</button>
    `;
  } else {
    userInfo.textContent = '';
    authButtons.innerHTML = `
      <button class="btn-login" onclick="window.location.href='login.html'">Login</button>
      <button class="btn-signup" onclick="window.location.href='signup.html'">Sign Up</button>
    `;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'home.html';
}

async function loadJobs() {
  const jobsList = document.getElementById('jobsList');
  const messageDiv = document.getElementById('message');

  try {
    const response = await fetch('http://localhost:3000/api/jobs');
    const data = await response.json();

    if (response.ok && data.jobs) {
      if (data.jobs.length > 0) {
        jobsList.innerHTML = data.jobs.map(job => `
          <div class="job-card">
            <div class="job-title">${job.title}</div>
            <div class="job-company">🏢 ${job.company}</div>
            <div class="job-meta">
              📍 ${job.location} | 💼 ${job.jobType || 'full-time'} 
              ${job.salary ? '| 💰 ' + job.salary : ''}
            </div>
            <div class="job-description">${job.description}</div>
            ${job.skills && job.skills.length > 0 ? `<div class="job-meta">Skills: ${job.skills.join(', ')}</div>` : ''}
          </div>
        `).join('');
        showMessage('success', `Loaded ${data.jobs.length} jobs`);
      } else {
        jobsList.innerHTML = '<p style="text-align:center;color:#999;">No jobs found</p>';
      }
    } else {
      showMessage('error', 'Error loading jobs');
      jobsList.innerHTML = '';
    }
  } catch (error) {
    showMessage('error', 'Error: ' + error.message);
    jobsList.innerHTML = '';
  }
}

function showMessage(type, msg) {
  const messageDiv = document.getElementById('message');
  messageDiv.innerHTML = `<div class="message ${type}">${msg}</div>`;
  setTimeout(() => { messageDiv.innerHTML = ''; }, 3000);
}

