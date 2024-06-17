var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { conPool } = require("../../dbConnect");

class AuthController {
  constructor() {
    this.tokenString = process.env.TOKENSECRET;
    this.saltRounds = +process.env.SALTROUNDS;
  }

  hashPassword = async (password) => {
    try {
      const saltRounds = this.saltRounds;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  comparePassword = async (password, hashedPassword) => {
    try {
      const match = await bcrypt.compare(password, hashedPassword);
      return match;
    } catch (error) {
      return false;
    }
  };

  genrateToken = async (data) => {
    try {
      let token = jwt.sign(data, this.tokenString, { expiresIn: "10d" });
      return token;
    } catch (err) {
      return null;
    }
  };

  jwtVerify = async (token, next, table = "admin") => {
    if (!token) {
      return next({ message: "invalid Token", code: 401 });
    }
    token = token.split(" ")[1];

    try {
      let decodedToken = jwt.verify(token, this?.tokenString);
      if (!decodedToken || !decodedToken?.id) {
        return next({ message: "invalid Token", code: 401 });
      }

      let [data] = await conPool.execute(`select * from ` + table + ` where id = '${decodedToken?.id}'`);

      if (!data || !data.length || !data[0]) {
        return next({ message: "invalid Token", code: 401 });
      }

      return data[0];
    } catch (error) {
      console.log(error);
      return next({ message: "invalid Token", code: 401 });
    }
  };

  validateToken = async (req, res, next, table = "admin") => {
    let token = req.headers["authorization"];
    let user = await this.jwtVerify(token, next, table);
    if (req) {
      req.user = user;
    }
    return next();
  };

  socketAuth = async (socket, next) => {
    const token = socket?.handshake?.query?.token;

    let user = await this.jwtVerify(" " + token, next);
    socket.user = user;
    next();
  };
}

module.exports = { AuthController };
