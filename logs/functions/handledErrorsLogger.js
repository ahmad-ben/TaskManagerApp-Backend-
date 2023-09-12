const winston = require("winston");

module.exports = winston.createLogger({
  level: 'error',//=> IMPO: Change this latter to error with the removing of the console.
  format: winston.format.json(),
  transports: [
    new winston.transports.File({filename: 'logs/files/handledError.log'}),
  ],
})