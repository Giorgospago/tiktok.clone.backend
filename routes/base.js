const route = require("express").Router();

route.get("/", (req, res) => {
    res.json({
        success: true
    });
});

module.exports = route;