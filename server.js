const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8081;

// Use body-parser to parse POST request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// Handle password validation
app.post('/login', (req, res) => {
    const { password } = req.body;
    const redirectUrl = {
        'password1': '/CardID1.html',
        'password2': '/CardID2.html',
        // Add more password-URL pairs as needed
    }[password];

    if (redirectUrl) {
        res.redirect(redirectUrl);
    } else {
        res.status(401).send('Invalid password');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});