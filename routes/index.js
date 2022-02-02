const route = require("express").Router();

route.get("/", HomeController.welcome);
route.use("/auth", require("./auth"));

route.post("/upload", AuthMiddleware.isAuthorized, upload.single("video"), HomeController.upload);

route.get("**", HomeController.notFound);

module.exports = route;
