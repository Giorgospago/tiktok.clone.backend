const route = require("express").Router();

// No auth routes


// Auth routes
route.get("/me", AuthMiddleware.isAuthorized, UserController.me);
route.get("/follow/:id", AuthMiddleware.isAuthorized, UserController.follow);
route.get("/profile/:id", AuthMiddleware.isAuthorized, UserController.userProfile);
route.get("/profile/:id/following", AuthMiddleware.isAuthorized, UserController.following);
// route.get("/unfollow/:id", AuthMiddleware.isAuthorized, UserController.unfollow);

module.exports = route;
