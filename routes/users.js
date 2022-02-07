const route = require("express").Router();

// No auth routes


// Auth routes
route.get("/me", AuthMiddleware.isAuthorized, UserController.me);

module.exports = route;
