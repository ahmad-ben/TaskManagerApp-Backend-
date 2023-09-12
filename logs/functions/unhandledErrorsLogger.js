const winston = require("winston");

module.exports = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  handleExceptions: true,
  handleRejections: true,

  exceptionHandlers: [
    new winston.transports.File({filename: 'logs/files/exceptions.log'})
  ],

  rejectionHandlers: [
    new winston.transports.File({filename: 'logs/files/rejections.log'})
  ]
})