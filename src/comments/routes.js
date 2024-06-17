const Comments = require("./controller");

const commentsRouter = require("express").Router();

const { create, list, view, update, delete_comment } = new Comments();

commentsRouter.get("/:task_id", list);
commentsRouter.get("/:task_id/:comment_id", view);
commentsRouter.post("/:task_id", create);
commentsRouter.put("/:task_id/:comment_id", update);
commentsRouter.delete("/:task_id/:comment_id", delete_comment);

module.exports = commentsRouter;
