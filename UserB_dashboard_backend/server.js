// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 6000;

const ALL_ACTION_IDS = [];
const CURRENT_ACTION_IDS = [];

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('../UserA_dashboard_backend/dashboard.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// API endpoints to get dashboard data
app.get('../UserA_dashboard_backend/api/dashboard-data/browsingHistory', (req, res) => {

    db.all('SELECT * FROM browsingHistory', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log("Successfully retrieved dashboard-data/browsingHistory");
        res.json({
            message: 'Success',
            data: rows
        });
    });
});

app.get('../UserA_dashboard_backend/api/dashboard-data/action', (req, res) => {

    db.all('SELECT * FROM action', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log("Successfully retrieved dashboard-data/action");
        res.json({
            message: 'Success',
            data: rows
        });
    });


    // CHECK IF NEW ROW NOT MATCHING CURRENT/RESOLVED IDS HAS BEEN ADDED = NEW REQUEST
    // ADD TO CURRENT IDS and ALL_IDS: 
    // ALL_ACTION_IDS.push(newID);
    // CURRENT_ACTION_IDS.push(newID);
    // IF NEW REQUEST EXISTS, TRIGGER ACTION TO BE TAKEN
    // WHEN ACTION IS TAKEN, REMOVE FROM CURRENT IDS

});

// handler for frontend POST requests
app.post('../UserA_dashboard_backend/api/dashboard-data', (req, res) => {

    const target = req.body.target;
    const data = req.body.data;

    console.log("POST target: ", target);

    console.log('Received POST request data:', req.body);

    if (target === 'USER_B_RESPONSE') {

        // TO DO: INITIALISE VARIABLES
        // TO DO: INSERT VALUES INTO APPROPRIATE COLUMN
        
        try{
            console.log("Inserting into action table");
            const stmt = db.prepare('INSERT INTO action (actionID, context, userAChoice, time, resolved, responseOutcome) VALUES (?, ?, ?, ?, ?, ?)');
            stmt.run(id, context, choice, time, 'NULL', 'NULL');
        }
        catch(err) {
            console.error('Database insertion error:', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        res.status(201).json({ message: 'Data saved successfully!', id: this.lastID });
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
