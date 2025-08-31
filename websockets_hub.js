/**
 * @fileoverview Central hub for WebSocket communication between users.
 * @file websockets_hub.js
 * @author Emma Pollard
 * @version 1.0
 */

/*
Code adapted from:
Backend to Frontend Messaging Methods; 
Google Gemini; 
2025;  
Available from: https://gemini.google.com/share/6cc87632397e; 
Accessed 28 June 2025.
*/  

const http = require('http');
const socketIO = require('socket.io');
const express = require('express');

/**
 * Port on which central WebSocket hub runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const HUB_PORT = 9000;
/**
 * Port on which the User A dashboard backend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const A_BACKEND = 5000;
/**
 * Port on which the User B dashboard backend runs.
 * @global
 * @type {Number}
 * @deprecated since version 1.0. May be updated.
 */
const B_BACKEND = 8080;

const app = express();
const server = http.createServer(app);
const connectedBackends = new Map();

const io = socketIO(server, {
    cors: {
        origin: [`http://localhost:${A_BACKEND}`, `http://localhost:${B_BACKEND}`], // A and B backends
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', (socket) => { // handle connections
    console.log(`websockets_hub.js: new backend connected - ${socket.id}`);
    socket.on('registerBackend', (backendType) => { // identify backend
        connectedBackends.set(socket.id, backendType);
        console.log(`websockets_hub.js: ${socket.id} registered as ${backendType}`);
    });
    socket.on('backendMessage', (data) => { // handle messages received from connected backends
        const senderType = connectedBackends.get(socket.id) || 'unknown';
        console.log(`websockets_hub.js received message from ${senderType}: `, data);
        socket.broadcast.emit('backendMessage', {
            from: senderType,
            data: data.data,
            event: data.event // original event type
        });
        console.log(`websockets_hub.js broadcasted message of type ${data.event} from ${senderType}.`);
    });
    socket.on('disconnect', () => { // handle disconnections
        const disconnectedType = connectedBackends.get(socket.id);
        console.log(`websockets_hub.js: backend disconnected: ${disconnectedType || 'unknown'}`);
        connectedBackends.delete(socket.id);
    });
});

server.listen(HUB_PORT, () => { // listen for connections
    console.log(`websockets_hub.js: hub running on http://localhost:${HUB_PORT}`);
});