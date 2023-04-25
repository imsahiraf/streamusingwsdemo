const redis = require("redis");
const redisclient = redis.createClient();
let lastIndex = -1;
(async () => {
    await redisclient.connect();
})();

console.log("Connecting to the Redis");

redisclient.on("ready", () => {
    console.log("Connected!");
});

redisclient.on("error", (err) => {
    console.log("Error in the Connection");
});

const generateRandomNumber = () => {
    const randomNumber = Math.floor(Math.random() * 100000); // generate random number between 0 and 100,000
    console.log('Generated random number:', randomNumber); // add this line to check the value of randomNumber
    // console.log(typeof randomNumber)
    // redisclient.lPush('key', randomNumber.toString());

    redisclient.rPush('randomNumbers', randomNumber.toString(), (err, reply) => { // store number in Redis list
        if (err) {
            console.log('Error in rPush:', err); // add this line to log any errors
        } else {
            console.log('Stored ' + randomNumber + ' in Redis list');
        }
    });
}

setInterval(generateRandomNumber, 1000); // generate a random number every second

const showNewNumbersFromRedis = () => {
    // if (!redisclient.connected) {
    //   console.log("Redis client is not connected.");
    //   return;
    // }

    redisclient.lRange("randomNumbers", lastIndex + 1, -1)
        .then((numbers) => {
            console.log("New numbers from Redis: " + numbers.join(', '));
            if (numbers.length > 0) {
                lastIndex += numbers.length;
            }
        })
        .catch((err) => {
            console.log("Error reading numbers from Redis: " + err);
        });
};

setInterval(showNewNumbersFromRedis, 1000); // fetch new numbers every second
