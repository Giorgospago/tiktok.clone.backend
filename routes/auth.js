const route = require("express").Router();

route.post("/login", AuthValidator.login, AuthController.login);
route.post("/social-login", AuthValidator.socialLogin, AuthController.socialLogin);
route.post("/register", AuthValidator.register, AuthController.register);
route.get("/logout", AuthMiddleware.isAuthorized, AuthController.logout);

module.exports = route;
