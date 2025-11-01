// Dashboard Page JavaScript
const API_BASE = 'http://localhost:3000/api';

// Protect page - redirect if not logged in
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

function getUserInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
}

if (!token) {
  alert('Please login to access dashboard');
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

    //show /hide based on role
    if(user.userType === 'employer'){
      document.getElementById('jobseekerSection').style.display = 'none';
      document.getElementById('employerSection').style.display = 'block';
      loadEmployerDashboard();
    } else {
      document.getElementById('jobseekerSection').style.display = 'block';
      document.getElementById('employerSection').style.display = 'none';
      loadJobseekerDashboard();
    }
  }
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
    const response = await fetch(`${API_BASE}/jobs`, {
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

async function loadEmployerDashboard() {
  await Promise.all([loadEmployerStats(), loadMyJobs()]);
}

async function loadEmployerStats() {
  try {
    const response = await fetch(`${API_BASE}/my-jobs`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data.jobs) {
      const jobs = data.jobs;
      const totalJobs = jobs.length;
      
      // Get all applications for all jobs
      let totalApplications = 0;
      let pendingApplications = 0;
      
      for (const job of jobs) {
        try {
          const appResponse = await fetch(`${API_BASE}/jobs/${job._id}/applications`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const appData = await appResponse.json();
          if (appResponse.ok && appData.applications) {
            totalApplications += appData.applications.length;
            pendingApplications += appData.applications.filter(a => a.status === 'pending').length;
          }
        } catch (e) {
          console.error('Error loading applications for job:', e);
        }
      }

      document.getElementById('totalJobs').textContent = totalJobs;
      document.getElementById('totalApplicationsEmployer').textContent = totalApplications;
      document.getElementById('pendingApplicationsEmployer').textContent = pendingApplications;
      document.getElementById('activeJobs').textContent = totalJobs; // All posted jobs are considered active for now
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadMyJobs() {
  const jobsList = document.getElementById('myJobsList');

  try {
    const response = await fetch(`${API_BASE}/my-jobs`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data.jobs) {
      if (data.jobs.length > 0) {
        jobsList.innerHTML = data.jobs.map(job => `
          <div class="employer-job-card">
            <div class="employer-job-header">
              <div>
                <h3 class="employer-job-title">${job.title}</h3>
                <p class="employer-job-company">🏢 ${job.company} | 📍 ${job.location}</p>
              </div>
              <div class="employer-job-meta">
                <span class="employer-job-type">💼 ${job.jobType}</span>
                ${job.salary ? `<span class="employer-job-salary">💰 ${job.salary}</span>` : ''}
              </div>
            </div>
            <p class="employer-job-description">${job.description.substring(0, 120)}${job.description.length > 120 ? '...' : ''}</p>
            ${job.skills && job.skills.length > 0 ? `
              <div class="employer-skills-tags">
                ${job.skills.slice(0, 4).map(skill => `<span class="employer-skill-tag">${skill}</span>`).join('')}
              </div>
            ` : ''}
            <div class="employer-job-actions">
              <button class="btn-view-applications" onclick="viewApplications('${job._id}', '${job.title}')">📥 View Applications</button>
              <button class="btn-delete" onclick="deleteJob('${job._id}', '${job.title}')">🗑️ Delete</button>
            </div>
          </div>
        `).join('');
      } else {
        jobsList.innerHTML = '<p class="empty-message">No jobs posted yet. Create your first job posting below!</p>';
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
    const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
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

let currentJobId = null;
let currentApplicationId = null;

async function viewApplications(jobId, jobTitle) {
  currentJobId = jobId;
  const modal = document.getElementById('applicationsModal');
  modal.style.display = 'block';
  const modalTitle = modal.querySelector('h2');
  if (modalTitle) {
    modalTitle.textContent = `Applications for: ${jobTitle}`;
  }
  
  // Load applications for this job
  await loadApplicationsForJob(jobId);
}

async function loadApplicationsForJob(jobId) {
  const applicationsList = document.getElementById('applicationsList');
  const messageDiv = document.getElementById('applicationsMessage');

  try {
    const response = await fetch(`${API_BASE}/jobs/${jobId}/applications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data.applications) {
      if (data.applications.length > 0) {
        applicationsList.innerHTML = data.applications.map(app => {
          const statusClass = getStatusClass(app.status);
          const applicantName = app.user ? `${app.user.firstName} ${app.user.lastName}` : 'Unknown';
          const applicantEmail = app.user ? app.user.email : '';
          const applicantPhone = app.user ? app.user.phone || 'N/A' : 'N/A';
          
          return `
            <div class="application-item">
              <div class="application-item-header">
                <div>
                  <h4>${applicantName}</h4>
                  <p class="applicant-info">📧 ${applicantEmail} | 📞 ${applicantPhone}</p>
                  <p class="applied-date">Applied on: ${new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                <span class="status-badge ${statusClass}">${app.status.toUpperCase()}</span>
              </div>
              <div class="text-section">
                <h5>Cover Letter:</h5>
                <p>${app.coverLetter}</p>
              </div>
              <div class="text-section">
                <h5>Resume:</h5>
                <p>${app.resume}</p>
              </div>
              ${app.notes ? `
                <div class="text-section">
                  <h5>Your Notes:</h5>
                  <p>${app.notes}</p>
                </div>
              ` : ''}
              <button class="btn-update-status" onclick="openStatusModal('${app._id}', '${app.status}')">Update Status</button>
            </div>
          `;
        }).join('');
        messageDiv.innerHTML = '';
      } else {
        applicationsList.innerHTML = '<p class="empty-message">No applications yet</p>';
        messageDiv.innerHTML = '';
      }
    } else {
      showMessage('applicationsMessage', 'error', data.message || 'Error loading applications');
      applicationsList.innerHTML = '';
    }
  } catch (error) {
    showMessage('applicationsMessage', 'error', 'Error: ' + error.message);
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

function closeApplicationsModal() {
  const modal = document.getElementById('applicationsModal');
  modal.style.display = 'none';
  currentJobId = null;
}

function openStatusModal(applicationId, currentStatus) {
  currentApplicationId = applicationId;
  document.getElementById('applicationStatus').value = currentStatus;
  document.getElementById('applicationNotes').value = '';
  const modal = document.getElementById('statusModal');
  modal.style.display = 'block';
}

function closeStatusModal() {
  const modal = document.getElementById('statusModal');
  modal.style.display = 'none';
  currentApplicationId = null;
  document.getElementById('statusMessage').innerHTML = '';
}

async function updateApplicationStatus(event) {
  event.preventDefault();
  const messageDiv = document.getElementById('statusMessage');
  
  const status = document.getElementById('applicationStatus').value;
  const notes = document.getElementById('applicationNotes').value;

  try {
    const response = await fetch(`${API_BASE}/applications/${currentApplicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: status,
        notes: notes
      })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('statusMessage', 'success', '✓ Status updated successfully!');
      setTimeout(() => {
        closeStatusModal();
        loadApplicationsForJob(currentJobId);
      }, 1500);
    } else {
      showMessage('statusMessage', 'error', '✗ ' + data.message);
    }
  } catch (error) {
    showMessage('statusMessage', 'error', '✗ Error: ' + error.message);
  }
}

function toggleProfileMenu() {
  const profileMenu = document.getElementById('profileMenu');
  profileMenu.classList.toggle('active');
}

function viewProfile() {
  alert('Profile page coming soon!');
}

// Close modals and dropdown when clicking outside
window.onclick = function(event) {
  const applicationsModal = document.getElementById('applicationsModal');
  const statusModal = document.getElementById('statusModal');
  
  if (event.target == applicationsModal) {
    closeApplicationsModal();
  }
  if (event.target == statusModal) {
    closeStatusModal();
  }
  
  const profileDropdown = document.getElementById('profileDropdown');
  const profileMenu = document.getElementById('profileMenu');
  if (profileDropdown && !profileDropdown.contains(event.target)) {
    profileMenu.classList.remove('active');
  }
}

// Jobseeker Dashboard Functions
async function loadJobseekerDashboard() {
  await Promise.all([loadJobseekerStats(), loadRecentJobseekerApplications()]);
}

async function loadJobseekerStats() {
  try {
    const response = await fetch(`${API_BASE}/my-applications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data.applications) {
      const apps = data.applications;
      const total = apps.length;
      const pending = apps.filter(a => a.status === 'pending').length;
      const accepted = apps.filter(a => a.status === 'accepted').length;
      const rejected = apps.filter(a => a.status === 'rejected').length;

      document.getElementById('totalApplications').textContent = total;
      document.getElementById('pendingApps').textContent = pending;
      document.getElementById('acceptedApps').textContent = accepted;
      document.getElementById('rejectedApps').textContent = rejected;
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadRecentJobseekerApplications() {
  const recentAppsDiv = document.getElementById('recentApplications');
  
  try {
    const response = await fetch(`${API_BASE}/my-applications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data.applications) {
      const apps = data.applications.slice(0, 3); // Show first 3 applications
      
      if (apps.length > 0) {
        recentAppsDiv.innerHTML = apps.map(app => {
          const job = app.jobs;
          const statusClass = getStatusClass(app.status);
          
          return `
            <div class="application-card" style="margin-bottom: 15px;">
              <div class="application-header">
                <div>
                  <h3>${job.title}</h3>
                  <p class="job-company">🏢 ${job.company} | 📍 ${job.location}</p>
                </div>
                <span class="status-badge ${statusClass}">${app.status.toUpperCase()}</span>
              </div>
              <p><strong>Applied on:</strong> ${new Date(app.appliedAt).toLocaleDateString()}</p>
              <a href="applications.html" style="color: #795757; text-decoration: none; font-weight: 600;">View Details →</a>
            </div>
          `;
        }).join('');
      } else {
        recentAppsDiv.innerHTML = '<p class="empty-message">You haven\'t applied to any jobs yet. <a href="jobs.html" style="color: #795757;">Browse Jobs</a></p>';
      }
    } else {
      recentAppsDiv.innerHTML = '<p class="empty-message">Unable to load applications</p>';
    }
  } catch (error) {
    recentAppsDiv.innerHTML = '<p class="empty-message">Error loading applications</p>';
  }
}

