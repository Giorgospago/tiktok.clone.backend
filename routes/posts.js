const route = require("express").Router();

route.post("/search", AuthMiddleware.isAuthorized, PostController.search);
route.post("/create", AuthMiddleware.isAuthorized, PostController.create);
route.get("/:id/like", AuthMiddleware.isAuthorized, PostController.like);

module.exports = route;
