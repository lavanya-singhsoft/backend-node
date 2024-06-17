const { Tasks } = require("./controller");
const taskRoutes = require("express").Router();

const {
  createTask,
  tasksListBySpace,
  tasksListByList,
  single_task,
  updateTask,
  assignTask,
  usersByList,
  unAssignTask,
  delete_task,
} = new Tasks();

taskRoutes.post("/", createTask);
taskRoutes.put("/:task_id", updateTask);
taskRoutes.put("/assign/user", assignTask);
taskRoutes.put("/unassign/user", unAssignTask);
taskRoutes.get("/:task_id", single_task);
taskRoutes.delete("/:task_id", delete_task);
taskRoutes.get("/space/list/:space_id", tasksListBySpace);
taskRoutes.get("/list/:list_id", tasksListByList);
taskRoutes.get("/users/:list_id", usersByList);
module.exports = { taskRoutes };
