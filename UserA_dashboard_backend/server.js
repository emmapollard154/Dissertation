// server.js
const express = require('express');
const sqlite3 = require('./node_modules/sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 5000; // Port for backend API

app.use(cors()); // allow cross origin requests (from frontend)
app.use(express.json()); // parses incoming JSON request bodies

// Initialize SQLite database
const db = new sqlite3.Database('./dashboard.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS browsingHistory (
            url VARCHAR(255),
            time DATETIME
        )`, (createErr) => {
            if (createErr) {
                console.error('Error creating table:', createErr.message);
            } else {
                console.log('Table "browsingHistory" created.');
            }
        });
    }
});


// API endpoint to get dashboard data
app.get('/api/dashboard-data', (req, res) => {
    db.all('SELECT * FROM browsingHistory', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log("Successfully retrieved dashboard-data")
        res.json({
            message: 'Success',
            data: rows
        });
    });
});


// handler for frontend POST requests
app.post('/api/dashboard-data', (req, res) => {
    const dataFromFrontend = req.body; // data received from frontend

    console.log('Received POST request data:', dataFromFrontend);

    try{
        const stmt = db.prepare('INSERT INTO browsingHistory (url, time) VALUES (?, ?)');
        stmt.run(dataFromFrontend.data.newUrl, dataFromFrontend.data.newTime);
    }
    catch(err) {
        console.error('Database insertion error:', err.message);
        return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
    }
    res.status(201).json({ message: 'Data saved successfully!', id: this.lastID });

});



// Start the server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
    console.log('Start React frontend on a different port (e.g., 3000).');
});


// Gracefully close the database connection when the app exits
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});
