const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 7575 });

wss.on('connection', function connection(ws, req) {
  // Wait for the initial message from the client containing the username and password
  ws.once('message', function incoming(message) {
    const data = JSON.parse(message);
    const { username, password } = data;

    // Check if the username and password are valid (e.g. compare against a database)
    if (isValidUser(username, password)) {
      // Authenticate the connection and continue handling the websocket connection
      ws.send(JSON.stringify({ success: true }));
    
      // Handle incoming messages
      ws.on('message', function incoming(message) {
        console.log('received: %s', message);
      });

      // Send a random number every second
      const intervalId = setInterval(function() {
        const randomNumber = Math.floor(Math.random() * 100);
        ws.send(JSON.stringify({ randomNumber }));
      }, 1000);

      // When the connection is closed, clear the interval
      ws.on('close', function() {
        clearInterval(intervalId);
      });

    } else {
      // Reject the connection if authentication fails
      ws.send(JSON.stringify({ success: false }));
      ws.close();
    }
  });
});

function isValidUser(username, password) {
  // Check if the username and password are valid (e.g. compare against a database)
  // Return true if valid, false otherwise
  // This is just a placeholder function - you should implement your own validation logic
  return username === 'mrzulf' && password === 'pass';
}
