const route = require("express").Router();

// No auth routes


// Auth routes
route.get("/me", AuthMiddleware.isAuthorized, UserController.me);
route.get("/favorites", AuthMiddleware.isAuthorized, UserController.favorites);
route.get("/follow/:id", AuthMiddleware.isAuthorized, UserController.follow);
route.get("/profile/:id", AuthMiddleware.isAuthorized, UserController.userProfile);
route.get("/profile/:id/following", AuthMiddleware.isAuthorized, UserController.following);
route.get("/profile/:id/followers", AuthMiddleware.isAuthorized, UserController.followers);
route.get("/unfollow/followers/:id", AuthMiddleware.isAuthorized, UserController.unfollowFollowers);
route.get("/unfollow/following/:id", AuthMiddleware.isAuthorized, UserController.unfollowFollowing);
route.post("/add-device-token", AuthMiddleware.isAuthorized, UserController.addDeviceToken);

module.exports = route;
