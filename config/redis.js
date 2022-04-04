const {createClient} = require('redis');

global.redis = createClient({
    url: process.env.REDIS_URI
});
redis.on('error', (err) => console.log('Redis Client Error', err));
redis.connect();
