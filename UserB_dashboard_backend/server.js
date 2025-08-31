/**
 * @fileoverview Server code for User B dashboard.
 * @file server.js
 * @author Emma Pollard
 * @version 1.0
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const socketIO = require('socket.io');
const clientIO = require('socket.io-client');

/**
 * Port on which the User B dashboard backend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const B_BACKEND = 8080;
/**
 * Port on which User A dashboard frontend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const A_FRONTEND = 5173;
/**
 * Port on which the User A dashboard backend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const A_BACKEND = 5000;
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
        origin: `http://localhost:${B_FRONTEND}`,
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

hubSocket.on('connect', () => { // register connection to central hub
    console.log('server.js (B): connected to websockets hub.');
    hubSocket.emit('registerBackend', 'server_b');
});

hubSocket.on('backendMessage', (message) => { // process messages from central hub
    if (message.from !== 'server_b') {
        const content = message.data;
        if (message.event === 'USER_A_MESSAGE') { // User A sent a message
            console.log('server.js (B): User A has sent a message: ', content);
            io.emit('a_message', content); // update frontend
            console.log('server.js (B): sent update message to frontend B.');
        }
        if (message.event === 'BROWSING_DATA') { // User A updated browsing history
            console.log('server.js (B): User A has updated browsing history.');
            io.emit('a_browser', content); // update frontend
            console.log('server.js (B): sent browsing history update message to frontend B.');
        }
        if (message.event === 'USER_A_CHOICE') { // User A made a choice
            console.log("Server B: User A has made a choice");
            io.emit('a_choice', content); // update frontend
            console.log('server.js (B): sent choice update message to frontend B.');
        }
        if (message.event === 'SET_EMAIL_SETTINGS') { // email settings are configured
            console.log("Server B: Email settings have been updated");
            io.emit('email_settings', content); // update frontend
            console.log('server.js (B): sent email settings update message to frontend B.');
        }
        if (message.event === 'UPDATE_REQUEST') { // request to update settings
            console.log('server.js (B): User A requested to update settings.');
            io.emit('a_update_request', content); // update frontend
            console.log('server.js (B): sent update request message to frontend B.');
        }
        if (message.event === 'ADD_TRUSTED') { // add a trusted contact
            console.log('server.js (B): User A added trusted contact.');
            io.emit('add_trusted', content); // update frontend
            console.log('server.js (B): sent new trusted contact message to frontend B.');
        }
        if (message.event === 'REMOVE_TRUSTED') { // remove a trusted contact
            console.log('server.js (B): User A removed trusted contact.');
            io.emit('remove_trusted', content); // update frontend
            console.log('server.js (B): sent remove trusted contact message to frontend B.');
        }
    }
});

hubSocket.on('disconnect', () => { // register disconnection from central hub
    console.log('server.js (B): disconnected from websockets hub.');
});

hubSocket.on('connect_error', (error) => { // register central hub connection error
    console.error('server.js (B): websockets hub connection error: ', error.message);
});

io.on('connect', (socket) => { // register connection to central hub to dashboard frontend
    socket.emit('welcome', 'server.js (B): backend connected');
});

const db = new sqlite3.Database('../dashboard.db', (err) => { // connect to database
    if (err) {
        console.error('server.js (B): error connecting to database: ', err.message);
    } else {
        console.log('server.js (B): connected to the database.');
    }
});

app.post('/api/data-b-frontend', async (req, res) => { // handler for frontend POST requests
    const data = req.body; // data from User B frontend
    console.log('server.js (B): received data from User B frontend: ', data);
    try {
        const response = await axios.post(`http://localhost:${A_BACKEND}/api/data-from-b`, data, {
            headers: {
                'Content-Type': 'application/json',
            }
        }); // make HTTP POST request to server.js (A)
        if (response.status === 201) { // success
            console.log('server.js (B): successfully forwarded data to A backend: ', response.data);
            if (data.data.type === 'USER_B_RESPONSE') { // User B response to a request
                console.log('server.js (B): sending response notification to hub');
                hubSocket.emit('backendMessage', { event: 'USER_B_RESPONSE', data: data.data }); // update central hub
                io.emit('b_response', data.data.outcome); // update frontend
            }
            if (data.data.type === 'USER_B_MESSAGE') { // message from User B
                console.log('server.js (B): sending message to hub');
                hubSocket.emit('backendMessage', { event: 'USER_B_MESSAGE', data: data.data.payload }); // update central hub
                io.emit('b_message', data.data.payload.message); // update frontend
            }
            if (data.data.type === 'UPDATE_REQUEST') { // request to update settings
                console.log('server.js (B): sending message to hub');
                hubSocket.emit('backendMessage', { event: 'UPDATE_REQUEST', data: data.data.payload }); // update central hub
                io.emit('b_update_request', data.data.payload); // update frontend
            }
            if (data.data.type === 'USER_B_VIEW') { // User B viewed browsing history
                console.log('server.js (B): sending message to hub');
                hubSocket.emit('backendMessage', { event: 'USER_B_VIEW', data: data.data.payload }); // update central hub
                io.emit('b_view', data.data.payload); // update frontend
            }
            res.status(200).json({ message: 'server.js (B): data sent to hub.' });
            console.log({ message: 'server.js (B): data process and responses made.', result: response.data });
        } else { // error
            console.error('server.js (B): error from backend A: ', response.status, response.data);
            res.status(response.status).json({ message: 'server.js (B): failed to insert data into database.', error: response.data });
        }
    } catch (error) { // handle error
        console.error('server.js (B): error calling backend A: ', error.message);
        if (error.response) {
            res.status(error.response.status || 500).json({
                message: 'server.js (B): error communicating with backend A.',
                details: error.response.data
            });
        } else if (error.request) {
            console.error('server.js (B): no response received from backend A: ', error.request);
            res.status(500).json({ message: 'server.js (B): no response received from backend A.' });
        } else {
            console.error('server.js (B): axios request setup error: ', error.message);
            res.status(500).json({ message: 'server.js (B): error setting up request to backend A.' });
        }
    }
});

server.listen(B_BACKEND, () => { // start the server
    console.log(`Backend server (A) running on http://localhost:${B_BACKEND}`);
});

process.on('SIGINT', () => { // close gracefully
    db.close((err) => {
        if (err) {
            console.error('server.js (B): error closing database: ', err.message);
        }
        console.log('server.js (B): database connection closed.');
        process.exit(0);
    });
});
