// Home Page JavaScript
const API_BASE = 'http://localhost:3000/api';

function getUserInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
}

window.onload = function() {
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
    
    // Handle "Post a Job" button based on user type
    const postJobBtn = document.querySelector('.btn-secondary');
    if (user.userType === 'employer') {
      // Employers: go to dashboard
      postJobBtn.onclick = function() { window.location.href = 'dashboard.html'; };
    } else if (user.userType === 'jobseeker') {
      // Jobseekers: hide the button
      postJobBtn.style.display = 'none';
    }
  } else {
    authButtons.innerHTML = `
      <button class="btn-login" onclick="window.location.href='login.html'">Login</button>
      <button class="btn-signup" onclick="window.location.href='signup.html'">Sign Up</button>
    `;
    profileDropdown.style.display = 'none';
  }
  
  loadRecentJobs();
};

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
}

function toggleProfileMenu() {
  const profileMenu = document.getElementById('profileMenu');
  profileMenu.classList.toggle('active');
}

function viewProfile() {
  alert('Profile page coming soon!');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const profileDropdown = document.getElementById('profileDropdown');
  const profileMenu = document.getElementById('profileMenu');
  const btnProfile = document.querySelector('.btn-profile');
  
  if (profileDropdown && !profileDropdown.contains(event.target)) {
    profileMenu.classList.remove('active');
  }
});

async function loadRecentJobs() {
  const recentJobsDiv = document.getElementById('recentJobs');
  
  try {
    const response = await fetch(`${API_BASE}/jobs`);
    const data = await response.json();
    
    if (response.ok && data.jobs && data.jobs.length > 0) {
      const jobsToShow = data.jobs.slice(0, 6); // Show first 6 jobs
      recentJobsDiv.innerHTML = jobsToShow.map(job => `
        <div class="job-card" onclick="window.location.href='jobs.html'">
          <div class="job-title">${job.title}</div>
          <div class="job-company">🏢 ${job.company}</div>
          <div class="job-meta">
            <span>📍 ${job.location}</span>
            <span>💼 ${job.jobType || 'full-time'}</span>
            ${job.salary ? `<span>💰 ${job.salary}</span>` : ''}
          </div>
          <div class="job-description">${job.description.substring(0, 150)}...</div>
          ${job.skills && job.skills.length > 0 ? `
            <div class="skills-tags">
              ${job.skills.slice(0, 4).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');
    } else {
      recentJobsDiv.innerHTML = '<p class="empty-message">No jobs available at the moment</p>';
    }
  } catch (error) {
    recentJobsDiv.innerHTML = '<p class="empty-message">Unable to load jobs</p>';
  }
}
