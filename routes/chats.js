const route = require("express").Router();

route.get("/", AuthMiddleware.isAuthorized, ChatController.getChats);
route.post("/", AuthMiddleware.isAuthorized, ChatController.create);
route.get("/users", AuthMiddleware.isAuthorized, ChatController.getUsersForChatting);
route.get("/:chatId", AuthMiddleware.isAuthorized, ChatController.getChat);
route.get("/:chatId/messages", AuthMiddleware.isAuthorized, ChatController.getChatMessages);
route.get("/profile/:id", AuthMiddleware.isAuthorized, ChatController.getChatFromUser);

module.exports = route;
