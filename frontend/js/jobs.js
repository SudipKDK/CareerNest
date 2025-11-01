// Jobs Page JavaScript
const API_BASE = 'http://localhost:3000/api';
let currentJobId = null; // Track which job is being applied for

function getUserInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
}

window.onload = function() {
  updateNav();
  loadJobs();
};

function updateNav() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const authButtons = document.getElementById('authButtons');
  const profileDropdown = document.getElementById('profileDropdown');

  if (token && user) {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    // Set user initials in avatar
    userAvatar.textContent = getUserInitials(user.firstName, user.lastName);
    
    // Set user name
    userName.textContent = `${user.firstName} ${user.lastName}`;
    
    authButtons.style.display = 'none';
    profileDropdown.style.display = 'block';
  } else {
    authButtons.innerHTML = `
      <button class="btn-login" onclick="window.location.href='login.html'">Login</button>
      <button class="btn-signup" onclick="window.location.href='signup.html'">Sign Up</button>
    `;
    profileDropdown.style.display = 'none';
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
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  try {
    const response = await fetch(`${API_BASE}/jobs`);
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
            ${job.skills && job.skills.length > 0 ? `
              <div class="skills-tags">
                ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
              </div>
            ` : ''}
            ${token && user && user.userType === 'jobseeker' ? `<button class="btn-apply" onclick="openApplicationModal('${job._id}', '${job.title}')">Apply Now</button>` : ''}
          </div>
        `).join('');
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

function openApplicationModal(jobId, jobTitle) {
  currentJobId = jobId;
  const modal = document.getElementById('applicationModal');
  modal.style.display = 'block';
  // Update the modal title if needed
  const modalTitle = modal.querySelector('h2');
  if (modalTitle) {
    modalTitle.textContent = `Apply for: ${jobTitle}`;
  }
}

function closeApplicationModal() {
  const modal = document.getElementById('applicationModal');
  modal.style.display = 'none';
  currentJobId = null;
  document.getElementById('coverLetter').value = '';
  document.getElementById('resume').value = '';
  document.getElementById('applicationMessage').innerHTML = '';
}

async function submitApplication(event) {
  event.preventDefault();
  const messageDiv = document.getElementById('applicationMessage');
  
  if (!currentJobId) {
    showApplicationMessage('error', 'No job selected');
    return;
  }

  const coverLetter = document.getElementById('coverLetter').value;
  const resume = document.getElementById('resume').value;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        jobId: currentJobId,
        coverLetter: coverLetter,
        resume: resume
      })
    });

    const data = await response.json();

    if (response.ok) {
      showApplicationMessage('success', '✓ Application submitted successfully!');
      setTimeout(() => {
        closeApplicationModal();
        loadJobs(); // Reload jobs to update UI
      }, 1500);
    } else {
      showApplicationMessage('error', '✗ ' + data.message);
    }
  } catch (error) {
    showApplicationMessage('error', '✗ Error: ' + error.message);
  }
}

function showApplicationMessage(type, msg) {
  const messageDiv = document.getElementById('applicationMessage');
  messageDiv.innerHTML = `<div class="message ${type}">${msg}</div>`;
  setTimeout(() => { messageDiv.innerHTML = ''; }, 3000);
}

function toggleProfileMenu() {
  const profileMenu = document.getElementById('profileMenu');
  profileMenu.classList.toggle('active');
}

function viewProfile() {
  alert('Profile page coming soon!');
}

// Close modal and dropdown when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('applicationModal');
  if (event.target == modal) {
    closeApplicationModal();
  }
  
  const profileDropdown = document.getElementById('profileDropdown');
  const profileMenu = document.getElementById('profileMenu');
  if (profileDropdown && !profileDropdown.contains(event.target)) {
    profileMenu.classList.remove('active');
  }
}
