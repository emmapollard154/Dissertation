// server.js
const express = require('express');
const sqlite3 = require('./node_modules/sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 5000; // Port for backend API

app.use(cors()); // allow cross origin requests (from frontend)
app.use(express.json()); // parses incoming JSON request bodies

// Initialize SQLite database
const db = new sqlite3.Database('../dashboard.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // create table for browsing history
        db.run(`CREATE TABLE IF NOT EXISTS browsingHistory (
            url VARCHAR(255),
            time DATETIME
        )`, (createErr) => {
            if (createErr) {
                console.error('Error creating table:', createErr.message);
            } else {
                console.log('browsingHistory table created.');
            }
        });

        // create table for user A actions
        db.run(`CREATE TABLE IF NOT EXISTS action (
            actionID CHARACTER(18),
            context VARCHAR(32),
            userAChoice CHARACTER(1),
            time DATETIME,
            resolved CHARACTER(1),
            responseOutcome CHARACTER(1)
        )`, (createErr) => {
            if (createErr) {
                console.error('Error creating table:', createErr.message);
            } else {
                console.log('action table created.');
            }
        });

    }
});


// API endpoints to get dashboard data
app.get('/api/dashboard-data/browsingHistory', (req, res) => {

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

app.get('/api/dashboard-data/action', (req, res) => {

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
});

// handler for frontend POST requests
app.post('/api/dashboard-data', (req, res) => {

    const target = req.body.target;
    const data = req.body.data;

    console.log("POST target (server A): ", target);

    console.log('Received POST request data (server A):', req.body);

    if (target === 'BROWSING_DATA') {
        
        try{
            console.log("Inserting into browsingHistory table");
            const stmt = db.prepare('INSERT INTO browsingHistory (url, time) VALUES (?, ?)');
            stmt.run(data.newUrl, data.newTime);
        }
        catch(err) {
            console.error('Database insertion error:', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        res.status(201).json({ message: 'Data saved successfully!', id: this.lastID });
    }

    if (target === 'USER_A_CHOICE') {

        const id = data.id;
        const choice = data.choice;
        const time = data.time;
        const context = data.context;
        let resolved = "E";

        // TEMP
        if (choice === "1") {
            resolved = "Y";
        } else {
            resolved = "N";
        }

        const responseOutcome = "0";

        try {
            console.log("Inserting into action table");
            const stmt = db.prepare('INSERT INTO action (actionID, context, userAChoice, time, resolved, responseOutcome) VALUES (?, ?, ?, ?, ?, ?)');
            stmt.run(id, context, choice, time, resolved, responseOutcome);
        }
        catch(err) {
            console.error('Database insertion error:', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        res.status(201).json({ message: 'Data saved successfully!', id: this.lastID });
    }

    // if (target === 'USER_B_RESPONSE') {
    //     console.log("Attempting to insert action response");
    //     console.log(data);

    //     const id = data.id;
    //     const outcome = data.outcome;

    //     try{
    //         console.log("Inserting into action table");
    //         const stmt = db.prepare('UPDATE action SET resolved = ?, responseOutcome = ? WHERE actionID = ?');
    //         stmt.run('Y', outcome, id);
    //     }
    //     catch(err) {
    //         console.error('Database insertion error:', err.message);
    //         return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
    //     }
    //     res.status(201).json({ message: 'Data saved successfully!', id: this.lastID });
    // }

});


app.post('/api/data-from-b', (req, res) => {
    // Basic API Key Authentication (add more robust validation in production)
    // const apiKey = req.headers['x-api-key'];
    // if (!apiKey || apiKey !== API_KEY_SECRET) {
    //     return res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
    // }

    console.log("request body: ", req.body);

    const target = req.body.target;
    const data = req.body.data;

    if (target === 'USER_B_RESPONSE') {
        console.log("Attempting to insert action response");

        const id = data.id;
        const outcome = data.outcome;

        try{
            console.log("Inserting into action table");
            const stmt = db.prepare('UPDATE action SET resolved = ?, responseOutcome = ? WHERE actionID = ?');
            stmt.run('Y', outcome, id);
        }
        catch(err) {
            console.error('Database insertion error:', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        res.status(201).json({ message: 'Data saved successfully!', id: this.lastID });
    }

    console.log("TO DO: SEND NOTIFICATION");
    // res.status(201).json({ message: 'Data inserted successfully into A\'s database!'});
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
