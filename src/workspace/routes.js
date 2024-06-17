const { Workspace } = require("./controller");
const workspaceRoutes = require("express").Router();

const { createWorkspace, workspaceList, workspaceUsers, inviteUsers, removeUsers, workspaceDetails } = new Workspace();

workspaceRoutes.get("/", workspaceList);
workspaceRoutes.get("/:workspace_id/users", workspaceUsers);
workspaceRoutes.get("/:workspace_id/details", workspaceDetails);
workspaceRoutes.post("/invite", inviteUsers);
workspaceRoutes.delete("/remove", removeUsers);
workspaceRoutes.post("/", createWorkspace);

module.exports = { workspaceRoutes };
