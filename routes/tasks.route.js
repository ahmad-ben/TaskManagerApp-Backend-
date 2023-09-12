const express = require('express');
const verifyJWTMiddle = require('../middlewares/verifyJWT.middle');
const { ListModel, TaskModel } = require('../models/index');
const Joi = require('joi');
const tryCatchWrapper = require('../utils/tryCatchWrapper');
const joiValidateParamsMiddle = require('../middlewares/joiValidateParamsMiddle');
const joiValidateBodyMiddle = require('../middlewares/joiValidateBodyMiddle');
const appError = require('../errors/appError');
const verifyHavingListMiddle = require('../middlewares/verifyHavingListMiddle');

const tasksRoute = express.Router({ mergeParams: true });

tasksRoute.get(
  '/', 
  [
    verifyJWTMiddle, 
    joiValidateParamsMiddle(validateGetTasksParamsJoi),
    verifyHavingListMiddle
  ], 
  tryCatchWrapper( async (req, res) => {
    const tasksList = await TaskModel.find({ _listId: req.listDocumentDB._id });
    res.send(tasksList);
  })
)

tasksRoute.get(
  '/:taskId',                               
  [
    verifyJWTMiddle, 
    joiValidateParamsMiddle(validateGetTaskParamsJoi),
    verifyHavingListMiddle
  ], 
  tryCatchWrapper( async (req, res) => {
    const oneTaskList = await TaskModel.findOne({
      _listId: listDocumentDB._id,
      _id: req.params.taskId,
    });

    if(!oneTaskList) throw new appError(
      'This Task is not exist.',
      404, true, 'toastr'
    );// throw new GeneralInvalidDataError('This task is not exist.');
  
    res.send(oneTaskList);
  })

)

tasksRoute.post(
  '/', 
  [
    verifyJWTMiddle, 
    joiValidateParamsMiddle(validatePostTaskParamsJoi),
    joiValidateBodyMiddle(validatePostTaskBodyJoi),
    verifyHavingListMiddle
  ],
  tryCatchWrapper(async (req, res) => {
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
  [
    verifyJWTMiddle, 
    joiValidateParamsMiddle(validatePatchTaskParamsJoi),
    joiValidateBodyMiddle(validatePatchTaskBodyJoi),
    verifyHavingListMiddle
  ], 
  tryCatchWrapper(async (req, res) => {
    const updatedTaskDocument = await TaskModel.findOneAndUpdate(
      { _id: req.params.taskId, _listId: listDocumentDB._id }, 
      req.body, 
      { new: true }
    );

    if(!updatedTaskDocument) throw new appError(
      'This Task is not exist.',
      404, true, 'toastr'
    );

    res.send(updatedTaskDocument);
  })
)

tasksRoute.delete(
  '/:taskId', 
  [
    verifyJWTMiddle, 
    joiValidateParamsMiddle(validateDeleteTaskParamsJoi),
    verifyHavingListMiddle
  ], 
  tryCatchWrapper(async (req, res) => {
    const deletedTaskDocument = await TaskModel.findOneAndDelete({
      _id: req.params.taskId,
      _listId: listDocumentDB._id
    });

    if(!deletedTaskDocument) throw new appError(
      'This Task is not exist.',
      404, true, 'toastr'
    );

    res.send(deletedTaskDocument);
  })
)

function validateGetTasksParamsJoi(paramsData){
  const paramsSchema =  Joi.object({
    listId: Joi.objectId().required(),
  })
  return paramsSchema.validate(paramsData);
}

function validateGetTaskParamsJoi(paramsData){
  const paramsSchema =  Joi.object({
    listId: Joi.objectId().required(),
    taskId: Joi.objectId().required(),
  })
  return paramsSchema.validate(paramsData);
}

function validatePostTaskParamsJoi(paramsData){
  const paramsSchema =  Joi.object({
    listId: Joi.objectId().required()
  });

  return paramsSchema.validate(paramsData);
}

function validatePostTaskBodyJoi(bodyData){
  const bodySchema =  Joi.object({
    title:  Joi.string().min(1).max(50).required()
  });

  return bodySchema.validate(bodyData);
}

/* => IMPO: Merge Two Validation Logic
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
*/

function validatePatchTaskParamsJoi(paramsData){
  const paramsSchema =  Joi.object({
    listId: Joi.objectId().required(),
    taskId: Joi.objectId().required()
  });

  return paramsSchema.validate(paramsData);
}

function validatePatchTaskBodyJoi(bodyData){
  const bodySchema =  Joi.object({
    title:  Joi.string().min(1).max(50),
    completed: Joi.boolean()
  }).or('title', 'completed');

  return bodySchema.validate(bodyData);
}

function validateDeleteTaskParamsJoi(paramsData){
  const paramsSchema =  Joi.object({
    listId: Joi.objectId().required(),
    taskId: Joi.objectId().required()
  })
  return paramsSchema.validate(paramsData);
}

module.exports = tasksRoute;
