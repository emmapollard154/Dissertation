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
    console.log('Backend B: Connected to Central Hub.');
    hubSocket.emit('registerBackend', 'BackendB'); // Identify self to hub
});

hubSocket.on('backendMessage', (message) => {
    if (message.from !== 'BackendB') { // Avoid processing messages sent by self
        console.log('Backend B: Received message from other backend via Hub:', message);
        // Process message, e.g., update inventory
        if (message.event === 'ORDER_PLACED') {
            console.log(`Backend B: Reducing inventory for order ${message.data.orderId}`);
            // ... update inventory database
        }
    }
});

hubSocket.on('disconnect', () => {
    console.log('Backend B: Disconnected from Central Hub.');
});

hubSocket.on('connect_error', (error) => {
    console.error('Backend B: Hub connection error:', error.message);
});

// // Example API endpoint on Backend B that sends messages via the Hub
// app.post('/api/backendB-notification', (req, res) => {
//     const { type, details } = req.body;
//     console.log(`Backend B: Sending notification "${type}" with details:`, details);

//     hubSocket.emit('backendMessage', { event: 'NOTIFICATION', payload: { type, details } });

//     res.status(200).json({ message: 'Notification sent to hub.' });
// });
















// Listen for messages from the client
io.on('connect', (socket) => {

    socket.emit('welcome', 'server.js (B): backend connected');
    console.log('server.js (B): backend sent welcome message');

    socket.on('clientMessage', (data) => {
        console.log('server.js (B) received message:', data);
        socket.emit('message', `Server B recevied: ${data}`); // respond to frontend
    });
});

// const db = new sqlite3.Database('../UserA_dashboard_backend/dashboard.db', (err) => {
const db = new sqlite3.Database('../dashboard.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});


app.post('/api/data-b-frontend', async (req, res) => {
    const dataToInsert = req.body; // Data received from Dashboard B's frontend

    console.log('Received data on B backend from B frontend:', dataToInsert);

    try {
        // Make an HTTP POST request to Dashboard A's backend
        const response = await axios.post('http://localhost:5000/api/data-from-b', dataToInsert, {
            headers: {
                'Content-Type': 'application/json',
                // 'X-API-Key': API_KEY_FOR_A // Include the API key for authentication
            }
        });

        // Check the response from A's backend
        if (response.status === 201) {
            console.log('Successfully forwarded data to A backend:', response.data);
            // res.status(200).json({ message: 'Data processed by B and inserted into A\'s database', result: response.data });


            console.log(`Backend B: Sending notification to hub`);

            hubSocket.emit('backendMessage', { event: 'USER_B_RESPONSE' });

            res.status(200).json({ message: 'Notification sent to hub.' });

            console.log({ message: 'Data processed by B and inserted into A\'s database. Notification send to hub.', result: response.data });



        } else {
            console.error('Error from A backend:', response.status, response.data);
            res.status(response.status).json({ message: 'Failed to insert data into A\'s database', error: response.data });
        }
    } catch (error) {
        console.error('Error calling A backend from B backend:', error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('A Backend Response Data:', error.response.data);
            console.error('A Backend Response Status:', error.response.status);
            console.error('A Backend Response Headers:', error.response.headers);
            res.status(error.response.status || 500).json({
                message: 'Error communicating with Dashboard A backend',
                details: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from A Backend:', error.request);
            res.status(500).json({ message: 'No response from Dashboard A backend' });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Axios request setup error:', error.message);
            res.status(500).json({ message: 'Error setting up request to Dashboard A backend' });
        }
    }
});

// Start the server
server.listen(B_PORT, () => {
    console.log(`Backend server (B) running on http://localhost:${B_PORT}`);
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
