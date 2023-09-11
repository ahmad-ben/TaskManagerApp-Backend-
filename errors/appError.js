module.exports = class appError extends Error{
  constructor(message, statusCode, shouldNavigate, clientMessageShape, retry) {
    super(message);
    this.statusCode = statusCode;
    this.shouldNavigate = shouldNavigate;
    this.clientMessageShape = clientMessageShape;
    this.retry = retry;
  }
}