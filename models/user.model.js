const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const appError = require('../errors/appError');
const { log } = require('console');

const JWTSecret = process.env.JWT_SECRET_KEY; 

const userSchema = mongoose.Schema(
  {

    email: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 255,
      trim: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 100,
    },
    sessions: [{
      token:{
        type: String,
        required: true,
      },
      expiresAt: {
        type: Number,
        required: true
      }
    }]

  },

  { 

    statics: { 

      async findByIdAndToken(_id, token){
        return this.findOne({
          _id,
          'sessions.token': token,
        });
      },

      async findByCredentials(email, password){

        const userDocument = await this.findOne({ email });    
    
        if(!userDocument) throw new appError('This account is not registered, sign up first.', 404, false, 'message');
        // throw new GeneralInvalidDataError('This account is not registered, sign up first.');
    
        const compareResult = await bcrypt.compare(password, userDocument.password);
    
        if (compareResult) return userDocument;
        throw new appError('Email or password are invalid.', 404, false, 'message');
        // GeneralInvalidDataError('Email or password are invalid.');
    
      },

      hasRefreshTokenExpired(expiresAt){
        const secondsSinceEpoch = new Date() / 1000;

        if(expiresAt > secondsSinceEpoch) return false;
        return true;

      }

    },

    methods: { 

      toJSON(){
        const userObject = this.toObject();
        return omitFormObj(userObject, ['password', 'sessions']);
      },
  
      generateAccessAuthToken(){ 
          return new Promise((res, rej) => {
            jwt.sign(
                {_id: this._id },
                JWTSecret,
                { expiresIn: '15s' }, //=> LATER: Should Be Less Than This Just For Test 
                (err, encodedToken) => {
                  if(err) throw new appError('Generate access token failed.', 500, true, 'toastr', 1);
                  // throw new Error('Generate access token failed.');
                  return res(encodedToken);
                }
              )
          })
      },

      generateRefreshAuthToken(){
        return new Promise((res, rej) => {
          crypto.randomBytes(64, (err, buf) => {
            if(err) return rej();
            return res(buf.toString('hex'));
          })
        })
      },

  
      async createSession(){
        const newRefreshToken = await this.generateRefreshAuthToken();

        const refreshToken = await saveSessionToDatabase(this, newRefreshToken);
        return refreshToken;
      }
  
    }

  },

);

userSchema.pre('save', async function (next) {
  console.log('                                                   ');
  console.log('                                                   ');
  console.log('                                                   ');
  console.log('                                                   ');
  console.log('PRE WORKS-------------------------------------------');

    console.log('This value, document obj: ', this);
    console.log('This value, document obj: ', this.isModified('password'));
    console.log('This value, document obj: ', this.password);

  console.log('PRE WORKS-------------------------------------------');
  console.log('                                                   ');
  console.log('                                                   ');
  console.log('                                                   ');
  console.log('                                                   ');

  if(!this.isModified('password')) return next();

  const costFactor = 10;
  const salt = await bcrypt.genSalt(costFactor);
  this.password = await bcrypt.hash(this.password, salt);
  next();

})

const omitFormObj = (originalObject, omittedProperties) => {
  let resultObj = {};
  for(property in originalObject){
    if(!omittedProperties.includes(property)) 
    resultObj[property] = originalObject[property]
  }
  return resultObj;
}

const saveSessionToDatabase = async (userDocument, refreshToken) => {
  const expiresAt = generateRefreshTokenExpiryTime();

  userDocument.sessions.push({
    token: refreshToken,
    expiresAt,
  })

  await userDocument.save();
  return refreshToken;

}; 

const generateRefreshTokenExpiryTime = () => {
  const daysUntilExpire = 10;
  const secondsUntilExpire = (((daysUntilExpire * 24) * 60) * 60);
  // const secondsUntilExpire = 30;
  return ((Date.now()/ 1000) + secondsUntilExpire)
}

const UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;


/* 
  Delete It, If The Other Works Properly:
    return new Promise((res, rej) => {
      const expireAt = generateRefreshTokenExpiryTime();

      userDocument.sessions.push({
        token: refreshToken,
        expiresAt
      })

      userDocument.save()
        .then(() => res(refreshToken))
        .catch((ex) => rej(
          `save method in saveSessionToDatabase failed, reason: ${ex}`
        ));
    })

*/

/* 
  * Origine Implementation:
function findByCredentials(email, password) {
  
  let UserModel = this;

  return UserModel.findOne({ email }).then((userDocument) => {
    if(!userDocument) return Promise.reject();

    return new Promise((res, rej) => {
      bcrypt.compare(password, userDocument.password, (err, res) => {
        if(res) return res(userDocument);
        else{ rej() }
      });
    })
  })

}
*/

/*
function generateAccessAuthToken(){ 
  return new Promise((res, rej) => {
    jwt.sign(
        {_id: this._id },
        JWTSecret, //config.get('jwtPrivateKey'),
        { expiresIn: '15m' }, 
        (err, encodedToken) => {
          if(err) return rej();
          return res(encodedToken);
        }
      )
  })
}
*/

/*

I understand that you'd like to avoid using the `new Promise` syntax. In that case, you can 
utilize the `util.promisify` function from the Node.js `util` module to convert the `jwt.sign` 
function, which follows the Node.js callback pattern, into a function that returns a promise.

Here's how you can do it:

```javascript
const util = require('util');
const jwt = require('jsonwebtoken');

// Convert jwt.sign to a promise-based function
const signAsync = util.promisify(jwt.sign);

async function generateAccessAuthToken() {
  try {
    const encodedToken = await signAsync(
      { _id: this._id },
      JWTSecret, //config.get('jwtPrivateKey'),
      { expiresIn: '15m' }
    );

    return encodedToken;
  } catch (error) {
    throw new Error('Error happened', error);
  }
}
```

Now you can use this updated `generateAccessAuthToken` function in your route handler:

```javascript
app.get('/users/me/access-token', verifyRefreshToken, async (req, res) => {
  try {
    const JWTToken = await req.userDocumentObj.generateAccessAuthToken();
    console.log(JWTToken);
    // ... rest of your code
  } catch (error) {
    // Handle the error appropriately
  }
});
```

By using `util.promisify`, you can simplify the syntax and avoid the need to manually create a new
Promise. The `signAsync` function will return a promise that resolves with the encoded token or 
rejects with an error, making your code more concise and readable.

*/



