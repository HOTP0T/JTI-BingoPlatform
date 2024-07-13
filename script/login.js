document.getElementById('passwordForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  const password = document.getElementById('password').value;
  const response = await fetch('/authenticate', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
  });
  if (response.ok) {
      window.location.href = await response.text();
  } else {
      alert('Invalid password');
  }
});