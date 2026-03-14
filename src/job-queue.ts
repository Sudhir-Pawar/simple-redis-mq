import { Job } from "./job";
import { RedisConnectionManager } from "./redis-connection-manager";
import { JobRepository } from "./repository/job-repository";

export class JobQueue {
  private queueName: string;
  private redisConManager: RedisConnectionManager;
  private jobRepository: JobRepository;
  constructor(
    queueName: string,
    redisConnectionManager: RedisConnectionManager,
  ) {
    this.queueName = queueName;
    this.redisConManager = redisConnectionManager;
    this.jobRepository = new JobRepository(
      this.queueName,
      this.redisConManager.getRedisConnection(),
    );
  }

  async add(payload: Object): Promise<string> {
    const job = new Job(this.queueName, payload);

    await this.jobRepository.setJobInHash(job.id, job.getJobDetails());
    await this.jobRepository.pushJobToQueue(job.id);
    return job.id;
  }
}
