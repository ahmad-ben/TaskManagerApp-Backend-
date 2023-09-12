const express = require('express');
const verifyJWTMiddle = require('../middlewares/verifyJWT.middle');
const { TaskModel, ListModel } = require('../models/index');
const Joi = require('joi');
const tryCatchWrapper = require('../utils/tryCatchWrapper');
const joiValidateBodyMiddle = require('../middlewares/joiValidateBodyMiddle');
const joiValidateParamsMiddle = require('../middlewares/joiValidateParamsMiddle');
const appError = require('../errors/appError');

const listsRoute = express.Router();

listsRoute.get('/', verifyJWTMiddle, 
  tryCatchWrapper( async (req, res) => {
      const lists = await ListModel.find({ _userId: req.userId });
      res.send(lists);

  })
)

listsRoute.post(
  '/', 
  [verifyJWTMiddle, joiValidateBodyMiddle(validatePostListBodyJoi)],
  tryCatchWrapper( async (req, res) => {
    const title = req.body.title;
    const _userId = req.userId;
    const listDocument = new ListModel({ title, _userId });

    await listDocument.save();
    res.send(listDocument);
  })
)

listsRoute.patch(
  '/:id', 
  [
    verifyJWTMiddle, 
    joiValidateParamsMiddle(validatePatchListParamsJoi),
    joiValidateBodyMiddle(validatePatchListBodyJoi),
  ],
  tryCatchWrapper( async (req, res) => {
    const _userId = req.userId;
    const _id = req.params.id;
    const title = req.body.title;

    const updatedList = await ListModel.findOneAndUpdate(
      { _userId, _id },
      { title },
      { new: true }
    );

    if(!updatedList) throw new appError('This list is not exist.', 404, true, 'toastr');

    res.send(updatedList);
  })
)

listsRoute.delete(
  '/:id', 
  [
    verifyJWTMiddle, 
    joiValidateParamsMiddle(validateDeleteListParamsJoi)
  ], 
  tryCatchWrapper( async (req, res) => {
    await TaskModel.deleteMany({ _listId: req.params.id });

    const _userId = req.userId;
    const _id = req.params.id;

    const deletedDocument = await ListModel.findOneAndDelete(
      { _userId, _id },
      { new: true }
    );

    if(!deletedDocument) throw new appError('This list is not exist.', 404, true, 'toastr');

    res.send(deletedDocument);
  })
);

function validatePostListBodyJoi(bodyData){
  const bodySchema = Joi.object({
    title: Joi.string().min(1).max(50).required()
  })
  return bodySchema.validate(bodyData);
}

function validatePatchListBodyJoi(bodyData){
  const bodySchema = Joi.object({
    title: Joi.string().min(1).max(50).required(),
  });

  return bodySchema.validate(bodyData);
}

function validatePatchListParamsJoi(paramsData){
  const paramsSchema = Joi.object({
    id: Joi.objectId().required()
  });

  return paramsSchema.validate(paramsData);
}

function validateDeleteListParamsJoi(paramsData){
  const paramsSchema =  Joi.object({
    id: Joi.objectId().required(),
  })
  return paramsSchema.validate(paramsData);
}

module.exports = listsRoute;


