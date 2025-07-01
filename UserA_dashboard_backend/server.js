// server.js
const express = require('express');
const sqlite3 = require('./node_modules/sqlite3').verbose();
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io'); // A frontend <-> backend
const clientIO = require('socket.io-client'); // A backend <-> hub <-> B backend

const app = express();
const PORT = 5000;
const HUB_PORT = 9000;
const server = http.createServer(app);
const hubSocket = clientIO(`http://localhost:${HUB_PORT}`);

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:6173'], // frontends A and B
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('../UserA_dashboard_frontend'));

const io = socketIO(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});



hubSocket.on('connect', () => {
    console.log('Backend A: Connected to Central Hub.');
    hubSocket.emit('registerBackend', 'BackendA'); // Identify self to hub
});

hubSocket.on('backendMessage', (message) => {
    if (message.from !== 'BackendA') { // Avoid processing messages sent by self
        console.log('Backend A: Received message from other backend via Hub:', message);
        // Process message, e.g., update user status
        if (message.event === 'USER_STATUS_UPDATE') {
            console.log(`Backend A: User ${message.data.userId} now ${message.data.status}`);
            // ... update database or local state
        }
    }
});

hubSocket.on('disconnect', () => {
    console.log('Backend A: Disconnected from Central Hub.');
});

hubSocket.on('connect_error', (error) => {
    console.error('Backend A: Hub connection error:', error.message);
});

// // Example API endpoint on Backend A that sends messages via the Hub
// app.post('/api/backendA-event', (req, res) => {
//     const { event, payload } = req.body;
//     console.log(`Backend A: Triggering event "${event}" with payload:`, payload);

//     // Send the event to other backends via the hub
//     hubSocket.emit('backendMessage', { event, payload });

//     res.status(200).json({ message: 'Event processed and sent to hub.' });
// });








// Listen for messages from the client
io.on('connect', (socket) => {

    socket.emit('welcome', 'server.js (A): backend connected');
    console.log('server.js (A): backend sent welcome message');

    socket.on('clientMessage', (data) => {
        console.log('server.js (A) received message:', data);
        socket.emit('message', `Server A recevied: ${data}`); // respond to frontend
    });
});


// Initialize database
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

    // send message to frontend in real time
    io.emit('update', "USER B HAS RESPONDED");
    console.log("server.js (A): sent update message to frontend A");

});


// Start the server
server.listen(PORT, () => {
    console.log(`Backend server (A) running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});
