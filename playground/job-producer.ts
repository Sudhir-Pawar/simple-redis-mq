import { RedisConnectionManager, JobQueue } from "../index.ts";

const redisConnectionManager = RedisConnectionManager.getInstance(
  6379,
  "127.0.0.1",
);

const redisConnection = redisConnectionManager.getRedisConnection();

redisConnection.on("connect", function () {
  const queueName = "sms";
  const smsQueue = new JobQueue(queueName, redisConnectionManager);

  smsQueue.add({ message: "Your otp for Amazon is 848347", userId: 92783 });
  smsQueue.add({ message: "Your otp for Amazon is 972827", userId: 12382 });
});
