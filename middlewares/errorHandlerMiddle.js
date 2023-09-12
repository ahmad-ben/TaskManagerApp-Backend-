const appError = require("../errors/appError");
const handledErrorsLogger = require("../logs/functions/handledErrorsLogger");

module.exports = (error, req, res, next) => {
  handledErrorsLogger.error(error.message);
  console.log('------------------------------------------------------');
  console.log('here: ', error);
  console.log('here: ', error.message);
  console.log('here: ', typeof(error));
  console.log('------------------------------------------------------');

  if(error.code == 11000 ) {
    return res.status(400).json({
      message: `This following email is already registered: '${error.keyValue.email}'.`, 
      shouldNavigate: false,
      clientMessageShape: 'message'
    });
  }

  if(error instanceof appError ) {
    console.log('Here Two InstanceOf', error);
    return res.status(error.statusCode).json({
      message: error.message,
      shouldNavigate: error.shouldNavigate,
      clientMessageShape: error.clientMessageShape,
      retry: error.retry,
    });
  }

  return res.status(500).json({
    errorMessage: 'Something went wrong.', 
  });


}
