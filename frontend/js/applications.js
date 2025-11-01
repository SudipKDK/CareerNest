// Applications Page JavaScript
const API_BASE = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

function getUserInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
}

// Protect page - redirect if not logged in
if (!token) {
  alert('Please login to access your applications');
  window.location.href = 'login.html';
}

window.onload = function() {
  if (user) {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    // Set user initials in avatar
    userAvatar.textContent = getUserInitials(user.firstName, user.lastName);
    
    // Set user name
    userName.textContent = `${user.firstName} ${user.lastName}`;
  }
  loadMyApplications();
};

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'home.html';
}

async function loadMyApplications() {
  const applicationsList = document.getElementById('applicationsList');
  const messageDiv = document.getElementById('message');

  try {
    const response = await fetch(`${API_BASE}/my-applications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data.applications) {
      if (data.applications.length > 0) {
        applicationsList.innerHTML = data.applications.map(app => {
          const job = app.jobs;
          const statusClass = getStatusClass(app.status);
          
          return `
            <div class="application-card">
              <div class="application-header">
                <div>
                  <h3>${job.title}</h3>
                  <p class="job-company">🏢 ${job.company} | 📍 ${job.location}</p>
                </div>
                <span class="status-badge ${statusClass}">${app.status.toUpperCase()}</span>
              </div>
              <div class="application-details">
                <p><strong>Applied on:</strong> ${new Date(app.appliedAt).toLocaleDateString()}</p>
                ${job.salary ? `<p><strong>Salary:</strong> ${job.salary}</p>` : ''}
                <div class="cover-letter-section">
                  <h4>Cover Letter:</h4>
                  <p>${app.coverLetter}</p>
                </div>
                <div class="resume-section">
                  <h4>Resume:</h4>
                  <p>${app.resume}</p>
                </div>
                ${app.notes ? `
                  <div class="notes-section">
                    <h4>Employer Notes:</h4>
                    <p>${app.notes}</p>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('');
      } else {
        applicationsList.innerHTML = `
          <p class="empty-message">You haven't applied to any jobs yet.</p>
          <div class="empty-state-actions">
            <button class="btn-browse" onclick="window.location.href='jobs.html'">Browse Jobs</button>
          </div>
        `;
      }
    } else {
      showMessage('error', data.message || 'Error loading applications');
      applicationsList.innerHTML = '';
    }
  } catch (error) {
    showMessage('error', 'Error: ' + error.message);
    applicationsList.innerHTML = '';
  }
}

function getStatusClass(status) {
  switch(status) {
    case 'accepted':
      return 'status-accepted';
    case 'rejected':
      return 'status-rejected';
    case 'reviewed':
      return 'status-reviewed';
    case 'pending':
    default:
      return 'status-pending';
  }
}

function showMessage(type, msg) {
  const messageDiv = document.getElementById('message');
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

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const profileDropdown = document.getElementById('profileDropdown');
  const profileMenu = document.getElementById('profileMenu');
  
  if (profileDropdown && !profileDropdown.contains(event.target)) {
    profileMenu.classList.remove('active');
  }
});
