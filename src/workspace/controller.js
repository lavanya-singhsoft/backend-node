const { CRUDController } = require("../controllers/crudController");

class Workspace extends CRUDController {
  constructor() {
    super();
  }

  createWorkspace = async (req, res, next) => {
    let fields = ["name", "size", "field", "use_case"];

    let extrafields = ["userid", "users", "icon"];
    let userId = req.user.id;
    let users = req.body.users || [];

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
    let values = this.generateValuebyBody([...fields, ...extrafields], { ...req.body, userid: userId });
    let sqlQry = "CALL Insert_Into_Workspace_And_Users(?, ?, ?, ?, ?, ?, ?)";

    return this.runQuery(req, res, next, sqlQry, values);
  };

  workspaceList = async (req, res, next) => {
    let userId = req.user.id;
    return this.getDataFromView(req, res, next, "workspace_admin_view", { user_id: userId });
  };

  workspaceUsers = async (req, res, next) => {
    let userId = req.user.id;
    let workspace_id = req.params.workspace_id;
    return this.getDataFromView(req, res, next, "workspace_all_users", { workspace_id });
  };

  inviteUsers = async (req, res, next) => {
    let fields = ["workspace_id", "user_id"];
    let userId = req.user.id;

    let validateBody = this.validatePayload(fields, req.body);

    if (validateBody) {
      return next({ code: 400, message: { data: validateBody } });
    }

    let { workspace_id } = req.body;
    let check = await this.findOne("workspace_users", { workspace_id, user_id: userId });

    if (!check) {
      return next({ code: 400, message: { message: "invalid workspace" } });
    }

    let result = await this.createData("workspace_users", fields, req.body, next);

    result && res.status(200).send({ message: "added to workspace" });
  };

  removeUsers = async (req, res, next) => {
    let fields = ["workspace_id", "user_id"];
    let userId = req.user.id;

    let validateBody = this.validatePayload(fields, req.body);

    if (validateBody) {
      return next({ code: 400, message: { data: validateBody } });
    }
    let { workspace_id, user_id } = req.body;

    let qrystr = { workspace_id, user_id: userId };

    let check = await this.findOne("workspace_users", qrystr);

    if (!check) {
      return next({ code: 400, message: { message: "invalid workspace" } });
    }

    qrystr.user_id = user_id;

    let result = await this.deleteData("workspace_users", qrystr, next);

    result && res.status(200).send({ message: "user removed successfully from workspace" });
  };

  workspaceUpdate = async (req, res, next) => {
    res.status(200).send({ message: "workspace Created" });
  };

  workspaceDetails = async (req, res, next) => {
    const workspace_id = req.params.workspace_id;

    let workspace = await this.findOne(
      "workspace_admin_view",
      { workspace_id: workspace_id },
      undefined,
      `
        workspace_id,
        name, 
        size,
        admin_id,
        JSON_ARRAYAGG(
            JSON_OBJECT(
          'admin', CASE WHEN user_id = admin_id THEN true ELSE null END,
                'user_name', user_name,
                'user_id', user_id
            )
        ) as users,
        created_at,
        field,
        use_case
        `
    );

    res.status(200).send({ data: workspace });
  };
}

module.exports = { Workspace };
