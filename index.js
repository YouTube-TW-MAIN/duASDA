const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle offer from screen sharer
    socket.on('offer', (offer) => {
        console.log('Received offer:', offer);
        socket.broadcast.emit('offer', offer);  // Send the offer to all other clients
    });

    // Handle answer from the viewers
    socket.on('answer', (answer) => {
        console.log('Received answer:', answer);
        socket.broadcast.emit('answer', answer);  // Send the answer back to the screen sharer
    });

    // Handle ICE candidates
    socket.on('ice-candidate', (candidate) => {
        console.log('Received ICE candidate:', candidate);
        socket.broadcast.emit('ice-candidate', candidate);  // Send the ICE candidate to the relevant peer
    });

    // Notify all users to stop showing the screen
    socket.on('stopScreen', () => {
        console.log('Stop screen sharing received');
        socket.broadcast.emit('stopScreen');
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
