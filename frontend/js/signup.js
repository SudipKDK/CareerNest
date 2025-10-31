// Signup Page JavaScript

async function signup() {
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;
  const userType = document.getElementById("userType").value;
  const messageEl = document.getElementById("message");

  try {
    const res = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, phone, password, userType }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      // Store JWT token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      messageEl.textContent = "✓ " + data.message + " - Redirecting...";
      messageEl.className = "success";
      
      setTimeout(() => {
        window.location.href = 'home.html';
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

