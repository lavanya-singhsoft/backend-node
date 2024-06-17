const { CRUDController } = require("../controllers/crudController");

class Comments extends CRUDController {
  constructor() {
    super();
  }

  create = async (req, res, next) => {
    let fields = ["name", "list_id", "task_id"];
    let extrafields = ["user_id", "description"];
    let task_id = req.params.task_id;

    let userId = req.user.id;
    req.body.user_id = userId;
    req.body.task_id = task_id;

    let validateBody = this.validatePayload(fields, req.body);

    if (validateBody) {
      return next({ code: 400, message: { data: validateBody } });
    }
    const result = await this.createData("comments", [...fields, ...extrafields], req.body, next);

    if (result) {
      return res.status(200).send({ message: "Comment created successfully" });
    }
  };

  update = async (req, res, next) => {
    let { task_id, comment_id } = req.params;
    let fields = ["name", "description"];
    let userId = req.user.id;
    const updateData = this.updateData(
      "comments",
      fields,
      req.body,
      { task_id, id: comment_id, user_id: userId },
      next
    );

    if (updateData) {
      res.status(200).send({ message: "Comment updated successfully" });
    }
  };

  list = async (req, res, next) => {
    let task_id = req.params.task_id;
    req.body.task_id = task_id;
    let data = await this.findData("comments_view", { task_id });
    res.status(200).send({ data: data });
  };

  view = async (req, res, next) => {
    let { task_id, comment_id } = req.params;
    let viewData = await this.findOne("comments_view", { task_id, id: comment_id });
    res.status(200).send({ data: viewData });
  };

  delete_comment = async (req, res, next) => {
    let { task_id, comment_id } = req.params;
    let userId = req.user.id;
    const deleteRecord = await this.deleteData("comments", { task_id, id: comment_id, user_id: userId }, next);
    if (deleteRecord) {
      return res.status(200).send({ message: "Comment Deleted successfully" });
    }
  };
}

module.exports = Comments;
