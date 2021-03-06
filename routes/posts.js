const route = require("express").Router();

route.get("/sync", PostController.esSync);
route.get("/elastic", PostController.elastic);
route.post("/search", AuthMiddleware.isAuthorized, PostController.search);
route.post("/text-search", AuthMiddleware.isAuthorized, PostController.textSearch);
route.post("/create", AuthMiddleware.isAuthorized, PostController.create);
route.get("/:id/like", AuthMiddleware.isAuthorized, PostController.like);
route.get("/:id/comments", AuthMiddleware.isAuthorized, PostController.getComments);
route.post("/:id/comments", AuthMiddleware.isAuthorized, PostController.addComment);
route.delete("/:id", AuthMiddleware.isAuthorized, PostController.removePost);
route.post("/view", AuthMiddleware.isAuthorized, PostController.storeNewView);
route.post("/share", AuthMiddleware.isAuthorized, PostController.share);
// route.get("/calculate-video-duration", /*AuthMiddleware.isAuthorized,*/ PostController.calculateVideoDuration);

module.exports = route;
