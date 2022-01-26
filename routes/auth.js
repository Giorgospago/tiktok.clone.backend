const route = require("express").Router();

route.post("/login", AuthValidator.login, AuthController.login);
route.post("/register", AuthValidator.register, AuthController.register);

module.exports = route;
