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
    console.log(`Hub: New backend connected: ${socket.id}`);
    socket.on('registerBackend', (backendType) => { // identify backend
        connectedBackends.set(socket.id, backendType);
        console.log(`Hub: Backend ${socket.id} registered as: ${backendType}`);
    });

    // Handle messages received from any connected backend
    socket.on('backendMessage', (data) => {
        const senderType = connectedBackends.get(socket.id) || 'unknown';
        console.log(`Hub: Received message from ${senderType} (${socket.id}):`, data);

        socket.broadcast.emit('backendMessage', {
            from: senderType,
            data: data.payload,
            event: data.event // Include original event type
        });
        console.log(`Hub: Broadcasted message "${data.event}" from ${senderType} to other backends.`);
    });

    socket.on('disconnect', () => {
        const disconnectedType = connectedBackends.get(socket.id);
        console.log(`Hub: Backend disconnected: ${socket.id} (${disconnectedType || 'unknown'})`);
        connectedBackends.delete(socket.id);
    });
});

server.listen(HUB_PORT, () => {
    console.log(`Central WebSocket Hub running on http://localhost:${HUB_PORT}`);
});