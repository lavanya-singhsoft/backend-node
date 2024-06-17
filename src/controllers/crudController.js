const { conPool } = require("../../dbConnect");
const { validatePayload, validatePayloadifAvailable } = require("../utility/validatePayload");

class CRUDController {
  constructor(data) {
    this.data = [];
    this.conPool = conPool;
    this.validatePayload = validatePayload;
    this.validatePayloadifAvailable = validatePayloadifAvailable;
    this.env = process.env;
  }

  // static functions

  generateKeyValues = (keys, keyValues = {}) => {
    let genrateKeys = "";
    let blanks = "";
    let values = [];
    keys.forEach((key) => {
      values.push(keyValues[key] || null);
      genrateKeys += `${key}, `;
      blanks += "?, ";
    });

    genrateKeys = genrateKeys.replace(/, $/, "");
    genrateKeys = genrateKeys.replace(/,$/, "");

    blanks = blanks.replace(/, $/, "");
    blanks = blanks.replace(/,$/, "");

    return { genrateKeys, blanks, values };
  };

  prepareUpdateData = (keys, keyValues = {}) => {
    let genrateKeys = "";
    let values = [];
    keys.forEach((key) => {
      if (keyValues[key]) {
        values.push(keyValues[key]);
        genrateKeys += ` ${key} = ?,`;
      }
    });

    genrateKeys = genrateKeys.replace(/, $/, "");
    genrateKeys = genrateKeys.replace(/,$/, "");

    return { genrateKeys, values };
  };

  genrateQry = (qry, operator = "and") => {
    let qryStr = "";
    let keysArr = Object.keys(qry);

    for (let index = 0; index < keysArr.length; index++) {
      const key = keysArr[index];
      const val = qry[key];

      if (keysArr.length == 1) {
        qryStr += `${key} = '${val}'`;
      } else if (index == keysArr.length - 1) {
        qryStr += `${key} = '${val}'`;
      } else {
        qryStr += `${key} = '${val}' ${operator} `;
      }
    }

    return qryStr;
  };

