const environmentsPath = `./environments/.env.${process.env.NODE_ENV || "development"}`;

require("dotenv").config( { path: environmentsPath } );
require("./environments/environments-check")();

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

const server = app.listen(process.env.PORT);

require("./components/deployMiddle")(app);
require("./components/generalMiddle")(app);
require("./components/routes")(app);
require("./components/errorHandlerMiddle")(app);
require("./components/database")(server);
require("./components/validation")();

module.exports = server;