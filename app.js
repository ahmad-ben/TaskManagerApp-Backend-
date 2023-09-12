require("dotenv").config();
const express = require("express");
const unhandledErrorsLogger = require("./logs/functions/unhandledErrorsLogger");
const app = express();

console.log('Current environment: ', app.get('env'));
console.log('Environment variables: ', process.env);

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

let port;
if(process.env.NODE_ENV == 'development'){
  port = 80
}else port = process.env.PORT;

const server = app.listen(port, () => console.log(`server is listening in port ${port}...`));

require("./components/environmentVariables")();
require("./components/generalMiddle")(app);
require("./components/routes")(app);
require("./components/errorHandlerMiddle")(app);
require("./components/database")(server);
require("./components/validation")();
