require("dotenv").config();
require("./components/environmentVariables")();

const express = require("express");
const unhandledErrorsLogger = require("./logs/functions/unhandledErrorsLogger");
const app = express();

process
  .on('uncaughtException', (ex) => {
    unhandledErrorsLogger.error(ex.message);
    server.close(() => process.exit(1));
  })
  .on('unhandledRejection', (ex) => {
    unhandledErrorsLogger.error(ex.message);
    server.close(() => process.exit(1));
  })

let port;

if(process.env.NODE_ENV == 'development') port = 3000;
else port = process.env.PORT;

const server = app.listen(port);

require("./components/deployMiddle")(app);
require("./components/generalMiddle")(app);
require("./components/routes")(app);
require("./components/errorHandlerMiddle")(app);
require("./components/database")(server);
require("./components/validation")();

module.exports = app;
