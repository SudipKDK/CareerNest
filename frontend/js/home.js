// Home Page JavaScript

// Check if user is logged in
window.onload = function() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const authButtons = document.getElementById('authButtons');
  const userInfo = document.getElementById('userInfo');

  if (token && user) {
    // User is logged in
    userInfo.textContent = `Hello, ${user.firstName}`;
    authButtons.innerHTML = `
      <button class="btn-dashboard" onclick="window.location.href='dashboard.html'">Dashboard</button>
      <button class="btn-logout" onclick="logout()">Logout</button>
    `;
  } else {
    // User is logged out
    userInfo.textContent = '';
    authButtons.innerHTML = `
      <button class="btn-login" onclick="window.location.href='login.html'">Login</button>
      <button class="btn-signup" onclick="window.location.href='signup.html'">Sign Up</button>
    `;
  }
};

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
}

