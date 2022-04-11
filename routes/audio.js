const route = require("express").Router();

route.get("/:audioId", AuthMiddleware.isAuthorized, AudioController.getAudio);

module.exports = route;
