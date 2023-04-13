const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('Client connected');

  // Send random numbers to the client every 5 seconds
  const interval = setInterval(() => {
    const data = Math.floor(Math.random() * 100);
    ws.send(JSON.stringify(data));
  }, 1000);

  ws.on('close', function close() {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});
