const express = require("express");
const app = express();

require("./components/generalMiddle")(app);
require("./components/routes")(app);
require("./components/errorHandlerMiddle")(app);
require("./components/database")();
require("./components/validation")();

app.listen(80, () => console.log("server is listening in port 3000..."));