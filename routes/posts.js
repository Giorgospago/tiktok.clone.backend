const route = require("express").Router();

route.post("/search", AuthMiddleware.isAuthorized, PostController.search);
route.post("/text-search", AuthMiddleware.isAuthorized, PostController.textSearch);
route.post("/create", AuthMiddleware.isAuthorized, PostController.create);
route.get("/:id/like", AuthMiddleware.isAuthorized, PostController.like);
route.get("/:id/comments", AuthMiddleware.isAuthorized, PostController.getComments);
route.post("/:id/comments", AuthMiddleware.isAuthorized, PostController.addComment);
route.post("/view", AuthMiddleware.isAuthorized, PostController.storeNewView);

module.exports = route;
