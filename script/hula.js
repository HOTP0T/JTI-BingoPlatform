document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent form submission

  var password = document.getElementById('password').value;
  var redirectUrl;

  // Define your password-URL mappings
  const passwordMappings = {
      'password1': '../pages/CardID1.html',
    'password2': '../pages/CardID2.html',
    'BINWILDYGO': '../pages/JtiBingo.html',
      // Add more password-URL pairs as needed
  };

    // Check if the entered password exists in the mappings
    if (passwordMappings[password]) {
      redirectUrl = passwordMappings[password];
      window.location.href = redirectUrl; // Redirect to the specified URL
  } else {
      alert('Invalid password');
  }
});