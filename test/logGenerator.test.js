// create test for LogGenerator class

const { LogGenerator } = require("../src/class");
const {
  CreateLogError,
  InvalidLogData,
  ConfigurationError,
} = require("../src/errors");
//create a mock for SQSClient sdk v3 using jest mock

jest.mock("@aws-sdk/client-sqs", () => {
  return {
    SQSClient: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockImplementation((data) => {
        if(!data.MessageBody) throw new Error("Invalid message body");

        return {
          MessageId: "1234567890",
        };
      }),
    })),
    SendMessageCommand: jest.fn().mockImplementation((data) => data),
  };
});

describe("Tests for LogGenerator class", () => {
  test("Should throw an error if region is not provided", () => {
    expect(() => {
      new LogGenerator({});
    }).toThrow("Region is required");
  });

  test("Should throw an error if queueUrl is not provided", () => {
    expect(() => {
      new LogGenerator({ region: "us-east-1" });
    }).toThrow("queueUrl is required");
  });

  test("Should create a new instance of LogGenerator", () => {
    const logGenerator = new LogGenerator({
      region: "us-east-1",
      queueUrl: "https://sqs.us-east-1.amazonaws.com/123456789012/queue-name",
    });

    expect(logGenerator).toBeInstanceOf(LogGenerator);
  });

  test("Should throw an error if SQS fails to send message", async () => {
    const logGenerator = new LogGenerator({
      region: "us-east-1",
      queueUrl: "https://sqs.us-east-1.amazonaws.com/123456789012/queue-name",
    });

    await expect(logGenerator.addLog({})).rejects.toThrow(InvalidLogData);
  });

  test("Should return true if SQS sends message", async () => {
    const logGenerator = new LogGenerator({
      region: "us-east-1",
      queueUrl: "https://sqs.us-east-1.amazonaws.com/123456789012/queue-name",
    });

    const result = await logGenerator.addLog({
      data: {},
      action: "create",
      ip: "1.1.1.1",
      requesterApplication: "test",
      requesterApi: "test",
      userId: "123456",
      entityName: "User",
      entityId: "654321",
    });

    expect(result).toBe(true);
  });
});
