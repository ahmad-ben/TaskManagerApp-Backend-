const  mongoose = require("mongoose");
const { UserModel } = require("../models");
const appError = require("../errors/appError");

module.exports = verifyRefreshToken =   async (req, res, next) => {

  const userId = req.header('userId');
  const refreshToken = req.header('X-refresh-token');
  let isSessionValid = false;

  if(
    !userId ||
    !mongoose.Types.ObjectId.isValid(userId) ||
    !refreshToken
  ) return next(new appError('Invalid data.', 401, true, 'toastr'));
  // throw new appError('Invalid data.', 401, true, 'toastr');
  // return next(new UnauthorizedError(1111111, 'Invalid data.'));

  userDocument = await UserModel.findByIdAndToken(userId, refreshToken);
  if(!userDocument) return next(new appError('User not found.', 401, true, 'toastr'));
  // throw new appError('User not found.', 401, true, 'toastr');
  // return next(new UnauthorizedError(1, 'User not found.'));

  req.userDocumentObj = userDocument;

  userDocument.sessions.forEach((session) => {
    if (
      session.token === refreshToken &&
      !UserModel.hasRefreshTokenExpired(session.expiresAt)
    ) isSessionValid = true;
  });

  if (isSessionValid) return next();
  next(new appError('The session does not exist or is expired.', 401, true, 'toastr'));
  // throw new appError('The session does not exist or is expired.', 401, true, 'toastr');
  // return next(new UnauthorizedError(1, 'The session does not exist or is expired.'));

}


/*
  =>IMPO 'The Approach Of Throw An Error Work Normally In All The Places Except This' Search about 'throw new in the custom middlewares':
    !throw new UnauthorizedError(1, 'Invalid data.');
    !throw new UnauthorizedError(1, 'User not found.');
    !new UnauthorizedError(1, 'The session does not exist or is expired.');
*/
