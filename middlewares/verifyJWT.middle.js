const jwt = require("jsonwebtoken");

const JWTSecret = '1234554321asdfggfdsa0plmkoij987'; //=> LATER: SHOULD CHANGE TO ENV

module.exports = verifyJWTMiddle = (req, res, next) => {
  let JWTToken = req.header('X-access-token');

  // if(!JWTToken) return res.status(401).send(new Error('No JWT provided.'));
  if(!JWTToken) return new UnauthorizedError('No JWT provided.', 0);

  jwt.verify(JWTToken, JWTSecret, (err, JWTTokenDecoded) => {
    // if(err) return res.status(401).send(err);
    if(err) return new UnauthorizedError(err.message, 1);
    req.userId = JWTTokenDecoded._id;
    next();
  }); 

}