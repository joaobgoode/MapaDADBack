const http = require('http');
const WebSocket = require('ws');
const createApp = require('./app');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const app = createApp(wss);

server.on('request', app);

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
