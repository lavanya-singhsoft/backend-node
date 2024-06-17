const { codes } = require("../utility/statusCodes");

class MessageHandler {
  constructor() {}

  handleStatus(status, message) {
    return { status: status, message: message || codes[status] };
  }
}

module.exports = MessageHandler;
