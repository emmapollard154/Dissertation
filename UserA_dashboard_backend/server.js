// server.js
const express = require('express');
const sqlite3 = require('./node_modules/sqlite3').verbose();
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io'); // A frontend <-> backend
const clientIO = require('socket.io-client'); // A backend <-> hub <-> B backend

const A_PORT = 5000;
const A_FRONT = 5173;
const B_FRONT = 6173;
const HUB_PORT = 9000;

const app = express();
const server = http.createServer(app);
const hubSocket = clientIO(`http://localhost:${HUB_PORT}`);
const io = socketIO(server, {
    cors: {
        origin: `http://localhost:${A_FRONT}`,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(cors({
    origin: [`http://localhost:${A_FRONT}`, `http://localhost:${B_FRONT}`],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('../UserA_dashboard_frontend'));

hubSocket.on('connect', () => {
    console.log('Backend A: Connected to Central Hub.');
    hubSocket.emit('registerBackend', 'BackendA'); // Identify self to hub
});

hubSocket.on('backendMessage', (message) => {
    if (message.from !== 'BackendA') { // Avoid processing messages sent by self
        console.log('Backend A: Received message from other backend via Hub:', message);
        if (message.event === 'USER_B_RESPONSE') {
            console.log(`Backend A: USER B HAS RESPONSED`);
            console.log(`TO DO: TRIGGER NOTIFICATION`);
        }
    }
});

hubSocket.on('disconnect', () => {
    console.log('Backend A: Disconnected from Central Hub.');
});

hubSocket.on('connect_error', (error) => {
    console.error('Backend A: Hub connection error:', error.message);
});

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

        // create table for messages
        db.run(`CREATE TABLE IF NOT EXISTS message (
            message VARCHAR(255),
            userID CHAR(1),
            time DATETIME
        )`, (createErr) => {
            if (createErr) {
                console.error('Error creating table:', createErr.message);
            } else {
                console.log('message table created.');
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

app.get('/api/dashboard-data/message', (req, res) => {

    db.all('SELECT * FROM message', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log("Successfully retrieved dashboard-data/message");
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
        io.emit('a_browsing', '');
        res.status(201).json({ message: 'Data saved successfully!', id: this.lastID });

        console.log("Server (A): User A has updated browsing history");
        hubSocket.emit('backendMessage', { target });

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
        io.emit('a_choice', '');
        res.status(201).json({ message: 'Data saved successfully!', id: this.lastID });

        console.log("Server (A): User A has made a choice");
        hubSocket.emit('backendMessage', { target, choice });

    }

    if (target === 'USER_A_MESSAGE') {

        const message = data.message;
        const time = data.time;

        console.log(data);
        
        try{
            console.log("Inserting into message table");
            const stmt = db.prepare('INSERT INTO message (message, userID, time) VALUES (?, ?, ?)');
            stmt.run(message, 'A', time);
        }
        catch(err) {
            console.error('Database insertion error:', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        res.status(201).json({ message: 'Data saved successfully!', id: this.lastID });

        console.log("Server (A): User A posted a message");
        hubSocket.emit('backendMessage', { target, message });
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


        // send message to frontend in real time
        io.emit('b_response', outcome);
        console.log("server.js (A): sent update message to frontend A");

    }


    if (target === 'USER_B_MESSAGE') {
        console.log("Attempting to insert message from B");

        const message = data.payload.message;
        const time = data.payload.time;

        console.log("User B message recevied: ", data.payload);

        try{
            console.log("Inserting into message table");
            const stmt = db.prepare('INSERT INTO message (message, userID, time) VALUES (?, ?, ?)');
            stmt.run(message, 'B', time);
        }
        catch(err) {
            console.error('Database insertion error:', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        res.status(201).json({ message: 'Data saved successfully!', id: this.lastID });


        // send message to frontend in real time
        io.emit('b_message', message);
        console.log("server.js (A): sent update message to frontend A");

    }


});


// Start the server
server.listen(A_PORT, () => {
    console.log(`Backend server (A) running on http://localhost:${A_PORT}`);
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
