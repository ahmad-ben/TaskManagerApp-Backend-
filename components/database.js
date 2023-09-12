const mongoose = require('mongoose');
const errorHandlerMiddle = require('../middlewares/errorHandlerMiddle');
const { response } = require('express');
const unhandledErrorsLogger = require('../logs/functions/unhandledErrorsLogger');

module.exports = (server) => {
  mongoose.connect('mongodb://127.0.0.1:27017/TaskManager') 
    .then(() => { 
      console.log('Connect To MongoDB Successfully :)');
      unhandledErrorsLogger.info('Connect To MongoDB Successfully :)');

    })
    .catch((ex) => {
      console.log('An Error Happened While Connecting To MongoDb :(')
      console.log(ex);
      unhandledErrorsLogger.error(ex.message);
      // server.close(() => process.exit(1)); =>IMPO: In deployment.
    }) //=> IMPO: If i remove this the on -unhandledRejection- receive the error but the app still crashed ??
}


