// websockets_hub.js: central hub for A <-> B websockets communication

const http = require('http');
const socketIO = require('socket.io');
const express = require('express');

const HUB_PORT = 9000;
const A_PORT = 5000;
const B_PORT = 8080;

const app = express();
const server = http.createServer(app);
const connectedBackends = new Map();

const io = socketIO(server, {
    cors: {
        origin: [`http://localhost:${A_PORT}`, `http://localhost:${B_PORT}`], // A and B backends
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log(`websockets_hub.js: new backend connected - ${socket.id}`);
    socket.on('registerBackend', (backendType) => { // identify backend
        connectedBackends.set(socket.id, backendType);
        console.log(`websockets_hub.js: ${socket.id} registered as ${backendType}`);
    });

    // handle messages received from connected backends
    socket.on('backendMessage', (data) => {
        const senderType = connectedBackends.get(socket.id) || 'unknown';
        console.log(`websockets_hub.js received message from ${senderType}: `, data);

        socket.broadcast.emit('backendMessage', {
            from: senderType,
            data: data.data,
            event: data.event // original event type
        });
        console.log(`websockets_hub.js broadcasted message "${data.data}" (type ${data.event}) from ${senderType}.`);
    });

    socket.on('disconnect', () => {
        const disconnectedType = connectedBackends.get(socket.id);
        console.log(`websockets_hub.js: backend disconnected: ${disconnectedType || 'unknown'}`);
        connectedBackends.delete(socket.id);
    });
});

// Listen for connections
server.listen(HUB_PORT, () => {
    console.log(`websockets_hub.js: hub running on http://localhost:${HUB_PORT}`);
});