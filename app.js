const express = require("express");
const unhandledErrorsLogger = require("./logs/functions/unhandledErrorsLogger");
const app = express();

process
  .on('uncaughtException', (ex) => {
    console.log('------------------------ uncaughtException', ex);
    unhandledErrorsLogger.error(ex.message);
    server.close(() => process.exit(1));
  })
  .on('unhandledRejection', (ex) => {
    console.log('------------------------ unhandledRejection', ex);
    unhandledErrorsLogger.error(ex.message);
    server.close(() => process.exit(1));
  })

const port = process.env.PORT || 80;//=> IMPO: Change after deploy
const server = app.listen(port, () => console.log(`server is listening in port ${port}...`));

require("./components/generalMiddle")(app);
require("./components/routes")(app);
require("./components/errorHandlerMiddle")(app);
require("./components/database")(server);
require("./components/validation")();
