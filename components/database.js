const mongoose = require('mongoose');
const { response } = require('express');
const unhandledErrorsLogger = require('../logs/functions/unhandledErrorsLogger');

module.exports = (server) => {
  let dbUrl;
  if(process.env.NODE_ENV == 'development'){
    dbUrl = 'mongodb://127.0.0.1:27017/TaskManager'
  }else port = process.env.DATABASE_URL;
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
    }) 
}


