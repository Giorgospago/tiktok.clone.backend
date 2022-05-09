const {createClient} = require('redis');
const chalk = require("chalk");

global.redis = createClient({
    url: process.env.REDIS_URI
});
redis.on('error', (err) => console.log('Redis Client Error', err));
redis.connect().then(() => console.log(chalk.yellowBright("Connected to Redis.")));
