const routers = require("express").Router();
const { adminRouter } = require("../src/admin/Routes");
const { AuthController } = require("../src/auth/authController");
const commentsRouter = require("../src/comments/routes");
const { listRoutes } = require("../src/lists/routes");
const { spaceRoutes } = require("../src/spaces/routes");
const { statusRoutes } = require("../src/status/routes");
const { taskRoutes } = require("../src/tasks/routes");
const { workspaceRoutes } = require("../src/workspace/routes");

const { validateToken } = new AuthController();

routers.use("/admin", adminRouter);
routers.use(validateToken);
routers.use("/space", spaceRoutes);
routers.use("/workspace", workspaceRoutes);
routers.use("/lists", listRoutes);
routers.use("/tasks", taskRoutes);
routers.use("/comments", commentsRouter);
routers.use("/status", statusRoutes);

module.exports = { routers };
