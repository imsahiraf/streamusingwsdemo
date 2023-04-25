const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const secret = 'my_secret_key';
const PORT = process.env.PORT || 8080;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 8081;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/websocketdemo');

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', userSchema);

class UserController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username });

      if (!user) {
        res.status(401).send('Invalid username or password');
        return;
      }

      const token = jwt.sign({ username }, secret);

      if (user.username && loggedInUsers.includes(user.username)) {
        res.status(402).send('You are already logged in!');
      } else if (user && user.password === password) {
        res.cookie('token', token, { httpOnly: true });
        res.status(200).send(token);
      } else {
        res.status(401).send('Invalid username or password');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving user from database');
    }
  }

  static async addUser(req, res) {
    try {
      const { username, password } = req.body;

      const existingUser = await User.findOne({ username });

      if (existingUser) {
        res.status(409).send('User already exists');
      } else {
        const user = new User({ username, password });

        await user.save();

        res.status(200).send('User added successfully');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error saving user to database');
    }
  }
}

const wss = new WebSocket.Server({ port: WEBSOCKET_PORT });
const loggedInUsers = [];

wss.on('connection', function connection(ws, req) {
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

    const user = decoded.username;
    if (user) {
      loggedInUsers.push(user);
    } else {
      console.log(`User ${decoded.username} not found in database`);
    }

    const interval = setInterval(() => {
      const data = Math.floor(Math.random() * 100);
      ws.send(JSON.stringify(data));
    }, 1000);

    ws.on('close', function close() {
      console.log('Client disconnected');

      const index = loggedInUsers.findIndex(u => u === decoded.username);
      if (index !== -1) {
        loggedInUsers.splice(index, 1);
      }
      console.log(loggedInUsers)
      clearInterval(interval);
    });
  });
});

app.post('/login', UserController.login);
app.post('/adduser', UserController.addUser);

app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}`);
});
