const express = require('express');

const listsRoute = require('../routes/lists.route');
const tasksRoute = require('../routes/tasks.route');
const usersRoute = require('../routes/users.route');

module.exports = (app) => {
  app.use('/lists', listsRoute);
  app.use('/lists/:listId/tasks', tasksRoute);
  app.use('/users', usersRoute);
}

/* 

i have this code in my route.js:
app.use('/lists/:listId/tasks', tasksRoute);

and in my tasks.route.js i want to use the :listId's value like:
  console.log('Search result:', req.params.listId );

but it does work

this is the whole function in tasks.route.js:

tasksRoute.get('/', verifyJWTMiddle, async (req, res) => {

    const listDocumentDB = await ListModel.findByIdAndUserId(req.params.listId, req.userId);

    console.log('Search result:', req.params.listId );

    if(!listDocumentDB) return res.status(404).send('This list is not yours or does not exist.');
  
    const tasksList = await TaskModel.find({ _listId: listDocumentDB._id });
    res.send(tasksList);

})

*/
