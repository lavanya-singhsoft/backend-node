const { CRUDController } = require("../controllers/crudController");

class Space extends CRUDController {
  constructor() {
    super();
  }

  createSpace = async (req, res, next) => {
    let fields = ["name", "workspace_id"];

    let extrafields = ["description", "private", "userid", "users", "icon"];
    let userId = req.user.id;
    let users = req.body.users || [];

    users.push(userId);
    users = this.getUniqueValues(users, undefined, true);
    let errors = users?.error;

    let validateBody = this.validatePayload(fields, req.body);

    if (validateBody || errors) {
      if (errors) {
        return next({ code: 400, message: { message: "Invalid payload" } });
      }
      return next({ code: 400, message: { data: validateBody } });
    }

    req.body.users = users;
    let values = this.generateValuebyBody([...fields, ...extrafields], { ...req.body, userid: userId });

    let sqlQry = "CALL InsertInto_Space_And_Users(?, ?, ?, ?, ?, ?, ?)";

    return this.runQuery(req, res, next, sqlQry, values);
  };

  spaceList = async (req, res, next) => {
    let userId = req.user.id;
    let workspaceId = req.params.workspace_id;

    if (!workspaceId) {
      return next({ message: "workspace is required", code: 400 });
    }

    return this.getDataFromView(req, res, next, "space_admin_view", { user_id: userId, workspace_id: workspaceId });
  };

  spaceUpdate = async (req, res, next) => {
    res.status(200).send({ message: "workspace Created" });
  };

  spaceUsers = async (req, res, next) => {
    let { space_id } = req.params;
    let data = await this.findData("all_space_users", { space_id });

    res.status(200).send({ data: data });
  };

  assign = async (req, res, next) => {
    let userId = req.user.id;
    let fields = ["user_id", "space_id"];
    let { space_id } = req.body;

    let validateBody = this.validatePayload(fields, req.body);

    if (validateBody) {
      return next({ code: 400, message: { data: validateBody } });
    }

    let condition = { user_id: userId, space_id };

    let createData = await this.createDatawithCondition("space_users", fields, req.body, next, condition);

    if (createData) {
      res.status(200).send({ data: { message: "space successfully assigned to user" } });
    }
  };

  unAssign = async (req, res, next) => {
    let userId = req.user.id;
    let fields = ["user_id", "space_id"];

    let validateBody = this.validatePayload(fields, req.body);

    if (validateBody) {
      return next({ code: 400, message: { data: validateBody } });
    }

    let values = this.generateValuebyBody(fields, { ...req.body });
    let sqlQry = "CALL DeletespaceUsers(?, ?)";

    return this.runQuery(req, res, next, sqlQry, values, "unassigned successfully", "failed to unassign");
  };
}

module.exports = { Space };
