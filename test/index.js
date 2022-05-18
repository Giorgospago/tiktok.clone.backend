const db = require("./db");

db.connect();

db.onConnect = (a) => {
    console.log("SUCCESSFULLY CONNECTED BY ZARTAS !!!")
    console.log(a);
};
