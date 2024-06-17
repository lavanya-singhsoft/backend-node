const mysql = require("mysql2/promise");

const conPool = mysql.createPool({
  host: "66.85.140.154",
  user: "root",
  port: "3302",
  database: "pms_server",
  password: "node@1234",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// await conPool.q

module.exports = { conPool };
