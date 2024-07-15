const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8081;

// Password mappings (should be stored securely, e.g., in environment variables or a database)
const passwordMappings = {
    'password1': '/CardID1.html',
    'password2': '/CardID2.html',
    // Add more password-URL pairs as needed
};

// Use body-parser to parse POST request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle password validation
app.post('/login', (req, res) => {
    const { password } = req.body;
    const redirectUrl = passwordMappings[password];
    if (redirectUrl) {
        res.redirect(redirectUrl);
    } else {
        res.send('Invalid password');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});