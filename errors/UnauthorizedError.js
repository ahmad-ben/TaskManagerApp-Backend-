class UnauthorizedError extends Error{
  constructor(errorCode, message) {
    super(message);
    this.errorCode = errorCode;
  }
}