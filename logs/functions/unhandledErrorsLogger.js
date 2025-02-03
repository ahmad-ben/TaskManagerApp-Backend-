const winston = require("winston");
const { stack } = require("../../routes/tasks.route");

module.exports = winston.createLogger({
  level: 'error',
  format: winston.format.errors({stack: true}),
  handleExceptions: true,
  handleRejections: true,

  exceptionHandlers: [
    new winston.transports.File({filename: 'logs/files/exceptions.log'})
  ],

  rejectionHandlers: [
    new winston.transports.File({filename: 'logs/files/rejections.log'})
  ]
})