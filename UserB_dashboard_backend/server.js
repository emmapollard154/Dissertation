// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 6000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('../UserA_dashboard_backend/dashboard.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});


app.post('../UserA_dashboard_backend/api/dashboard-data', (req, res) => {

    const target = req.body.target;
    const data = req.body;

    console.log("POST target (server B): ", target);

    console.log('Received POST request data (server B):', data);

    if (target === 'USER_B_RESPONSE') {

        console.log("Attempting to insert action response");

        const id = data.actionID;
        const outcome = data.outcome;
        
        try{
            console.log("Inserting into action table");
            const stmt = db.prepare('INSERT INTO action (resolved, responseOutcome) VALUES (?, ?)');
            stmt.run('Y', outcome);
        }
        catch(err) {
            console.error('Database insertion error:', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        res.status(201).json({ message: 'Data saved successfully!', id: this.lastID });
    } else {
        console.log("Target not registered")
    }

});



// Start the server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
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
