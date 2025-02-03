const  mongoose = require("mongoose");
const { UserModel } = require("../models");
const appError = require("../errors/appError");

module.exports = verifyRefreshToken =   async (req, res, next) => {
  const userId = req.header('userId');
  const refreshToken = req.header('x-refresh-token');
  let isSessionValid = false;

  if(
    !userId ||
    !mongoose.Types.ObjectId.isValid(userId) ||
    !refreshToken
  ) return next(new appError('Invalid data.', 401, true, 'toastr'));

  userDocument = await UserModel.findByIdAndToken(userId, refreshToken);
  if(!userDocument) return next(new appError('User not found.', 401, true, 'toastr'));

  req.userDocumentObj = userDocument;

  userDocument.sessions.forEach((session) => {
    if (
      session.token === refreshToken &&
      !UserModel.hasRefreshTokenExpired(session.expiresAt)
    ) isSessionValid = true;
  });

  if (isSessionValid) return next();
  next(new appError('The session does not exist or is expired.', 401, true, 'toastr'));
}

