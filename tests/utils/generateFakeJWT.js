const jwt = require('jsonwebtoken');

const generateFakeJWT = (userDocument) => {
  return new Promise((res, rej) => {
    jwt.sign(
        {_id: userDocument._id },
        "FakeSecretKeyForTestingPurposes",
        { expiresIn: '15min' },  
        (err, encodedToken) => {
          if(err) throw new appError('Generate access token failed.', 500, true, 'toastr', 1);
          return res(encodedToken);
        }
      )
  })
};

module.exports = generateFakeJWT;