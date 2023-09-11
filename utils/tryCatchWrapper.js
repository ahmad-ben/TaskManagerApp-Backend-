module.exports = (mainAsyncOperation) => {
  return async (req, res, next) => {
    try { await mainAsyncOperation(req, res) } catch (ex) { next(ex) }
  }
}