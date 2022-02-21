const route = require("express").Router();

route.get("/:id/replies", AuthMiddleware.isAuthorized, CommentController.getReplies);

module.exports = route;
