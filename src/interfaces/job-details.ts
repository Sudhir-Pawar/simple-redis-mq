import { JOB_STATUS } from "../enums/job-status";

export interface JobDetails {
  queueName: string;
  payload: string;
  status: JOB_STATUS;
  createdAt: number;
}
