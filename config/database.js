const mongoose = require("mongoose");
const chalk = require("chalk");

// mongoose.set("debug", true);

mongoose.connect(process.env.MONGODB_URI, (err) => {
    if (err) {
        console.error(err)
    } else {
        console.log(
            chalk.greenBright("Connected to MongoDB.")
        );
    }
});
