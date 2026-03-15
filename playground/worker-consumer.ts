import { RedisConnectionManager, Worker } from "../index.ts";

const redisConnectionManager = RedisConnectionManager.getInstance(
  6379,
  "127.0.0.1",
);

const redisConnection = redisConnectionManager.getRedisConnection();
redisConnection.on("connect", function () {
  const queueName = "sms";

  const smsWorker = new Worker(queueName, redisConnectionManager, function (
    payload,
  ) {
    console.log("---Message received---");
    console.log("Message payload: ", payload);
    console.log("Consumed message returning succes");
    return "Success";
  });

  smsWorker.on("active", function (jobId) {
    console.log("Message move to active queue: ", jobId);
  });

  smsWorker.on("completed", function (jobId, returnMsg) {
    console.log(
      "Message completed processing: ",
      jobId,
      " return message:",
      returnMsg,
    );
  });

  smsWorker.on("failed", function (jobId, error) {
    console.log("Failed processing: ", jobId, error);
  });

  smsWorker.startListerner();
});
