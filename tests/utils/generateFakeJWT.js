const jwt = require('jsonwebtoken');

module.exports = (userDocument) => {
  process.env.JWT_SECRET_KEY = "FakeSecretKeyForTestingPurposes";

  return new Promise((res, rej) => {
    jwt.sign(
        {_id: userDocument._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '15min' },  
        (err, encodedToken) => {
          if(err) throw new appError('Generate access token failed.', 500, true, 'toastr', 1);
          return res(encodedToken);
        }
      )
  })
}