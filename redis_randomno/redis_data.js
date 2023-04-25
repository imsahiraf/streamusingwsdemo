const redis = require("redis");
const redisClient = redis.createClient();

let lastIndex = -1;

redisClient.on("connect", () => {
  console.log("Connected to Redis!");
});

redisClient.on("error", (err) => {
  console.log("Error in the Redis connection: " + err);
});

const showNewNumbersFromRedis = () => {
  if (!redisClient.connected) {
    console.log("Redis client is not connected.");
    return;
  }

  redisClient.lrange("randomNumbers", lastIndex + 1, -1, (err, numbers) => {
    if (err) {
      console.log("Error reading numbers from Redis: " + err);
      return;
    }

    numbers.forEach((number) => {
      console.log("New number from Redis: " + number);
    });

    if (numbers.length > 0) {
      lastIndex += numbers.length;
    }
  });
};

setInterval(showNewNumbersFromRedis, 1000); // fetch new numbers every second
