module.exports = (mainAsyncOperation) => {
  return async (res, req, next) => {
    try { await mainAsyncOperation(req, res) } catch (ex) { next(ex) }
  }
}