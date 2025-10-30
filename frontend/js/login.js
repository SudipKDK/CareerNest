// Login Page JavaScript

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const messageEl = document.getElementById("message");

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      // Store JWT token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      messageEl.textContent = "✓ " + data.message + " - Redirecting...";
      messageEl.className = "success";
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      messageEl.textContent = "✗ " + data.message;
      messageEl.className = "error";
    }
  } catch (error) {
    messageEl.textContent = "✗ Error: " + error.message;
    messageEl.className = "error";
  }
}

