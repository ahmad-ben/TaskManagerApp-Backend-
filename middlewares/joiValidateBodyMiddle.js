const appError = require("../errors/appError");

module.exports = (validateFunction) => {
  return (req, res, next) => {
    const { error } = validateFunction(req.body);
  
    if(error) throw new appError(error.message, 400, false, 'message');
    next();
  }
}
