const { CRUDController } = require("../controllers/crudController");

class Tasks extends CRUDController {
  constructor() {
    super();
  }

  taskQry = (where, userId) => {
    let qry = `
      SELECT
        id, parent_id, name, status, style, status_description, status_id, description, space_id, workspace_id, list_id, icon, due_date, priority, tags, created_at, updated_at,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id',
            user_id,
            'user_name',
            user_name,
            'user_email',
            user_email,
            'admin',
            admin
          )
        ) AS users
      FROM
          taskslist
      WHERE
          ${where}
              AND EXISTS( SELECT 
                  1
              FROM
                  list_users
              WHERE
                  user_id = '${userId}'
              LIMIT 1)
      GROUP BY id
      order by cast(updated_at as datetime) desc
    `;

    return qry;
  };

  createTask = async (req, res, next) => {
    let fields = ["name", "list_id", "space_id", "workspace_id"];
    let extrafields = [
      "user_id",
      "description",
      "users",
      "due_date",
      "tags",
      "icon",
      "priority",
      "parent_id",
      "status",
    ];

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

    req.body.users = users;
    let values = this.generateValuebyBody([...fields, ...extrafields], { ...req.body, user_id: userId });
    let sqlQry = "CALL create_task(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    return this.runQuery(req, res, next, sqlQry, values);
  };

  tasksListBySpace = async (req, res, next) => {
    let space_id = req.params.space_id;
    let userId = req.user.id;
    let { status } = req.query;

    let filters = { space_id };
    if (status) {
      filters.status_id = status;
    }

    let qry = this.genrateQry(filters);
    let customQry = this.taskQry(qry, userId);

    let data = await this.findData("taskslist", filters, undefined, undefined, undefined, customQry);

    return res.status(200).send(data);
  };

  tasksListByList = async (req, res, next) => {
    let userId = req.user.id;
    let list_id = req.params.list_id;
    let { status } = req.query;
    let filters = { list_id };
    if (status) {
      filters.status_id = status;
    }

    let qry = this.genrateQry(filters);

    let customQry = this.taskQry(qry, userId);

    let data = await this.findData("taskslist", filters, undefined, undefined, undefined, customQry);

    return res.status(200).send(data);
  };

  single_task = async (req, res, next) => {
    let userId = req.user.id;
    let task_id = req.params.task_id;

    let customQry = this.taskQry(`id = '${task_id}'`, userId);

    let data = await this.findOne("taskslist", { user_id: userId, id: task_id }, undefined, undefined, customQry);

    return res.status(200).send(data);
  };

  updateTask = async (req, res, next) => {
    const { task_id } = req.params;
    let userId = req.user.id;
    let fields = ["name", "description", "due_date", "tags", "icon", "priority", "status"];

    let validateBody = this.validatePayloadifAvailable(fields, req.body);

    if (validateBody) {
      return next({ code: 400, message: { data: validateBody } });
    }

    let subqry = `SELECT 1
    FROM task_users
    WHERE task_users.user_id = '${userId}'
    AND task_users.task_id = tasks.id`;

    let updateData = await this.updateData("tasks", fields, req.body, { id: task_id }, next, subqry);

    if (updateData) {
      res.status(200).send({ data: { message: "Task updated successfully" } });
    }
  };

  assignTask = async (req, res, next) => {
    let userId = req.user.id;
    let fields = ["user_id", "task_id"];
    let { user_id, task_id } = req.body;

    let validateBody = this.validatePayload(fields, req.body);

    if (validateBody) {
      return next({ code: 400, message: { data: validateBody } });
    }

    let condition = { user_id: userId, task_id };

    let createData = await this.createDatawithCondition("task_users", fields, req.body, next, condition);

    if (createData) {
      res.status(200).send({ data: { message: "task successfully assigned to user" } });
    }
  };

  unAssignTask = async (req, res, next) => {
    let userId = req.user.id;
    let fields = ["user_id", "task_id"];

    let validateBody = this.validatePayload(fields, req.body);

    if (validateBody) {
      return next({ code: 400, message: { data: validateBody } });
    }

    let values = this.generateValuebyBody(fields, { ...req.body });
    let sqlQry = "CALL DeleteTaskUser(?, ?)";

    return this.runQuery(req, res, next, sqlQry, values, "unassigned successfully", "failed to unassign");
  };

  usersByList = async (req, res, next) => {
    let { list_id } = req.params;
    let data = await this.findData("all_list_users", { list_id });
    return res.status(200).send(data);
  };

  delete_task = async (req, res, next) => {
    let { task_id } = req.params;
    let user_id = req.user.id;
    let data = await this.deleteData("tasks", { id: task_id, user_id }, next);

    if (data) return res.status(200).send({ message: "Task deleted successfully" });
  };
}

module.exports = { Tasks };
