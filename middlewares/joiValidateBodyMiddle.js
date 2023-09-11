const appError = require("../errors/appError");

module.exports = (validateFunction) => {
  return (req, res, next) => {
    const { error } = validateFunction(req.body);
  
    console.log('Seeee:', error);
    if(error) throw new appError(error.message, 400, false, 'message');
    next();
  }
}

//=> IMPO: Like Here! The Thrown Of Error Work Properly