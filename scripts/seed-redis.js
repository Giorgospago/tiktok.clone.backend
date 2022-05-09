require('dotenv').config();
const {createClient} = require('redis');

(async () => {
    const redis = createClient({url: process.env.REDIS_URI});
    await redis.connect();

    const variables = {
        "multiplier:views": 0.35,
        "multiplier:dt": 0.35,
        "multiplier:likes": 0.2,
        "multiplier:comments": 0.1
    };
    for (const key in variables) {
        const exists = await redis.get(key);
        if (exists === null) {
            await redis.set(key, variables[key]);
        }
    }

    await redis.disconnect();
})();
