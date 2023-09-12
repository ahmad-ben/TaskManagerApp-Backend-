const express = require('express');
const verifyRefreshToken = require('../middlewares/verifyRefreshTokenMiddle');
const { UserModel } = require('../models');
const Joi = require('joi');
const tryCatchWrapper = require('../utils/tryCatchWrapper');
const joiValidateBodyMiddle = require('../middlewares/joiValidateBodyMiddle');

const usersRoute = express.Router();

usersRoute.post(
  '/signUp',  
  joiValidateBodyMiddle(validatePostSingUpBodyUser),
  tryCatchWrapper(async (req, res) => {
    console.log('1- sign Up works');
    const newUserDocument = new UserModel(req.body);

    const userDocumentFromDB = await newUserDocument.save();

    const refreshToken = await newUserDocument.createSession();

    const JWTAccessToken = await newUserDocument.generateAccessAuthToken();

    console.log('2- sign Up works');
    res.set({
      "X-refresh-token": refreshToken, 
      "X-access-token": JWTAccessToken
    }).send(userDocumentFromDB); 

  })
)

usersRoute.post(
  '/signIn', 
  joiValidateBodyMiddle(validatePostSingInBodyUser),
  tryCatchWrapper(async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    const userDocumentFromDB = await UserModel.findByCredentials(email, password);

    const refreshToken = await userDocumentFromDB.createSession();

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
    console.log('getNewAccessToken works.');
    const JWTToken = await req.userDocumentObj.generateAccessAuthToken();
    res.header('X-access-token', JWTToken).send({ JWTToken });
  })
);

function validatePostSingUpBodyUser(bodyData){
  const bodySchema = Joi.object({
    email: Joi.string().email().min(10).max(255).required(),
    password: Joi.string().min(6).max(20).required(),
  });

  return bodySchema.validate(bodyData);
}

function validatePostSingInBodyUser(bodyData){
  const bodySchema = Joi.object({
    email: Joi.string().email().min(10).max(255).required(),
    password: Joi.string().min(6).max(20).required(),
  });

  return bodySchema.validate(bodyData);
}

module.exports = usersRoute;

//=> Check the unnecessary imports and remove.