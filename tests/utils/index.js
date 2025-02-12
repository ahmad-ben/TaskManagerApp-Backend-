const  registerAUser = require("./registerAUser");
const  addAUserList = require("./addAUserList");
const  generateFakeJWT = require("./generateFakeJWT");
const  deleteDBData = require("./deleteDBData");
const  addTask = require("./addTask");

module.exports = {
  generateFakeJWT, 
  registerAUser, 
  addAUserList,
  addTask,
  deleteDBData
};