const appError = require("../errors/appError");

module.exports = (validateFunction) => {
  return (req, res, next) => {
    // console.log(req);
    // console.log(req.params);
    
    const { error } = validateFunction(req.params);

    if(error){
      const isWantedErrorMessage = error.message.includes('fails to match the valid mongo id pattern');
      if(isWantedErrorMessage) error.message = 'Invalid url.';
      throw new appError(error.message, 400, true, 'toastr');
    }

    next();
  }
}


