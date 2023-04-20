const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const { MongoClient } = require('mongodb');
const mongoUrl = 'mongodb://localhost:27017/mydatabase';
const wss = new WebSocket.Server({ port: 8081 });

const secret = 'my_secret_key';

var loggedInUsers = [];

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/login', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  // Connect to the MongoDB database
  const client = await MongoClient.connect(mongoUrl, { useUnifiedTopology: true });
  const db = client.db();

  // Find the user in the database
  const user = await db.collection('users').findOne({ username });

  // Close the database connection
  client.close();

  if (user && user.password === password) {
    // Generate JWT token with a secret key and set the token as a cookie
    const token = jwt.sign({ username }, secret);
    res.status(200).send(token);
  } else {
    res.status(401).send('Invalid username or password');
  }
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

    // Connect to the MongoDB database
    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function (err, client) {
      if (err) {
        console.log(err);
        ws.close();
        return;
      }

      const db = client.db();

      // Find the user in the database
      db.collection('users').findOne({ username: decoded.username }, function (err, user) {
        if (err || !user) {
          console.log(err || `User ${decoded.username} not found in database`);
          ws.close();
          client.close();
          return;
        }

        console.log('User found in database:', user);

        // Add the user to the list of logged in users
        loggedInUsers.push(user);

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
          client.close();
        });
      });
    });
  });
});

app.listen(8080, function () {
  console.log('Server started on port 8080');
});
