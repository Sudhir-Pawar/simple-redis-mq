import Redis from "ioredis";
import { JOB_STATUS } from "../enums/job-status";
import { Job } from "../job";
import { JobDetails } from "../interfaces/job-details";

export class JobRepository {
  private queueName: string;
  private redisInstance: Redis;
  constructor(queueName: string, redisInstance: Redis) {
    this.queueName = queueName;
    this.redisInstance = redisInstance;
  }

  getActiveQueueName(): string {
    return `queue:${this.queueName}:active`;
  }

  getWaitQueueName(): string {
    return `queue:${this.queueName}:wait`;
  }

  getJobId(jobId: string): string {
    return `job:${jobId}`;
  }

  async waitForNextJob(): Promise<string | null> {
    const timeout = 0;
    return await this.redisInstance.blmove(
      this.getWaitQueueName(),
      this.getActiveQueueName(),
      "RIGHT",
      "LEFT",
      timeout,
    );
  }

  async updateJobStatus(jobId: string, jobStatus: JOB_STATUS): Promise<number> {
    return await this.redisInstance.hset(
      this.getJobId(jobId),
      "status",
      jobStatus,
    );
  }

  async getJobById(jobId: string): Promise<any> {
    return await this.redisInstance.hgetall(this.getJobId(jobId));
  }

  async removeJobFromQueue(jobId: string): Promise<number> {
    const jobCount = 1;
    return await this.redisInstance.lrem(
      this.getActiveQueueName(),
      jobCount,
      jobId,
    );
  }

  async pushJobToQueue(jobId: string): Promise<number> {
    return await this.redisInstance.lpush(this.getWaitQueueName(), jobId);
  }

  async setJobInHash(jobId: string, job: JobDetails): Promise<number> {
    return await this.redisInstance.hset(this.getJobId(jobId), job);
  }
}
