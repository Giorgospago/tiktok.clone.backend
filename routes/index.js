const route = require("express").Router();

route.get("/", HomeController.welcome);
route.use("/auth", require("./auth"));
route.use("/users", require("./users"));
route.use("/posts", require("./posts"));
route.use("/comments", require("./comments"));
route.use("/chats", require("./chats"));
route.use("/audio", require("./audio"));

route.post("/upload", AuthMiddleware.isAuthorized, upload.single("file"), HomeController.upload);

route.get("**", HomeController.notFound);

module.exports = route;
