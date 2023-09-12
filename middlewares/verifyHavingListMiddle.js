const { ListModel }  = require("../models/index")

module.exports = async (req, res, next) => {
  const listDocumentDB = await ListModel.findByIdAndUserId(req.params.listId, req.userId);
  if(!listDocumentDB) throw new appError(
    'This List is not exist.',
    404, true, 'toastr'
  );
  req.listDocumentDB = listDocumentDB;
  next();
}