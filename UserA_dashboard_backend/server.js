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
    console.log('server.js (A): connected to websockets hub.');
    hubSocket.emit('registerBackend', 'server_A');
});

hubSocket.on('backendMessage', (message) => { // process messages from the hub
    if (message.from !== 'server_A') {
        if (message.event === 'USER_B_RESPONSE') {
            console.log('server.js (A): User B has responded.');
        }
    }
});

hubSocket.on('disconnect', () => {
    console.log('server.js (A): disconnected from websockets hub.');
});

hubSocket.on('connect_error', (error) => {
    console.error('server.js (A): websockets hub connection error: ', error.message);
});


io.on('connect', (socket) => {
    socket.emit('welcome', 'server.js (A): backend connected.');

    socket.on('clientMessage', (data) => { // message from frontend
        console.log('server.js (A) received message: ', data);
        socket.emit('message', `server.js (A) received: ${data}`); // respond to frontend
    });
});


// Initialize database
const db = new sqlite3.Database('../dashboard.db', (err) => {
    if (err) {
        console.error('server.js (A): error connecting to database:', err.message);
    } else {
        console.log('server.js (A): connected to the database.');

        // create table for browsing history
        db.run(`CREATE TABLE IF NOT EXISTS browsingHistory (
            url VARCHAR(255),
            time DATETIME
        )`, (createErr) => {
            if (createErr) {
                console.error('server.js (A): error creating table:', createErr.message);
            } else {
                console.log('server.js (A): browsingHistory table created / already exists.');
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
                console.error('server.js (A): error creating table:', createErr.message);
            } else {
                console.log('server.js (A): action table created / already exists.');
            }
        });

        // create table for messages
        db.run(`CREATE TABLE IF NOT EXISTS message (
            message VARCHAR(255),
            userID CHAR(1),
            time DATETIME
        )`, (createErr) => {
            if (createErr) {
                console.error('server.js (A): error creating table:', createErr.message);
            } else {
                console.log('server.js (A): action table created / already exists.');
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
        console.log('server.js (A): successfully retrieved dashboard-data/browsingHistory.');
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
        console.log('server.js (A): successfully retrieved dashboard-data/action.');
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
        console.log('server.js (A): successfully retrieved dashboard-data/message.');
        res.json({
            message: 'Success',
            data: rows
        });
    });
});

// Handler for frontend POST requests
app.post('/api/dashboard-data', (req, res) => {

    const target = req.body.target;
    const data = req.body.data;

    if (target === 'BROWSING_DATA') {
        
        try{
            console.log('server.js (A): inserting into browsingHistory table.');
            const stmt = db.prepare('INSERT INTO browsingHistory (url, time) VALUES (?, ?)');
            stmt.run(data.newUrl, data.newTime);
        }
        catch(err) {
            console.error('server.js (A): database insertion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        io.emit('a_browser', data.newUrl);
        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        hubSocket.emit('backendMessage', { event: 'BROWSING_DATA', data: data.newUrl}); // message hub
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
            console.log('server.js (A): inserting into action table.');
            const stmt = db.prepare('INSERT INTO action (actionID, context, userAChoice, time, resolved, responseOutcome) VALUES (?, ?, ?, ?, ?, ?)');
            stmt.run(id, context, choice, time, resolved, responseOutcome);
        }
        catch(err) {
            console.error('server.js (A): database insertion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        io.emit('a_choice', choice);
        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        hubSocket.emit('backendMessage', { event: 'USER_A_CHOICE', data: choice }); // message hub
    }

    if (target === 'USER_A_MESSAGE') {

        const message = data.message;
        const time = data.time;
        
        try{
            console.log('server.js (A): inserting into message table.');
            const stmt = db.prepare('INSERT INTO message (message, userID, time) VALUES (?, ?, ?)');
            stmt.run(message, 'A', time);
        }
        catch(err) {
            console.error('server.js (A): database insertion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        hubSocket.emit('backendMessage', { event: 'USER_A_MESSAGE', data: message }); // message hub
        io.emit('a_message', message); // respond to frontend
    }
});

app.post('/api/data-from-b', (req, res) => {
    // Basic API Key Authentication (add more robust validation in production)
    // const apiKey = req.headers['x-api-key'];
    // if (!apiKey || apiKey !== API_KEY_SECRET) {
    //     return res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
    // }

    const target = req.body.target;
    const data = req.body.data;

    if (target === 'USER_B_RESPONSE') {

        const id = data.id;
        const outcome = data.outcome;

        try{
            console.log('server.js (A): inserting into action table.');
            const stmt = db.prepare('UPDATE action SET resolved = ?, responseOutcome = ? WHERE actionID = ?');
            stmt.run('Y', outcome, id);
        }
        catch(err) {
            console.error('server.js (A): database insertion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }

        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        io.emit('b_response', outcome); // send message to frontend
    }


    if (target === 'USER_B_MESSAGE') {

        const message = data.payload.message;
        const time = data.payload.time;

        try{
            console.log('server.js (A): inserting into message table.');
            const stmt = db.prepare('INSERT INTO message (message, userID, time) VALUES (?, ?, ?)');
            stmt.run(message, 'B', time);
        }
        catch(err) {
            console.error('server.js (A): database insertion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }

        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        io.emit('b_message', data.payload.message); // send message to frontend
    }
});

// Start the server
server.listen(A_PORT, () => {
    console.log(`Backend server (A) running on http://localhost:${A_PORT}`);
});

// Close gracefully
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('server.js (A): error closing database: ', err.message);
        }
        console.log('server.js (A): database connection closed.');
        process.exit(0);
    });
});
