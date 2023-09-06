const express = require('express');
const verifyJWTMiddle = require('../middlewares/verifyJWT.middle');
const { ListModel, TaskModel } = require('../models/index');
const Joi = require('joi');
const joiValidateMiddle = require('../middlewares/joiValidateMiddle');
const tryCatchWrapper = require('../utils/tryCatchWrapper');

const tasksRoute = express.Router({ mergeParams: true });

tasksRoute.get(
  '/', 
  [verifyJWTMiddle, joiValidateMiddle(validateGetTasksJoi, 'params')], 
  tryCatchWrapper( async (req, res) => {
    const listDocumentDB = await ListModel.findByIdAndUserId(req.params.listId, req.userId);

    if(!listDocumentDB) return new GeneralInvalidDataError('This list is not yours or does not exist.');

    const tasksList = await TaskModel.find({ _listId: listDocumentDB._id });
    res.send(tasksList);
  })
)

tasksRoute.get(
  '/:taskId', 
  [verifyJWTMiddle, joiValidateMiddle(validateGetTaskJoi, 'params')], 
  tryCatchWrapper( async (req, res) => {
    const listDocumentDB = await ListModel.findByIdAndUserId(req.params.listId, req.userId);

    if(!listDocumentDB) return new GeneralInvalidDataError('This list is not yours or does not exist.');

    const oneTaskList = await TaskModel.findOne({
      _listId: listDocumentDB._id,
      _id: req.params.taskId,
    });

    if(!oneTaskList) return new GeneralInvalidDataError('This task is not yours or does not exist.');
  
    res.send(oneTaskList);
  })

)

tasksRoute.post(
  '/', 
  [verifyJWTMiddle, joiValidateMiddle(validatePostTaskJoi, 'req')],
  tryCatchWrapper(async (req, res) => {
    const listDocumentDB = await ListModel.findByIdAndUserId(req.params.listId, req.userId);

    if(!listDocumentDB) return new GeneralInvalidDataError('This list is not yours or does not exist.');//=> LATER: Middleware With The First Line.

    const newTask = await TaskModel({
      title: req.body.title,
      _listId: listDocumentDB._id,
    })

    await newTask.save();
    res.send(newTask);
  })
)

tasksRoute.patch(
  '/:taskId', 
  [verifyJWTMiddle, joiValidateMiddle(validatePatchTaskJoi, 'req')], 
  tryCatchWrapper(async (req, res) => {
    const listDocumentDB = await ListModel.findByIdAndUserId(req.params.listId, req.userId);

    if(!listDocumentDB) return new GeneralInvalidDataError('This list is not yours or does not exist.');

    const updatedTaskDocument = await TaskModel.findOneAndUpdate(
      { _id: req.params.taskId, _listId: listDocumentDB._id }, 
      req.body, 
      { new: true }
    );

    if(!updatedTaskDocument) return new GeneralInvalidDataError('This task is not yours or does not exist.');

    res.send(updatedTaskDocument);
  })
)

tasksRoute.delete(
  '/:taskId', 
  [verifyJWTMiddle, joiValidateMiddle(validateDeleteTaskJoi, 'params')], 
  tryCatchWrapper(async (req, res) => {
    const listDocumentDB = await ListModel.findByIdAndUserId(req.params.listId, req.userId);

    if(!listDocumentDB) return new GeneralInvalidDataError('This list is not yours or does not exist.');

    const deletedTaskDocument = await TaskModel.findOneAndDelete({
      _id: req.params.taskId,
      _listId: listDocumentDB._id
    });

    if(!deletedTaskDocument) return new GeneralInvalidDataError('This task is not yours or does not exist.');

    res.send(deletedTaskDocument);
  })
)

function validateGetTasksJoi(comingData){
  const schema =  Joi.object({
    listId: Joi.objectId().required(),
  })
  return schema.validate(comingData);
}

function validateGetTaskJoi(comingData){
  const schema =  Joi.object({
    listId: Joi.objectId().required(),
    taskId: Joi.objectId().required(),
  })
  return schema.validate(comingData);
}

function validatePostTaskJoi(comingData){
  const paramsSchema = Joi.object().keys({
    listId: Joi.objectId().required()
  });

  const bodySchema = Joi.object().keys({
    title:  Joi.string().min(1).max(50).required()
  });

  const schema =  Joi.object({
    params: paramsSchema,
    body: bodySchema,
  }).unknown(true);

  return schema.validate(comingData);
}

function validatePatchTaskJoi(comingData){
  const paramsSchema = Joi.object().keys({
    listId: Joi.objectId().required(),
    taskId: Joi.objectId().required()
  });

  const bodySchema = Joi.object().keys({
    title:  Joi.string().min(1).max(50),
    completed: Joi.boolean()
  }).or('title', 'completed');

  const schema =  Joi.object({
    params: paramsSchema,
    body: bodySchema,
  }).unknown(true);

  return schema.validate(comingData);
}

function validateDeleteTaskJoi(comingData){
  const schema =  Joi.object({
    listId: Joi.objectId().required(),
    taskId: Joi.objectId().required()
  })
  return schema.validate(comingData);
}

module.exports = tasksRoute;
