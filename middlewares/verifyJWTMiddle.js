const jwt = require("jsonwebtoken");
const appError = require("../errors/appError");

const JWTSecret = process.env.JWT_SECRET_KEY; 

module.exports = verifyJWTMiddle = (req, res, next) => {

  let JWTToken = req.header('x-access-token');

  if(!JWTToken) throw new appError('No JWT provided.', 401, false)

  jwt.verify(JWTToken, JWTSecret, (err, JWTTokenDecoded) => {
    if(err) throw new appError(err.message, 401, false);
    req.userId = JWTTokenDecoded._id;
    next();
  }); 

}

