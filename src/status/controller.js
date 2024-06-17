const { CRUDController } = require("../controllers/crudController");

class Status extends CRUDController {
  constructor() {
    super();
  }

  createStatus = async (req, res, next) => {
    let fields = ["name", "workspace_id"];
    let extrafields = ["description", "user_id", "style"];

    let userId = req.user.id;
    let validateBody = this.validatePayload(fields, req.body);

    if (validateBody) {
      return next({ code: 400, message: { data: validateBody } });
    }

    let result = await this.createData("status", [...fields, ...extrafields], { ...req.body, user_id: userId });
    if (result.error) {
      return next(result);
    }

    res.status(200).send({ data: { message: "Status created successfully" } });
  };

  statusList = async (req, res, next) => {
    let workspace_id = req.params.workspace_id;
    let userId = req.user.id;
    let data = await this.findData("status", { workspace_id }, undefined, [
      "id",
      "name",
      "description",
      "style",
      "created_at",
      "updated_at",
    ]);

    return res.status(200).send(data);
  };

  statusByID = async (req, res, next) => {
    let userId = req.user.id;
    let space_id = req.params.space_id;
    let data = await this.findData("lists", { user_id: userId, space_id });

    return res.status(200).send(data);
  };
}

module.exports = { Status };
