// public/script/register.js
async function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const team = document.getElementById('team').value;

  const response = await fetch('/register', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, team })
  });

  if (response.ok) {
      alert('Registration successful');
      window.location.href = 'login.html';
  } else {
      alert('Registration failed');
  }
}