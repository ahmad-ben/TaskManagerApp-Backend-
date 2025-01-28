const mongoose = require('mongoose');
const unhandledErrorsLogger = require('../logs/functions/unhandledErrorsLogger');

module.exports = (server) => {
  mongoose.connect(process.env.DATABASE_URL) 
    .catch((ex) => {
      unhandledErrorsLogger.error(ex.message); //Not working why??
      server.close(() => process.exit(1));
    }) 

}