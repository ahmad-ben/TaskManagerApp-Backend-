module.exports = (validateFunction, wantedArgument) => {
  return (req, res, next) => {
    let validateFunctionArgument = req;
    if (wantedArgument === 'body') validateFunctionArgument = req.body;
    if (wantedArgument === 'params') validateFunctionArgument = req.params;

    const { error } = validateFunction(validateFunctionArgument);
  
    if(error) return new JoiInvalidDataError(error.message);
    next();
  }
}