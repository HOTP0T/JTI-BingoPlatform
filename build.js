const fs = require('fs-extra');
const path = require('path');

// Define source and destination directories
const assetsDir = path.join(__dirname, 'public', 'assets');
const publicDir = path.join(__dirname, 'public');

// Create the public directory if it doesn't exist
fs.ensureDirSync(publicDir);

// Copy assets to the public directory
fs.copySync(assetsDir, publicDir);

console.log('Build step completed');