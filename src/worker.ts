import { EventEmitter } from "node:events";
import { RedisConnectionManager } from "./redis-connection-manager";
import { JOB_STATUS } from "./enums/job-status";
import { JobRepository } from "./repository/job-repository";

interface WorkerEvents {
  active: [jobId: string];
  completed: [jobId: string, returnMessage: string];
  failed: [jobId: string | null, error: Error];
  stalled: [jobId: string];
}

export class Worker extends EventEmitter<WorkerEvents> {
  private queueName: string;
  private redisConManager: RedisConnectionManager;
  private jobRepository: JobRepository;

  private handlerFunction: Function;
  private isRunning = false;

  constructor(
    queueName: string,
    redisConnectionManager: RedisConnectionManager,
    handlerFunction: Function,
  ) {
    super();
    this.queueName = queueName;
    this.redisConManager = redisConnectionManager;
    this.handlerFunction = handlerFunction;
    this.jobRepository = new JobRepository(
      this.queueName,
      this.redisConManager.getWorkerConnection(),
    );
  }

  async startListerner() {
    this.isRunning = true;

    while (this.isRunning == true) {
      let jobId: string | null = null;
      try {
        jobId = await this.jobRepository.waitForNextJob();

        if (jobId) {
          await this.jobRepository.updateJobStatus(jobId, JOB_STATUS.ACTIVE);
          this.emit("active", jobId);

          const job = await this.jobRepository.getJobById(jobId);
          const functionData = {
            jobId: jobId,
            data: JSON.parse(job.payload),
          };
          const functionResult = await this.handlerFunction(functionData);
          await this.jobRepository.removeJobFromQueue(jobId);
          await this.jobRepository.updateJobStatus(jobId, JOB_STATUS.COMPLETED);

          this.emit("completed", jobId, functionResult);
        }
      } catch (error) {
        if (jobId) {
          await this.jobRepository.updateJobStatus(jobId, JOB_STATUS.FAILED);
          await this.jobRepository.removeJobFromQueue(jobId);
          this.emit("failed", jobId, error);
        } else {
          const timeInMS = 1000;
          this.emit("failed", null, error);
          await delay(timeInMS);
        }
      }
    }

    async function delay(timeInMS: number) {
      await new Promise((resolve) => setTimeout(resolve, timeInMS));
    }
  }
}
