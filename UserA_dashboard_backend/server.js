// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = 5000; // Port for our backend API

// Use CORS middleware to allow requests from our React frontend
// For development, we allow all origins. In production, you'd restrict this.
app.use(cors());

// Initialize SQLite database
const db = new sqlite3.Database('./dashboard.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create items table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            value REAL NOT NULL,
            status TEXT NOT NULL
        )`, (createErr) => {
            if (createErr) {
                console.error('Error creating table:', createErr.message);
            } else {
                console.log('Table "items" checked/created.');
                // Insert some sample data if the table is empty
                db.get('SELECT COUNT(*) AS count FROM items', (countErr, row) => {
                    if (countErr) {
                        console.error('Error checking item count:', countErr.message);
                        return;
                    }
                    if (row.count === 0) {
                        console.log('Inserting sample data...');
                        const stmt = db.prepare('INSERT INTO items (name, value, status) VALUES (?, ?, ?)');
                        stmt.run('Revenue', 15000.50, 'High');
                        stmt.run('Expenses', 8000.25, 'Medium');
                        stmt.run('Profit', 7000.25, 'High');
                        stmt.run('Users', 1200, 'Stable');
                        stmt.run('Page Views', 55000, 'Increasing');
                        stmt.run('Support Tickets', 45, 'Low');
                        stmt.finalize(() => {
                            console.log('Sample data inserted.');
                        });
                    } else {
                        console.log('Database already contains data.');
                    }
                });
            }
        });
    }
});

// API endpoint to get dashboard data
app.get('/api/dashboard-data', (req, res) => {
    db.all('SELECT * FROM items', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Success',
            data: rows
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
    console.log('Remember to start your React frontend on a different port (e.g., 3000).');
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
