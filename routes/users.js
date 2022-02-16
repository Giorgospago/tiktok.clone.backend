const route = require("express").Router();

// No auth routes


// Auth routes
route.get("/me", AuthMiddleware.isAuthorized, UserController.me);
route.get("/follow/:id", AuthMiddleware.isAuthorized, UserController.follow);
// route.get("/unfollow/:id", AuthMiddleware.isAuthorized, UserController.unfollow);

module.exports = route;
