// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const socketIO = require('socket.io');
const clientIO = require('socket.io-client');

const B_PORT = 8080;
const A_FRONT = 5173;
const A_BACK = 5000;
const B_FRONT = 6173;
const HUB_PORT = 9000;

const app = express();
const server = http.createServer(app);
const hubSocket = clientIO(`http://localhost:${HUB_PORT}`);

const io = socketIO(server, {
    cors: {
        origin: `http://localhost:${B_FRONT}`,
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

hubSocket.on('connect', () => {
    console.log('server.js (B): connected to websockets hub.');
    hubSocket.emit('registerBackend', 'server_b');
});

hubSocket.on('backendMessage', (message) => {
    if (message.from !== 'server_b') {

        const content = message.data;

        if (message.event === 'USER_A_MESSAGE') {
            console.log('server.js (B): User A has sent a message: ', content);
            io.emit('a_message', content); // send message to frontend
            console.log('server.js (B): sent update message to frontend B.');
        }

        if (message.event === 'BROWSING_DATA') {
            console.log('server.js (B): User A has updated browsing history.');
            console.log(content)
            io.emit('a_browser', content); // send message to frontend
            console.log('server.js (B): sent browsing history update message to frontend B.');
        }

        if (message.event === 'USER_A_CHOICE') {
            console.log("Server B: User A has made a choice");
            io.emit('a_choice', content); // send message to frontend
            console.log('server.js (B): sent choice update message to frontend B.');
        }

        if (message.event === 'SET_EMAIL_SETTINGS') {
            console.log("Server B: Email settings have been updated");
            io.emit('email_settings', content); // send message to frontend
            console.log('server.js (B): sent email settings update message to frontend B.');
        }

        if (message.event === 'UPDATE_REQUEST') {
            console.log('server.js (B): User A requested to update settings.');
            io.emit('a_update_request', content); // send message to frontend
            console.log('server.js (B): sent update request message to frontend B.');
        }

        if (message.event === 'ADD_TRUSTED') {
            console.log('server.js (B): User A added trusted contact.');
            io.emit('add_trusted', content); // send message to frontend
            console.log('server.js (B): sent new trusted contact message to frontend B.');
        }

        if (message.event === 'REMOVE_TRUSTED') {
            console.log('server.js (B): User A removed trusted contact.');
            io.emit('remove_trusted', content); // send message to frontend
            console.log('server.js (B): sent remove trusted contact message to frontend B.');
        }

    }
});

hubSocket.on('disconnect', () => {
    console.log('server.js (B): disconnected from websockets hub.');
});

hubSocket.on('connect_error', (error) => {
    console.error('server.js (B): websockets hub connection error: ', error.message);
});

io.on('connect', (socket) => {
    socket.emit('welcome', 'server.js (B): backend connected');

    socket.on('clientMessage', (data) => { // message from frontend
        console.log('server.js (B) received message: ', data);
        socket.emit('message', `server.js (B) recevied: ${data}`); // respond to frontend
    });
});

// Connect to database
const db = new sqlite3.Database('../dashboard.db', (err) => {
    if (err) {
        console.error('server.js (B): error connecting to database: ', err.message);
    } else {
        console.log('server.js (B): connected to the database.');
    }
});

// Handler for frontend POST requests
app.post('/api/data-b-frontend', async (req, res) => {
    const data = req.body; // data from frontend B
    console.log('server.js (B): received data from frontend B: ', data);

    try {
        // make HTTP POST request to server.js (A)
        const response = await axios.post(`http://localhost:${A_BACK}/api/data-from-b`, data, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 201) {
            console.log('server.js (B): successfully forwarded data to A backend: ', response.data);

            if (data.data.type === 'USER_B_RESPONSE') {
                console.log('server.js (B): sending response notification to hub');
                hubSocket.emit('backendMessage', { event: 'USER_B_RESPONSE', data: data.data }); // message hub
                io.emit('b_response', data.data.outcome); // respond to frontend
            }
            if (data.data.type === 'USER_B_MESSAGE') {
                console.log('server.js (B): sending message to hub');
                hubSocket.emit('backendMessage', { event: 'USER_B_MESSAGE', data: data.data.payload }); // message hub
                io.emit('b_message', data.data.payload.message); // respond to frontend
            }
            if (data.data.type === 'UPDATE_REQUEST') {
                console.log('server.js (B): sending message to hub');
                hubSocket.emit('backendMessage', { event: 'UPDATE_REQUEST', data: data.data.payload }); // message hub
                io.emit('b_update_request', data.data.payload); // respond to frontend
            }
            if (data.data.type === 'USER_B_VIEW') {
                console.log('server.js (B): sending message to hub');
                hubSocket.emit('backendMessage', { event: 'USER_B_VIEW', data: data.data.payload }); // message hub
                io.emit('b_view', data.data.payload); // respond to frontend
            }
            res.status(200).json({ message: 'server.js (B): data sent to hub.' });
            console.log({ message: 'server.js (B): data process and responses made.', result: response.data });
        } else {
            console.error('server.js (B): error from backend A: ', response.status, response.data);
            res.status(response.status).json({ message: 'server.js (B): failed to insert data into database.', error: response.data });
        }
    } catch (error) {
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

// Start the server
server.listen(B_PORT, () => {
    console.log(`Backend server (A) running on http://localhost:${B_PORT}`);
});

// Close gracefully
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('server.js (B): error closing database: ', err.message);
        }
        console.log('server.js (B): database connection closed.');
        process.exit(0);
    });
});
