const mongoose = require('mongoose');
const { response } = require('express');
const unhandledErrorsLogger = require('../logs/functions/unhandledErrorsLogger');

module.exports = (server) => {
  let dbUrl;
  if(process.env.NODE_ENV == 'development'){
    dbUrl = 'mongodb://127.0.0.1:27017/TaskManager'
  }else dbUrl = process.env.DATABASE_URL;
  mongoose.connect(dbUrl) 
    .catch((ex) => {
      unhandledErrorsLogger.error(ex.message);
      server.close(() => process.exit(1));
    }) 
}


