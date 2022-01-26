require('dotenv').config();
const express    = require('express');
const bodyParser = require('body-parser');
const cors       = require('cors');
const app        = express();

// Require all config files
require("./config");
const chalk = require("chalk");

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

app.use("/public", express.static('public'));
app.use(require("./routes"));

app.listen(process.env.PORT, () => {
    console.log(
        chalk.blueBright(`Server listening at http://localhost:${process.env.PORT}`)
    );
});
