const winston = require("winston");

module.exports = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({filename: 'logs/files/handledError.log'}),
  ],
})