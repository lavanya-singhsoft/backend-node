const { AuthController } = require("../auth/authController");
const { AdminController } = require("./controller");
const adminRouter = require("express").Router();
const { loginUser, createUser, searchUser } = new AdminController();
const { validateToken } = new AuthController();

adminRouter.post("/login", loginUser);
adminRouter.post("/signup", createUser);
adminRouter.get("/search", validateToken, searchUser);

module.exports = { adminRouter };
