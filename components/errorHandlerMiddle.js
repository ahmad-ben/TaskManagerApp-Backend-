const errorHandlerMiddle = require("../middlewares/errorHandlerMiddle");

module.exports = (app) => {
  app.use(errorHandlerMiddle);
}

