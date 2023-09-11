const jwt = require("jsonwebtoken");
const appError = require("../errors/appError");

const JWTSecret = '1234554321asdfggfdsa0plmkoij987'; //=> LATER: SHOULD CHANGE TO ENV

module.exports = verifyJWTMiddle = (req, res, next) => {
  console.log('Verify JWT Middle Works!.');

  let JWTToken = req.header('X-access-token');

  if(!JWTToken) throw new appError('No JWT provided.', 401, false)
  // throw new UnauthorizedError(0, 'No JWT provided.');

  jwt.verify(JWTToken, JWTSecret, (err, JWTTokenDecoded) => {
    if(err) throw new appError(err.message, 401, false);
    // throw new UnauthorizedError(0, err.message);
    req.userId = JWTTokenDecoded._id;
    next();
  }); 

}

