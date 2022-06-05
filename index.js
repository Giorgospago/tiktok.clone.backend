require('dotenv').config();
require('express-async-errors');
const http       = require('http');
const express    = require('express');
const bodyParser = require('body-parser');
const cors       = require('cors');
const {Server}   = require("socket.io");
const app        = express();

const server = http.createServer(app);
global.io = new Server(server, {
    cors: {
        origin: '*',
    },
    serveClient: false
});

// Require all config files
require("./config");
const chalk = require("chalk");
const errorHandlerMiddleware = require('./middlewares/ErrorHandlerMiddleware');

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

app.use("/public", express.static('public'));
app.use(require("./routes"));

// using the express-async-errors package
// now we can use this middleware to catch and return errors without the need of using try-catch in every controller
app.use(errorHandlerMiddleware);

server.listen(process.env.PORT, () => {
    console.log(
        chalk.blueBright(`Server listening at http://localhost:${process.env.PORT}`)
    );
});
