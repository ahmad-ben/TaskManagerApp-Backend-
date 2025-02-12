const { TaskModel } = require("../../models");

const addTask = async (listId) => {
  const task = new TaskModel({title: "Task 1 title.",_listId: listId})
  return await task.save();
};

module.exports = addTask;