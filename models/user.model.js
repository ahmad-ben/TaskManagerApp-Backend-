const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const appError = require('../errors/appError');
const { log } = require('console');

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
    
        const compareResult = await bcrypt.compare(password, userDocument.password);
    
        if (compareResult) return userDocument;
        throw new appError('Email or password are invalid.', 404, false, 'message');
    
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
                process.env.JWT_SECRET_KEY,
                { expiresIn: '15min' },  
                (err, encodedToken) => {
                  if(err) throw new appError('Generate access token failed.', 500, true, 'toastr', 1);
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
  return ((Date.now()/ 1000) + secondsUntilExpire)
}

const UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;