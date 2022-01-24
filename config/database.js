const {connect} = require("mongoose");
const chalk = require("chalk");

connect(process.env.MONGODB_URI, () => {
    console.log(
        chalk.greenBright("Connected to MongoDB.")
    );
});
