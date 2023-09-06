const { UserModel } = require("../models/index");
const mongoose = require("mongoose");

module.exports = verifyRefreshToken = async (req, res, next) => {
  const userId = req.header('userId');
  const refreshToken = req.header('X-refresh-token');
  let isSessionValid = false;

  if(
    !userId ||
    !mongoose.Types.ObjectId.isValid(userId) ||
    !refreshToken
  ) return new UnauthorizedError(1, 'Invalid data.');
  // res.status(400).send(new Error('Some data is wrong.'));

  userDocument = await UserModel.findByIdAndToken(userId, refreshToken);
  if(!userDocument) return new UnauthorizedError(1, 'User not found.');
  // return res.status(404).send(new Error('User not found.'));

  req.userDocumentObj = userDocument;

  userDocument.sessions.forEach((session) => {
    if (
      session.token === refreshToken &&
      !UserModel.hasRefreshTokenExpired(session.expiresAt)
    ) isSessionValid = true;
  });

  if (isSessionValid) return next();
  new UnauthorizedError(1, 'The session does not exist or is expired.');
  // res.status(401).send(new Error('The session does not exist or is expired.'));
}