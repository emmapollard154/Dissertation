const http = require('http');
const socketIO = require('socket.io');
const express = require('express'); // Often used for basic / health check routes

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
    cors: {
        origin: ['http://localhost:5000', 'http://localhost:8080'], // A and B backends
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log(`Hub: New backend connected: ${socket.id}`);

    // Backends can identify themselves upon connection
    socket.on('registerBackend', (backendType) => {
        connectedBackends.set(socket.id, backendType);
        console.log(`Hub: Backend ${socket.id} registered as: ${backendType}`);
    });

    // Handle messages received from any connected backend
    socket.on('backendMessage', (data) => {
        const senderType = connectedBackends.get(socket.id) || 'unknown';
        console.log(`Hub: Received message from ${senderType} (${socket.id}):`, data);

        // Example: Re-emit to all other connected backends (broadcast)
        // You can add more sophisticated routing logic here
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

const HUB_PORT = 9000;
server.listen(HUB_PORT, () => {
    console.log(`Central WebSocket Hub running on http://localhost:${HUB_PORT}`);
});