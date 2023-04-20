const http = require('http');
const WebSocket = require('ws');

const username = 'anurag';
const password = 'pass@123';

const data = JSON.stringify({ username: username, password: password });

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const token = (responseData);

      const ws = new WebSocket(`ws://localhost:8081`, [token]);

      ws.on('open', () => {
        console.log('Connected to server');
        ws.send(JSON.stringify({ token: token }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data);
        console.log(`Here the random generated number for a second is ${message}`);
      });

      ws.on('close', () => {
        console.log('Disconnected from server');
      });
    } else if (res.statusCode === 401) {
      console.log('You are trying to login with wrong credentials.');
    } else if (res.statusCode === 402) {
      console.log('You are already logged in with these credentials.');
    }
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
