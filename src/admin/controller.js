const { conPool } = require("../../dbConnect");
const { AuthController } = require("../auth/authController");
const { CRUDController } = require("../controllers/crudController");

const { genrateToken, hashPassword, comparePassword } = new AuthController();
class AdminController extends CRUDController {
  constructor() {
    super();
  }

  loginUser = async (req, res, next) => {
    let body = req.body;
    let { email, password } = body;

    let validate = ["email", "password"];
    let errors = this.validatePayload(validate, body);
    if (errors) {
      return res.status(400).send(errors);
    }

    let data = await this.findOne("admin", { email: email });

    if (!data) {
      return res.status(403).send({ message: "Invalid credentials" });
    }

    let compare = await comparePassword(password, data.password);
    if (!compare) {
      return res.status(403).send({ message: "Invalid credentials" });
    }

    let token = await genrateToken(data);
    delete data.password;
    return res.status(200).send({ ...data, token });
  };

  createUser = async (req, res, next) => {
    let validate = ["email", "password", "name"];
    let extraFields = ["phone"];
    let body = req.body;
    let errors = this.validatePayload(validate, body);

    if (errors) {
      return res.status(400).send(errors);
    }
    let { email, password } = req.body;

    let hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      return res.status(400).send({ message: "Invalid password" });
    }

    body.password = hashedPassword;
    let data = await this.findOne("admin", { email: email });

    if (data) {
      return res.status(409).send({ message: "User already exists" });
    }

    let createNew = await this.createData("admin", [...validate, ...extraFields], body);

    if (createNew.error) {
      return res.status(400).send({ message: createNew });
    }

    res.status(200).send({ message: "user Created Successfully", ...body });
  };

  searchUser = async (req, res, next) => {
    let qry = req.query;
    let { name, email } = qry;
    let qryObj = { name, email };

    let data = await this.searchData("admin", qryObj, next, ["id", "name"]);

    return res.status(200).send({ data: data });
  };
}

module.exports = { AdminController };
