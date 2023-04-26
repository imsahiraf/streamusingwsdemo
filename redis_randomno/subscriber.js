const express = require("express");
const redis = require("redis");

const subscriber = redis.createClient();

// const subscriber = client.duplicate();

subscriber.connect();

subscriber.subscribe('user-notify', (message) => {
console.log(message); // 'message'
});

const app = express();

app.get("/", (req, res) => {
  res.send("Subscriber One");
});

app.listen(3006, () => {
  console.log("server is listening to port 3006");
});
