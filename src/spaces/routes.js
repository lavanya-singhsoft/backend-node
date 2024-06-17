const { Space } = require("./controller");
const spaceRoutes = require("express").Router();

const { createSpace, spaceList, spaceUsers, assign, unAssign } = new Space();

spaceRoutes.get("/:workspace_id", spaceList);
spaceRoutes.get("/users/:space_id", spaceUsers);
spaceRoutes.post("/", createSpace);
spaceRoutes.put("/assign/users", assign);
spaceRoutes.put("/unassign/users", unAssign);

module.exports = { spaceRoutes };
