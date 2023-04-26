const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });
const mongoose = require('mongoose');
const redis = require("redis");
const redisclient = redis.createClient();
const subscriber = redisclient.duplicate();
let lastIndex = -1;
(async () => {
  await redisclient.connect();
})();

console.log("Connecting to the Redis");

redisclient.on("ready", () => {
  console.log("Connected!");
});
subscriber.connect();

redisclient.on("error", (err) => {
  console.log("Error in the Connection");
});

const generateRandomNumber = () => {
  const randomNumber = Math.floor(Math.random() * 100000); // generate random number between 0 and 100,000
  console.log('Generated random number:', randomNumber); // add this line to check the value of randomNumber
  // console.log(typeof randomNumber)
  // redisclient.lPush('key', randomNumber.toString());
  redisclient.publish("random", randomNumber.toString());
  // redisclient.rPush('randomNumbers', randomNumber.toString(), (err, reply) => { // store number in Redis list
  //   if (err) {
  //     console.log('Error in rPush:', err); // add this line to log any errors
  //   } else {
  //     console.log('Stored ' + randomNumber + ' in Redis list');
  //   }
  // });
}

setInterval(generateRandomNumber, 1000); // generate a random number every second

const secret = 'my_secret_key';

var loggedInUsers = [];

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/websocketdemo');

// Define the user schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});



// Create the user model
const User = mongoose.model('User', userSchema);

app.post('/login', function (req, res) {
  const { username, password } = req.body;

  User.findOne({ username })
    .then(user => {
      if (!user) {
        res.status(401).send('Invalid username or password');
        return;
      } else {
        // First check if the user is already logged in or not
        if (user.username && loggedInUsers.includes(user.username)) {
          res.status(402).send('You are already logged in!');
        } else if (user && user.password === password) {
          // Generate JWT token with a secret key and set the token as a cookie
          const token = jwt.sign({ username }, secret);
          res.status(200).send(token);
        } else {
          res.status(401).send('Invalid username or password');
        }
      }
      console.log(user.username)
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error retrieving user from database');
    });
});

app.listen(8080, function () {
  console.log('Server started on port 8080');
});

const showNewNumbersFromRedis = () => {
  // if (!redisclient.connected) {
  //   console.log("Redis client is not connected.");
  //   return;
  // }

  redisclient.lRange("randomNumbers", lastIndex + 1, -1)
    .then((numbers) => {
      // console.log("New numbers from Redis: " + numbers.join(', '));
      if (numbers.length > 0) {
        lastIndex += numbers.length;
      }

      // send any new numbers to the client
      numbers.forEach((number) => {
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(parseInt(number)));
          }
        });
      });
    })
    .catch((err) => {
      console.log("Error reading numbers from Redis: " + err);
    });
};

// setInterval(showNewNumbersFromRedis, 1000); // fetch new numbers every second an this one 

wss.on('connection', function connection(ws, req) {
  // console.log('Client connected', req);

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

    // Add the user to the list of logged in users
    const user = decoded.username;
    if (user) {
      loggedInUsers.push(user);
    } else {
      console.log(`User ${decoded.username} not found in database`);
    }

    console.log(loggedInUsers)

    // Send any new numbers from Redis to the client every second
    // const redisInterval = setInterval(() => {
    //   showNewNumbersFromRedis();
    // }, 1000);
    
    subscriber.subscribe('random', (message) => {
      ws.send(message)
      console.log(message); // 'message'
      });

    ws.on('close', function close() {
      console.log('Client disconnected');
      // Remove the user from the list of logged in users
      const index = loggedInUsers.findIndex(u => u === decoded.username);
      if (index !== -1) {
        loggedInUsers.splice(index, 1);
      }
      console.log(loggedInUsers)
      clearInterval(redisInterval);
    });
  });
});


// API endpoint to add a user
app.post('/adduser', function (req, res) {
  const { username, password } = req.body;
  console.log(req.body)
  User.findOne({ username })
    .then(existingUser => {
      if (existingUser) {
        res.status(409).send('User already exists');
      } else {
        const user = new User({ username, password });

        user.save()
          .then(() => {
            res.status(200).send('User added successfully');
          })
          .catch(err => {
            console.error(err);
            res.status(500).send('Error saving user to database');
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error checking for existing user');
    });
});