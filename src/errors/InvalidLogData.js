class InvalidLogData extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidLogData";
  }
}

module.exports = { InvalidLogData };