  errorHandler = (error) => {
    if (error.code === "ER_DUP_ENTRY") {
      const regex = /for key '([^']+)'/;
      const match = regex.exec(error.sqlMessage);
      if (match && match[1]) {
        const fieldName = match[1].split(".")[1];
        return { message: `Error: Duplicate entry for field '${fieldName}'`, error: true, field: fieldName, code: 400 };
      } else {
        return { message: "Error: Duplicate entry, but could not determine the field name.", code: 400, error: true };
      }
    } else {
      console.log("Error:", error);
    }
    return { message: error.sqlMessage || "Something went wrong", code: 500, error: true };
  };

  generateValuebyBody = (fields, body) => {
    let values = [];
    fields.forEach((field) => {
      values.push(body[field]);
    });

    return values;
  };

  getDataFromView = async (req, res, next, viewName, condition) => {
    let sqlQry = `select * from ${viewName}`;
    if (condition) {
      let where = this.genrateQry(condition);
      sqlQry += ` where ${where}`;
    }

    try {
      let [result] = await this.conPool.query(sqlQry);

      res.status(200).send(result);
    } catch (err) {
      let error = this.errorHandler(err);
      return next(error);
    }
  };

  getUniqueValues = (array, check = "all", stringify = false) => {
    let map = new Map();
    let errMsg = "";
    if (!Array.isArray(array)) {
      return { error: true };
    }

    array.forEach((item) => {
      let normalizedItem;
      if (typeof item === "string") {
        let lowerCaseItem = item.toLowerCase();
        normalizedItem = isNaN(lowerCaseItem) ? lowerCaseItem : Number(lowerCaseItem);
      } else {
        normalizedItem = item;
      }

      if (check === "number" && typeof normalizedItem !== "number") {
        return (errMsg = `only numbers`);
      } else if (check === "string" && typeof normalizedItem !== "string") {
        return (errMsg = `only String values`);
      }

      if (!map.has(normalizedItem)) {
        map.set(normalizedItem, item);
      }
    });

    if (errMsg) {
      return { errMsg, error: true };
    }

    let finalArr = Array.from(map.values());

    if (stringify) {
      return JSON.stringify(finalArr);
    }

    return finalArr;
  };

  searchPayload = (object, operator = "or") => {
    let sqlSearchString = "";
    let arr = [];
    let keysArr = Object.keys(object);

    keysArr.forEach((key, index) => {
      if (object[key]) {
        arr.push(index);
      }
    });

    if (!arr.length) {
      return "";
    }

    keysArr.forEach((key, index) => {
      let val = object[key];
      if (object[key]) {
        if (arr.length == 1) {
          sqlSearchString = `${key} like '%${val}%'`;
        } else if (index == arr.length - 1) {
          sqlSearchString += `${key} like '%${val}%'`;
        } else {
          sqlSearchString += `${key} like '%${val}%' ${operator} `;
        }
      }
    });

    return sqlSearchString;
  };

  // static functions

  runQuery = async (req, res, next, query, values, msg = "created successfully", fail = "failed to create") => {
    try {
      let result = await this.conPool.query(query, values);

      let message = msg;
      if (result && result[0]?.affectedRows) {
        message = msg;
      } else {
        message = fail;
      }
      return res.status(200).send({ message: message });
    } catch (error) {
      return next({ message: this.errorHandler(error), code: 400 });
    }
  };

  createData = async (table, keys, keyValues, next) => {
    const { genrateKeys, blanks, values } = this.generateKeyValues(keys, keyValues);
    let sqlqry = `insert into ${table} (${genrateKeys}) values(${blanks})`;

    try {
      let [result, exQry] = await conPool.execute(sqlqry, values);
      return result;
    } catch (error) {
      if (next) {
        return next({ message: this.errorHandler(error), code: 400 });
      } else {
        return this.errorHandler(error);
      }
    }
  };

  createDatawithCondition = async (table, keys, keyValues, next, condition) => {
    let { genrateKeys, blanks, values } = this.generateKeyValues(keys, keyValues);
    let newValues = [];
    values.map((value) => newValues.push("'" + value + "'"));

    let where = this.genrateQry(condition);

    let sqlqry = `INSERT INTO  ${table} (${genrateKeys})
      SELECT ${newValues}
      WHERE EXISTS (
      SELECT 1
      FROM ${table} 
      WHERE ${where}
    );`;

    try {
      let [result, exQry] = await conPool.execute(sqlqry, values);
      if (result.affectedRows) {
        return result;
      }
      next({ message: { message: "unable to assign" }, code: 200 });
    } catch (error) {
      if (next) {
        return next({ message: this.errorHandler(error), code: 400 });
      } else {
        return this.errorHandler(error);
      }
    }
  };

  deleteData = async (table, qrydata = {}, next) => {
    const qry = this.genrateQry(qrydata);
    let sqlqry = `delete from ${table} where ${qry}`;

    try {
      let [result, exQry] = await conPool.execute(sqlqry);
      return result;
    } catch (error) {
      if (next) {
        return next({ message: this.errorHandler(error), code: 400 });
      } else {
        return this.errorHandler(error);
      }
    }
  };

  readData() {
    console.log("first");
  }

  async findData(table, qry, operator, select = "*", subQry, customQry) {
    let qryStr = this.genrateQry(qry, operator);
    let sqlqry = `select ${select} from ${table} where ${qryStr}`;

    if (subQry) {
      sqlqry += `and ${subQry}`;
    }

    if (customQry) {
      sqlqry = customQry;
    }
    // console.log(sqlqry, "sqlqry");

    try {
      let [result, query] = await this.conPool.execute(sqlqry);

      return result;
    } catch (error) {
      console.log(error, " error in sql query ", sqlqry);
      return false;
    }
  }

  async findOne(table, qry, operator = "and", select = "*", customQry) {
    let qryStr = this.genrateQry(qry, operator);

    let sqlqry = `select ${select} from ${table} where ${qryStr} limit 1`;

    if (customQry) {
      sqlqry = customQry + " limit 1";
    }

    try {
      let [result, query] = await this.conPool.execute(sqlqry);

      if (result && result[0]) {
        return result[0];
      }
      return false;
    } catch (error) {
      console.log(error, " error in sql query ", sqlqry);
      return false;
    }
  }

  async searchData(table, qry, next, select) {
    let qryStr = this.searchPayload(qry);

    if (!qryStr) {
      return [];
    }

    select = select || "*";
    let sqlqry = `select ${select} from ${table} where ${qryStr} limit ${this.env.SEARCH_LIMIT}`;
    try {
      let [result, query] = await this.conPool.execute(sqlqry);

      return result;
    } catch (error) {
      console.log(error, " error in sql query search", sqlqry);
      next({ message: this.errorHandler(error), code: 400 });
    }
  }

  updateData = async (table, fields, keyValues, condition, next, subqry) => {
    let { genrateKeys, values } = this.prepareUpdateData(fields, keyValues);
    let qryStr = this.genrateQry(condition);

    let sqlqry = `UPDATE ${table} SET ${genrateKeys} WHERE ${qryStr}`;
    if (subqry) {
      sqlqry += ` and Exists (${subqry})`;
    }

    try {
      let [result, exQry] = await conPool.execute(sqlqry, values);
      return result;
    } catch (error) {
      if (next) {
        return next({ message: this.errorHandler(error), code: 400 });
      } else {
        return this.errorHandler(error);
      }
    }
  };
}

module.exports = { CRUDController };
