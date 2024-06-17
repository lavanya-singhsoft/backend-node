const { Lists } = require("./controller");
const listRoutes = require("express").Router();

const { listsList, createList, spaceList, spaceListByID, assign, unAssign } = new Lists();

listRoutes.get("/:workspace_id", listsList);
listRoutes.get("/space/:space_id", spaceListByID);
listRoutes.get("/space/list/:workspace_id", spaceList);
listRoutes.post("/", createList);
listRoutes.put("/assign/users", assign);
listRoutes.put("/unassign/users", unAssign);

module.exports = { listRoutes };
