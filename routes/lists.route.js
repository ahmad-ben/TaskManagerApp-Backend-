const express = require('express');
const verifyJWTMiddle = require('../middlewares/verifyJWT.middle');
const { TaskModel, ListModel } = require('../models/index');
const Joi = require('joi');
const joiValidateMiddle = require('../middlewares/joiValidateMiddle');
const tryCatchWrapper = require('../utils/tryCatchWrapper');

const listsRoute = express.Router();

listsRoute.get('/', verifyJWTMiddle, 
  tryCatchWrapper( async (req, res) => {
    const lists = await ListModel.find({ _userId: req.userId });
    res.send(lists);
  })
)

listsRoute.post(
  '/', 
  [verifyJWTMiddle, joiValidateMiddle(validatePostListJoi, 'body')],
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
  [verifyJWTMiddle, joiValidateMiddle(validatePatchListJoi, 'req')],
  tryCatchWrapper( async (req, res) => {
    const _userId = req.userId;
    const _id = req.params.id;
    const title = req.body.title;

    const updatedList = await ListModel.findOneAndUpdate(
      { _userId, _id },
      { title },
      { new: true }
    );

    if(!updatedList) return new GeneralInvalidDataError('No list with the given data.');

    res.send(updatedList);
  })
)

listsRoute.delete(
  '/:id', 
  [verifyJWTMiddle, joiValidateMiddle(validateDeleteListJoi, 'params')], 
  tryCatchWrapper( async (req, res) => {
    await TaskModel.deleteMany({ _listId: req.params.id });

    const _userId = req.userId;
    const _id = req.params.id;

    const deletedDocument = await ListModel.findOneAndDelete(
      { _userId, _id },
      { new: true }
    );

    if(!deletedDocument) return new GeneralInvalidDataError('No list with the given data.');

    res.send(deletedDocument);
  })
);

function validatePostListJoi(comingData){
  const schema = Joi.object({
    title: Joi.string().min(1).max(50).required()
  })
  return schema.validate(comingData);
}

function validatePatchListJoi(comingData){
  const paramsSchema =  Joi.object().keys({
    id: Joi.objectId().required()
  })

  const bodySchema = Joi.object().keys({
    title: Joi.string().min(1).max(50).required(),
  })

  const schema = Joi.object({
    params: paramsSchema,
    body: bodySchema
  }).unknown(true);

  return schema.validate(comingData);
}

function validateDeleteListJoi(comingData){
  const schema =  Joi.object({
    id: Joi.objectId().required(),
  })
  return schema.validate(comingData);
}

module.exports = listsRoute;