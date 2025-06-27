// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

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
            res.status(200).json({ message: 'Data processed by B and inserted into A\'s database', result: response.data });
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
