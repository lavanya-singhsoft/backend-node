const { CRUDController } = require("../controllers/crudController");

class Lists extends CRUDController {
  constructor() {
    super();
  }

  createList = async (req, res, next) => {
    let fields = ["name", "space_id", "workspace_id"];
    let extrafields = ["user_id", "users", "description", "icon"];

    let users = req.body.users || [];
    let userId = req.user.id;

    users.push(userId);
    users = this.getUniqueValues(users, undefined, true);
    let errors = users?.error;

    let validateBody = this.validatePayload(fields, req.body);

    if (validateBody || errors) {
      if (validateBody || errors) {
        if (errors) {
          return next({ code: 400, message: { message: "Invalid payload" } });
        }
        return next({ code: 400, message: { data: validateBody } });
      }
    }

    req.body.users = users;
    let values = this.generateValuebyBody([...fields, ...extrafields], { ...req.body, user_id: userId });
    let sqlQry = "CALL create_list(?, ?, ?, ?, ?, ?, ?)";

    return this.runQuery(req, res, next, sqlQry, values);
  };

  listsList = async (req, res, next) => {
    let workspace_id = req.params.workspace_id;
    let userId = req.user.id;
    let data = await this.findData("lists", { user_id: userId, workspace_id });

    return res.status(200).send(data);
  };

  spaceList = async (req, res, next) => {
    let userId = req.user.id;
    let workspace_id = req.params.workspace_id;
    let data = await this.findData("list_space_view", { user_id: userId, workspace_id });

    return res.status(200).send(data);
  };

  spaceListByID = async (req, res, next) => {
    let userId = req.user.id;
    let space_id = req.params.space_id;
    let data = await this.findData("all_lists_view", { user_id: userId, space_id });

    return res.status(200).send(data);
  };

  assign = async (req, res, next) => {
    let userId = req.user.id;
    let fields = ["user_id", "list_id"];
    let { list_id } = req.body;

    let validateBody = this.validatePayload(fields, req.body);

    if (validateBody) {
      return next({ code: 400, message: { data: validateBody } });
    }

    let condition = { user_id: userId, list_id };

    let createData = await this.createDatawithCondition("list_users", fields, req.body, next, condition);

    if (createData) {
      res.status(200).send({ data: { message: "list successfully assigned to user" } });
    }
  };

  unAssign = async (req, res, next) => {
    let userId = req.user.id;
    let fields = ["user_id", "list_id"];

    let validateBody = this.validatePayload(fields, req.body);

    if (validateBody) {
      return next({ code: 400, message: { data: validateBody } });
    }

    let values = this.generateValuebyBody(fields, { ...req.body });
    let sqlQry = "CALL DeletelistUsers(?, ?)";

    return this.runQuery(req, res, next, sqlQry, values, "unassigned successfully", "failed to unassign");
  };
}

module.exports = { Lists };
