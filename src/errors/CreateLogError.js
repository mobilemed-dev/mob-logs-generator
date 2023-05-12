class CreateLogError extends Error {
  constructor(message) {
    super(message);
    this.name = "CreateLogError";
  }
}

module.exports = { CreateLogError };
