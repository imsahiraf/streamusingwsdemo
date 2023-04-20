const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });

const secret = 'my_secret_key';

var loggedInUsers = [];

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Load the user credentials from the JSON file
const users = JSON.parse(fs.readFileSync('users.json'));

app.post('/login', function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  // First check if the user is already logged in or not
  if (users[username] && loggedInUsers.includes(users[username])) {
    res.status(402).send('You are already logged in!');
  } else if (users[username] && users[username].password === password) {

    // Generate JWT token with a secret key and set the token as a cookie
    const token = jwt.sign({ username }, secret);

    // Add the user to the list of logged in users
    // loggedInUsers.push(users[username]);
    console.log('While send', token)
    res.status(200).send(token);
  } else {
    res.status(401).send('Invalid username or password');
  }
});


app.listen(8080, function () {
  console.log('Server started on port 8080');
});

wss.on('connection', function connection(ws, req) {
  console.log('Client connected', req);

  // const token = req.headers.authorization.split(' ')[1]rs;
  const token = req.headers['sec-websocket-protocol'];

  if (!token) {
    console.log(token)
    ws.close();
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (err) {
      console.log(err);
      ws.close();
      return;
    }

    console.log('Token verified:', decoded);
    console.log(loggedInUsers)
    // Add the user to the list of logged in users
    const user = users[decoded.username];
    if (user) {
      loggedInUsers.push(user);
    } else {
      console.log(`User ${decoded.username} not found in database`);
    }

    console.log(loggedInUsers)

    // Send random numbers to the client every 5 seconds
    const interval = setInterval(() => {
      const data = Math.floor(Math.random() * 100);
      ws.send(JSON.stringify(data));
    }, 1000);

    ws.on('close', function close() {
      console.log('Client disconnected');
      // Remove the user from the list of logged in users
      const index = loggedInUsers.findIndex(u => u.user === decoded.username);
      if (index !== -1) {
        loggedInUsers.splice(index, 1);
      }
      console.log(loggedInUsers)
      clearInterval(interval);
    });
  });
});
