module.exports = (error, req, res, next) => {
  console.log('here', error);

  if(error instanceof GeneralInvalidDataError ) {
    return res.status(400).json({
      errorMessage: error.message, 
    });
  }

  if(error instanceof UnauthorizedError ) {
    return res.status(401).json({
      errorCode: error.errorCode, //=> IMPO 0: JWT Problem, 1: Refresh Problem
    });
  }

  if(error instanceof JoiInvalidDataError ) {
    return res.status(404).json({
      errorMessage: error.message,
    });
  }

  return res.status(500).send('Something went wrong.');
}