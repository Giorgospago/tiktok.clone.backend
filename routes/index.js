const route = require("express").Router();

route.get("/", HomeController.welcome);
route.use("/auth", require("./auth"));

route.get("/test-posts", AuthMiddleware.isAuthorized, HomeController.testPosts);

route.get("**", HomeController.notFound);

module.exports = route;
