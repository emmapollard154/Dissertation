/**
 * @fileoverview Server code for User A dashboard.
 * @file server.js
 * @author Emma Pollard
 * @version 1.0
 */

const express = require('express');
const sqlite3 = require('./node_modules/sqlite3').verbose();
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io'); // A frontend <-> backend
const clientIO = require('socket.io-client'); // A backend <-> hub <-> B backend

/**
 * Port on which the User A dashboard backend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const A_BACKEND = 5000;
/**
 * Port on which User A dashboard frontend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const A_FRONTEND = 5173;
/**
 * Port on which User B dashboard frontend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const B_FRONTEND = 6173;
/**
 * Port on which central WebSocket hub runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const HUB_PORT = 9000;

const app = express();
const server = http.createServer(app);
const hubSocket = clientIO(`http://localhost:${HUB_PORT}`);

const io = socketIO(server, {
    cors: {
        origin: `http://localhost:${A_FRONTEND}`,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(cors({ // manage cross origin resource sharing
    origin: [`http://localhost:${A_FRONTEND}`, `http://localhost:${B_FRONTEND}`],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('../UserA_dashboard_frontend'));

hubSocket.on('connect', () => { // register connection to central hub
    console.log('server.js (A): connected to websockets hub.');
    hubSocket.emit('registerBackend', 'server_A');
});

hubSocket.on('backendMessage', (message) => { // process messages from central hub
    if (message.from !== 'server_A') {
        if (message.event === 'USER_B_RESPONSE') {
            console.log('server.js (A): User B has responded.');
        }
    }
});

hubSocket.on('disconnect', () => { // register disconnection from central hub
    console.log('server.js (A): disconnected from websockets hub.');
});

hubSocket.on('connect_error', (error) => { // register central hub connection error
    console.error('server.js (A): websockets hub connection error: ', error.message);
});

io.on('connect', (socket) => { // register connection to central hub to dashboard frontend
    socket.emit('welcome', 'server.js (A): backend connected.');
});

const db = new sqlite3.Database('../dashboard.db', (err) => { // initialise database
    if (err) {
        console.error('server.js (A): error connecting to database:', err.message);
    } else {
        console.log('server.js (A): connected to the database.');
        db.run(`CREATE TABLE IF NOT EXISTS browsingHistory (
            url VARCHAR(255),
            time DATETIME
        )`, (createErr) => {
            if (createErr) {
                console.error('server.js (A): error creating table:', createErr.message);
            } else {
                console.log('server.js (A): browsingHistory table created / already exists.');
            }
        }); // create table for browsing history
        db.run(`CREATE TABLE IF NOT EXISTS action (
            actionID CHARACTER(18),
            context VARCHAR(32),
            userAChoice CHARACTER(1),
            time DATETIME,
            resolved CHARACTER(1),
            responseOutcome CHARACTER(1),
            url VARCHAR(64)
        )`, (createErr) => {
            if (createErr) {
                console.error('server.js (A): error creating table:', createErr.message);
            } else {
                console.log('server.js (A): action table created / already exists.');
            }
        }); // create table for user A actions
        db.run(`CREATE TABLE IF NOT EXISTS message (
            message VARCHAR(255),
            userID CHAR(1),
            time DATETIME
        )`, (createErr) => {
            if (createErr) {
                console.error('server.js (A): error creating table:', createErr.message);
            } else {
                console.log('server.js (A): message table created / already exists.');
            }
        }); // create table for messages
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            context CHAR(1) UNIQUE,
            opt1 CHAR(1),
            opt2 CHAR(1),
            opt3 CHAR(1),
            opt4 CHAR(1),
            opt5 CHAR(1)
        )`, (createErr) => {
            if (createErr) {
                console.error('server.js (A): error creating table:', createErr.message);
            } else {
                console.log('server.js (A): settings table created / already exists.');
            }
        }); // create table for browsing history
        db.run(`CREATE TABLE IF NOT EXISTS requests (
            context CHAR(2) UNIQUE,
            status CHAR(1)
        )`, (createErr) => {
            if (createErr) {
                console.error('server.js (A): error creating table:', createErr.message);
            } else {
                console.log('server.js (A): requests table created / already exists.');
            }
        }); // create table for requests
        db.run(`CREATE TABLE IF NOT EXISTS trusted (
            address VARCHAR(256)
        )`, (createErr) => {
            if (createErr) {
                console.error('server.js (A): error creating table:', createErr.message);
            } else {
                console.log('server.js (A): trusted table created / already exists.');
            }
        }); // create table for trusted contacts
    }
});

app.get('/api/dashboard-data/browsingHistory', (req, res) => { // API endpoint to get browsing history data
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

app.get('/api/dashboard-data/action', (req, res) => { // API endpoint to get action data
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

app.get('/api/dashboard-data/message', (req, res) => { // API endpoint to get message data
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

app.get('/api/dashboard-data/settings', (req, res) => { // API endpoint to get settings data
    db.all('SELECT * FROM settings', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('server.js (A): successfully retrieved dashboard-data/settings.');
        res.json({
            message: 'Success',
            data: rows
        });
    });
});

app.get('/api/dashboard-data/requests', (req, res) => { // API endpoint to get requests data
    db.all('SELECT * FROM requests', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('server.js (A): successfully retrieved dashboard-data/requests.');
        res.json({
            message: 'Success',
            data: rows
        });
    });
});

app.get('/api/dashboard-data/trusted', (req, res) => { // API endpoint to get trusted contacts data
    db.all('SELECT * FROM trusted', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('server.js (A): successfully retrieved dashboard-data/trusted.');
        res.json({
            message: 'Success',
            data: rows
        });
    });
});

app.post('/api/dashboard-data', (req, res) => { // handler for frontend POST requests from User A
    const target = req.body.target;
    const data = req.body.data;
    if (target === 'BROWSING_DATA') { // insert into browsing history table
        try{
            console.log('server.js (A): inserting into browsingHistory table.');
            const stmt = db.prepare('INSERT INTO browsingHistory (url, time) VALUES (?, ?)');
            stmt.run(data.newUrl, data.newTime);
        }
        catch(err) {
            console.error('server.js (A): database insertion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        io.emit('a_browser', data.newUrl); // update frontend
        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        hubSocket.emit('backendMessage', { event: 'BROWSING_DATA', data: data.newUrl}); // update central hub
    }
    if (target === 'USER_A_CHOICE') { // insert into action table
        const id = data.id;
        const choice = data.choice;
        const time = data.time;
        const context = data.context;
        const responseOutcome = '0';
        const url = data.url;
        let addAction = false;
        let resolved = 'N';
        if (choice === '1' || choice === '5') { // User B not required and action not logged
            resolved = 'Y';
            addAction = false;
        }
        if (choice === '2') { // User B not required and but action logged
            resolved = 'Y';
            addAction = true;
        }
        if (choice === '3' || choice === '4') { // User B required and action logged
            resolved = 'N';
            addAction = true;
        }
        if (addAction) {
            try {
                console.log('server.js (A): inserting into action table.');
                const stmt = db.prepare('INSERT INTO action (actionID, context, userAChoice, time, resolved, responseOutcome, url) VALUES (?, ?, ?, ?, ?, ?, ?)');
                stmt.run(id, context, choice, time, resolved, responseOutcome, url);
            }
            catch(err) {
                console.error('server.js (A): database insertion error: ', err.message);
                return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
            }
            io.emit('a_choice', choice); // update fronted
            res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
            hubSocket.emit('backendMessage', { event: 'USER_A_CHOICE', data: choice }); // update central hub
        }
    }
    if (target === 'USER_A_MESSAGE') { // insert into message table
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
        io.emit('a_message', message); // update frontend
        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        hubSocket.emit('backendMessage', { event: 'USER_A_MESSAGE', data: message }); // update central hub
    }
    if (target === 'SET_EMAIL_SETTINGS') { // update settings and action tables
        const opt1 = data.chosen[0];
        const opt2 = data.chosen[1];
        const opt3 = data.chosen[2];
        const opt4 = data.chosen[3];
        const opt5 = data.chosen[4];
        try {
            console.log('server.js (A): updating settings table.');
            const stmt = db.prepare('INSERT OR REPLACE INTO settings (context, opt1, opt2, opt3, opt4, opt5) VALUES (?, ?, ?, ?, ?, ?)'); // update settings configuration
            stmt.run('E', opt1, opt2, opt3, opt4, opt5);
        }
        catch(err) {
            console.error('server.js (A): database insertion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        const id = data.id;
        const time = data.time;
        const choice =  'Y';
        const context = 'Settings';
        const resolved = 'Y';
        const responseOutcome = '0';
        try {
            console.log('server.js (A): inserting into action table.');
            const stmt = db.prepare('INSERT INTO action (actionID, context, userAChoice, time, resolved, responseOutcome) VALUES (?, ?, ?, ?, ?, ?)'); // insert into action table
            stmt.run(id, context, choice, time, resolved, responseOutcome);
        }
        catch(err) {
            console.error('server.js (A): database insertion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        io.emit('email_settings', data.chosen); // update frontend
        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        hubSocket.emit('backendMessage', { event: 'SET_EMAIL_SETTINGS', data: data.chosen }); // update central hub
    }
    if (target === 'UPDATE_REQUEST') { // update requests table
        const env = data.payload.context;
        const user = data.payload.user;
        const status = data.payload.status;
        let context = '';
        if (status === 'Y') { // log the context requiring update
            context = env + user;
        }
        else if (status === 'N') { // cancelling request, full context already present
            context = env;
        }
        try {
            console.log('server.js (A): updating requests table.');
            const stmt = db.prepare('INSERT OR REPLACE INTO requests (context, status) VALUES (?, ?)');
            stmt.run(context, status);
        }
        catch(err) {
            console.error('server.js (A): database insertion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        hubSocket.emit('backendMessage', { event: 'UPDATE_REQUEST', data: data }); // update central hub
        if (user === 'A') { // log which user contributed
            console.log('server.js (A): update request from A.')
            io.emit('a_update_request', data.payload); // message frontend
        }
        else if (user === 'B') {
            console.log('server.js (A): update request from B.')
            io.emit('b_update_request', data.payload); // message frontend
        }
        else {
            console.warn('server.js (A): update request from unknown user.')
        }
    }
    if (target === 'ADD_TRUSTED') { // insert into trusted contacts table
        const address = data.address;
        try {
            console.log('server.js (A): inserting into trusted table.');
            const stmt = db.prepare('INSERT INTO trusted (address) VALUES (?)');
            stmt.run(address);
        }
        catch(err) {
            console.error('server.js (A): database insertion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        io.emit('add_trusted', address); // update frontend
        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        hubSocket.emit('backendMessage', { event: 'ADD_TRUSTED', data: address }); // update central hub
    }
    if (target === 'REMOVE_TRUSTED') { // remove from trusted contacts table
        const address = data.address;
        try {
            console.log('server.js (A): removing entry from trusted table.');
            const stmt = db.prepare('DELETE FROM trusted WHERE address = ?');
            stmt.run(address);
        }
        catch(err) {
            console.error('server.js (A): database deletion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        io.emit('remove_trusted', address); // update frontend
        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        hubSocket.emit('backendMessage', { event: 'REMOVE_TRUSTED', data: address }); // update central hub
    }
    if (target === 'AUTO_MESSAGE') { // User A sent automatic help message
        io.emit('auto_message', ''); // update frontend
    }
    if (target === 'EMAIL_CONTENT') { // User A forwarded email contents
        io.emit('email_content', data); // update frontend
    }
});

app.post('/api/data-from-b', (req, res) => { // handler from frontend POST requests from User B
    const target = req.body.target;
    const data = req.body.data;
    if (target === 'USER_B_RESPONSE') { // insert into action table
        const id = data.data.actionID;
        const outcome = data.outcome;
        const time = data.data.time;
        const url = data.data.url;
        try{
            console.log('server.js (A): inserting into action table.');
            const stmt = db.prepare('UPDATE action SET time = ?, resolved = ?, responseOutcome = ? WHERE actionID = ?');
            stmt.run(time,'Y', outcome, id);
        }
        catch(err) {
            console.error('server.js (A): database insertion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        io.emit('b_response', { outcome,  url }); // update frontend
    }
    if (target === 'USER_B_MESSAGE') { // insert into message table
        const message = data.payload.message;
        const time = data.payload.time;
        try {
            console.log('server.js (A): inserting into message table.');
            const stmt = db.prepare('INSERT INTO message (message, userID, time) VALUES (?, ?, ?)');
            stmt.run(message, 'B', time);
        }
        catch(err) {
            console.error('server.js (A): database insertion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        io.emit('b_message', data.payload.message); // update frontend
    }
    if (target === 'UPDATE_REQUEST') {
        const env = data.payload.context;
        const user = data.payload.user;
        const status = data.payload.status;
        let context = '';
        if (status === 'Y') { // log the context requiring update
            context = env + user;
        }
        else if (status === 'N') { // cancelling request, full context already present
            context = env;
        }
        try {
            console.log('server.js (A): updating requests table.');
            const stmt = db.prepare('INSERT OR REPLACE INTO requests (context, status) VALUES (?, ?)');
            stmt.run(context, status);
        }
        catch(err) {
            console.error('server.js (A): database insertion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        io.emit('b_update_request', data.payload); // update frontend
    }
    if (target === 'USER_B_VIEW') { // insert into action table when User B views browsing history
        console.log('server.js (A): trying to add User B view to action table.');
        const id = data.payload.actionID;
        const context = data.payload.context;
        const time = data.payload.time;
        try {
            console.log('server.js (A): inserting into action table.');
            const stmt = db.prepare('INSERT INTO action (actionID, context, userAChoice, time, resolved, responseOutcome, url) VALUES (?, ?, ?, ?, ?, ?, ?)');
            stmt.run(id, context, '0', time, 'Y', '0', '');
        }
        catch(err) {
            console.error('server.js (A): database insertion error: ', err.message);
            return res.status(500).json({ message: 'Failed to save data to database', error: err.message });
        }
        res.status(201).json({ message: 'server.js (A): data saved.', id: this.lastID });
        io.emit('b_view', data.payload); // update frontend
    }
});

server.listen(A_BACKEND, () => { // start the server
    console.log(`Backend server (A) running on http://localhost:${A_BACKEND}`);
});

process.on('SIGINT', () => { // close gracefully
    db.close((err) => {
        if (err) {
            console.error('server.js (A): error closing database: ', err.message);
        }
        console.log('server.js (A): database connection closed.');
        process.exit(0);
    });
});
