const route = require("express").Router();

route.post("/create", AuthMiddleware.isAuthorized, PostController.create);

module.exports = route;
