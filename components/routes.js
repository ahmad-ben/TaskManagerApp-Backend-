const express = require('express');

const listsRoute = require('../routes/lists.route');
const tasksRoute = require('../routes/tasks.route');
const usersRoute = require('../routes/users.route');
// const testRoute = require('../routes/test.route');
const testRoute = require("../routes/test.route");

module.exports = (app) => {
  app.use('/lists', listsRoute);
  app.use('/lists/:listId/tasks', tasksRoute);
  app.use('/users', usersRoute);
  app.use('/test', testRoute);
}
