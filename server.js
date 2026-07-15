const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Guarda o nome de cada socket conectado -> Map<socketId, nome>
const onlineUsers = new Map();

function broadcastOnlineCount() {
  io.emit('online:count', onlineUsers.size);
}

io.on('connection', (socket) => {
  socket.on('user:join', (rawName) => {
    const name = String(rawName || 'Anônimo').trim().slice(0, 24) || 'Anônimo';
    onlineUsers.set(socket.id, name);

    socket.emit('user:joined', { name });

    socket.broadcast.emit('system:message', {
      text: `${name} entrou no chat`,
      timestamp: Date.now(),
    });

    broadcastOnlineCount();
  });

  socket.on('chat:message', (text) => {
    const name = onlineUsers.get(socket.id);
    if (!name) return; // usuário precisa ter entrado primeiro

    const trimmed = String(text || '').trim().slice(0, 500);
    if (!trimmed) return;

    io.emit('chat:message', {
      name,
      text: trimmed,
      timestamp: Date.now(),
      id: socket.id,
    });
  });

  socket.on('disconnect', () => {
    const name = onlineUsers.get(socket.id);
    if (name) {
      onlineUsers.delete(socket.id);
      socket.broadcast.emit('system:message', {
        text: `${name} saiu do chat`,
        timestamp: Date.now(),
      });
      broadcastOnlineCount();
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
