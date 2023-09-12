const winston = require("winston");

module.exports = winston.createLogger({
  level: 'info',//=> IMPO: Change this latter to error with the removing of the console.
  format: winston.format.json(),
  handleExceptions: true,
  handleRejections: true,
  transports: [
    new winston.transports.Console({
      // format: winston.format.simple()      
      format: winston.format.combine(
        winston.format.colorize(), //=>IMPO: Note It.
        winston.format.simple()
      ),
      handleExceptions: true
    })
  ],

  exceptionHandlers: [
    new winston.transports.File({filename: 'logs/files/exceptions.log'})
  ],

  rejectionHandlers: [
    new winston.transports.File({filename: 'logs/files/rejections.log'})
  ]
})