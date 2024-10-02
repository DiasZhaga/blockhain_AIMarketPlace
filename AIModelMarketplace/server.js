const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000; 

// Serve static files (HTML, CSS, JS) from the 'src' directory
app.use(express.static(path.join(__dirname, 'src')));

// Default route that serves the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});