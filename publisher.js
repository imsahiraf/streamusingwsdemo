const redis = require("redis");
const redisserver = redis.createClient();

console.log("Connecting to the Redis");

redisserver.connect();

redisserver.on("ready", () => {
    console.log("Connected!");
});

redisserver.on("error", (err) => {
    console.log("Error in the Connection");
});

const generateRandomNumber = () => {

    const randomNumber = Math.floor(Math.random() * 100000); // generate random number between 0 and 100,000
    console.log('Generated random number:', randomNumber); // add this line to check the value of randomNumber
    redisserver.publish("random", randomNumber.toString());
    
}

setInterval(generateRandomNumber, 1000); // generate a random number every second