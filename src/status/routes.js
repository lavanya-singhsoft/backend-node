const { Status } = require("./controller");
const statusRoutes = require("express").Router();

const { statusList, createStatus } = new Status();

statusRoutes.get("/:workspace_id", statusList);
statusRoutes.post("/", createStatus);

module.exports = { statusRoutes };
