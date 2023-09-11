const mongoose = require('mongoose');

module.exports = () => {
  mongoose.connect('mongodb://127.0.0.1:27017/TaskManager') 
  .then(() => { 
    console.log('Connect To MongoDB Successfully :)');
  }).catch((ex) => {
    console.log('An Error Happened While Connecting To MongoDb :(');
    console.log(ex);
  })
}
//=> IMPO: Detect Mongo DB Down and handle this Error If Happen.