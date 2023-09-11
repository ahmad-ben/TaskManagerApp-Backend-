/*
const JoiInvalidDataError = require("../errors/JoiInvalidDataError");
const appError = require("../errors/appError");

module.exports = (validateFunction, wantedArgument) => {
  return (req, res, next) => {
    let validateFunctionArgument = req;
    if (wantedArgument === 'body') validateFunctionArgument = req.body;
    if (wantedArgument === 'params') validateFunctionArgument = req.params;

    const { error } = validateFunction(validateFunctionArgument);
  
    console.log('Seeee:', error);
    if(error) throw new JoiInvalidDataError(error.message);
    // throw new appError(error.message, 400, )
    // 
    next();
  }
}
*/
//=> IMPO: Like Here! The Thrown Of Error Work Properly, should delete with al other error classes