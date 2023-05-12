const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const {
  CreateLogError,
  ConfigurationError,
  InvalidLogData,
} = require("../errors");

class LogGenerator {
  #sqs = null;
  #queueUrl = "";

  constructor({ region, accessKey, secretKey, queueUrl }) {
    if (!region) throw new ConfigurationError("Region is required");
    if (!queueUrl) throw new ConfigurationError("queueUrl is required");

    this.#sqs = new SQSClient({
      region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });

    this.#queueUrl = queueUrl;
  }

  async addLog({
    data,
    action,
    ip,
    requesterApplication,
    requesterApi,
    entityName,
    userId,
    entityId,
  }) {
    try {
      if (!data) throw new InvalidLogData("Data is required");
      if (!action) throw new InvalidLogData("Action is required");
      if (!ip) throw new InvalidLogData("IP is required");
      if (!requesterApplication)
        throw new InvalidLogData("Requester Application is required");
      if (!requesterApi) throw new InvalidLogData("Requester API is required");
      if (!entityName) throw new InvalidLogData("Entity Name is required");
      if (!userId) throw new InvalidLogData("User ID is required");
      if (!entityId) throw new InvalidLogData("Entity ID is required");

      await this.#sqs.send(
        new SendMessageCommand({
          QueueUrl: this.#queueUrl,
          MessageBody: JSON.stringify({
            data,
            action,
            ip,
            requesterApplication,
            requesterApi,
            userId,
            entityName,
            entityId,
          }),
          MessageGroupId: `${entityName}-Log`,
          MessageDeduplicationId: `${entityName}-${entityId}-${action}-${Date.now()}`,
        })
      );

      return true;
    } catch (error) {
      if (error instanceof InvalidLogData) throw error;
      throw new CreateLogError(error.message);
    }
  }
}

module.exports = { LogGenerator };
