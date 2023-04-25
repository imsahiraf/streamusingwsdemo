const redis = require('redis');
const client = redis.createClient(); // create Redis client

(async () => {
    await client.connect();
})();

client.on('error', (err) => {
  console.log('Error ' + err); // handle Redis connection errors
});

const generateRandomNumber = () => {
  const randomNumber = Math.floor(Math.random() * 100000); // generate random number between 0 and 100,000
  client.rPush('randomNumbers', randomNumber, (err, reply) => { // store number in Redis list
    if (err) {
      console.log('Error ' + err);
    } else {
      console.log('Stored ' + randomNumber + ' in Redis list');
    }
  });
}

setInterval(generateRandomNumber, 1000); // generate a random number every second

// to stop the script, uncomment the following line
// client.quit();
