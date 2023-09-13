const compression = require("compression");
const  helmet = require("helmet")

module.exports = (app) => {
  app.use(helmet());
  app.use(compression({
    threshold: 0,
  }));
}