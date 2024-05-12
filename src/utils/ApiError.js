class ApiError extends Error {
  constructor(status, message = "somethin went wrong", error = []) {
    super(message);
    this.message = message;
    this.status = status;
    this.error = error;
  }
}

export default ApiError;
