const express = require('express');
const verifyJWTMiddle = require('../middlewares/verifyJWT.middle');
const { ListModel, TaskModel } = require('../models/index');
const Joi = require('joi');
const joiValidateMiddle = require('../middlewares/joiValidateMiddle');
const tryCatchWrapper = require('../utils/tryCatchWrapper');
const joiValidateParamsMiddle = require('../middlewares/joiValidateParamsMiddle');
const joiValidateBodyMiddle = require('../middlewares/joiValidateBodyMiddle');
const appError = require('../errors/appError');

const tasksRoute = express.Router({ mergeParams: true });

tasksRoute.get(
  '/', 
  [verifyJWTMiddle, joiValidateParamsMiddle(validateGetTasksParamsJoi)], 
  tryCatchWrapper( async (req, res) => {
    const listDocumentDB = await ListModel.findByIdAndUserId(req.params.listId, req.userId);

    if(!listDocumentDB) throw new appError(
      'This List is not exist.',
      404, true, 'toastr'
    );//=> LATER: Middleware With The First Line.

    const tasksList = await TaskModel.find({ _listId: listDocumentDB._id });
    res.send(tasksList);
  })
)

tasksRoute.get(
  '/:taskId',                               
  [verifyJWTMiddle, joiValidateParamsMiddle(validateGetTaskParamsJoi)], 
  tryCatchWrapper( async (req, res) => {
    const listDocumentDB = await ListModel.findByIdAndUserId(req.params.listId, req.userId);

    if(!listDocumentDB) throw new appError(
      'This List is not exist.',
      404, true, 'toastr'
    );//=> LATER: Middleware With The First Line.

    const oneTaskList = await TaskModel.findOne({
      _listId: listDocumentDB._id,
      _id: req.params.taskId,
    });

    if(!oneTaskList) throw new appError(
      'This Task is not exist.',
      404, true, 'toastr'
    );//=> LATER: Middleware With The First Line.
    // throw new GeneralInvalidDataError('This task is not exist.');
  
    res.send(oneTaskList);
  })

)

tasksRoute.post(
  '/', 
  [
    verifyJWTMiddle, 
    joiValidateParamsMiddle(validatePostTaskParamsJoi),
    joiValidateBodyMiddle(validatePostTaskBodyJoi),
  ],
  tryCatchWrapper(async (req, res) => {
    const listDocumentDB = await ListModel.findByIdAndUserId(req.params.listId, req.userId);

    if(!listDocumentDB) throw new appError(
      'This List is not exist.',
      404, true, 'toastr'
    );//=> LATER: Middleware With The First Line.

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
  ], 
  tryCatchWrapper(async (req, res) => {
    const listDocumentDB = await ListModel.findByIdAndUserId(req.params.listId, req.userId);

    if(!listDocumentDB) throw new appError(
      'This List is not exist.',
      404, true, 'toastr'
    );//=> LATER: Middleware With The First Line.

    const updatedTaskDocument = await TaskModel.findOneAndUpdate(
      { _id: req.params.taskId, _listId: listDocumentDB._id }, 
      req.body, 
      { new: true }
    );

    if(!listDocumentDB) throw new appError(
      'This Task is not exist.',
      404, true, 'toastr'
    );//=> LATER: Middleware With The First Line.

    res.send(updatedTaskDocument);
  })
)

tasksRoute.delete(
  '/:taskId', 
  [verifyJWTMiddle, joiValidateParamsMiddle(validateDeleteTaskParamsJoi)], 
  tryCatchWrapper(async (req, res) => {
    const listDocumentDB = await ListModel.findByIdAndUserId(req.params.listId, req.userId);

    if(!listDocumentDB) throw new appError(
      'This List is not exist.',
      404, true, 'toastr'
    );//=> LATER: Middleware With The First Line.

    const deletedTaskDocument = await TaskModel.findOneAndDelete({
      _id: req.params.taskId,
      _listId: listDocumentDB._id
    });

    if(!listDocumentDB) throw new appError(
      'This Task is not exist.',
      404, true, 'toastr'
    );//=> LATER: Middleware With The First Line.

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

function validatePatchTaskParamsJoi(paramsData){ //=> STOP: change this to params instead of coming and the others also...
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
