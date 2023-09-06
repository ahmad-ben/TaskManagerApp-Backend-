const express = require('express');
const verifyRefreshToken = require('../middlewares/verifyRefreshToken');
const { UserModel } = require('../models');
const Joi = require('joi');
const joiValidateMiddle = require('../middlewares/joiValidateMiddle');
const tryCatchWrapper = require('../utils/tryCatchWrapper');

const usersRoute = express.Router();

usersRoute.post(
  '/signUp',  
  joiValidateMiddle(validatePostSingUpUser, 'body'),
  tryCatchWrapper(async (req, res) => {
    const newUserDocument = new UserModel(req.body);

    const userDocumentFromDB = await newUserDocument.save();

    const refreshToken = await newUserDocument.createSession();

    const JWTAccessToken = await newUserDocument.generateAccessAuthToken();

    res.set({
      "X-refresh-token": refreshToken, 
      "X-access-token": JWTAccessToken
    }).send(userDocumentFromDB); 

  })
)

usersRoute.post(
  '/signIn', 
  joiValidateMiddle(validatePostSingInUser, 'body'),
  tryCatchWrapper(async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    const userDocumentFromDB = await UserModel.findByCredentials(email, password);
    if(!userDocumentFromDB) return new GeneralInvalidDataError('User not found, sign up first!.');

    const refreshToken = await userDocumentFromDB.createSession(); //=> LATER: Check This Should Be Here Or Not??

    const JWTAccessToken = await userDocumentFromDB.generateAccessAuthToken();

    res.set({
      "X-refresh-token": refreshToken, 
      "X-access-token": JWTAccessToken
    }).send(userDocumentFromDB); 

  })

)

usersRoute.get(
  '/getNewAccessToken', 
  verifyRefreshToken, 
  tryCatchWrapper(async (req, res) => {
    const JWTToken = await req.userDocumentObj.generateAccessAuthToken();
    res.header('X-access-token', JWTToken).send({ JWTToken });
  })
);

function validatePostSingUpUser(comingData){
  const schema = Joi.object({
    email: Joi.string().email().min(10).max(255).required(),
    password: Joi.string().min(6).max(20).required(),
  });

  return schema.validate(comingData);
}

function validatePostSingInUser(comingData){
  const schema = Joi.object({
    email: Joi.string().email().min(10).max(255).required(),
    password: Joi.string().min(6).max(20).required(),
  });

  return schema.validate(comingData);
}

module.exports = usersRoute;