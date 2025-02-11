const { ListModel }  = require("../models/index");
const appError = require("../errors/appError");

module.exports = async (req, res, next) => {
  const listDocumentDB = await ListModel.findByIdAndUserId(req.params.listId, req.userId);

  // console.log("HERE", listDocumentDB);
  

  if (!listDocumentDB) 
    return next(new appError('This List does not exist.', 404, true, 'toastr'));

  req.listDocumentDB = listDocumentDB;
  next();
}