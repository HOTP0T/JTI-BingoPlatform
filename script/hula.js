document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent form submission
  
  var password = document.getElementById('password').value;
  var redirectUrl;

  // Define your password-URL mappings
  switch(password) {
      case 'password1':
          redirectUrl = 'https://bingosrs.online/CardID1';
          break;
      case 'password2':
          redirectUrl = 'https://bingosrs.online/CardID2';
          break;
      // Add more cases as needed
      default:
          alert('Invalid password');
          return;
  }

  // Notify other clients about the login (without revealing the password)
  const message = JSON.stringify({ action: 'login', redirectUrl: redirectUrl });
  ws.send(message);

  // Redirect to the specified URL
  window.location.href = redirectUrl;
});