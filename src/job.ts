import { JOB_STATUS } from "./enums/job-status";
import { JobDetails } from "./interfaces/job-details";
import { UUID } from "./utils/uuid";

export class Job {
  private _id: string;
  private _queueName: string;
  private _payload: string;
  private _status: JOB_STATUS;
  private _createdAt: number;

  constructor(queueName: string, payload: Object) {
    this._id = UUID.getUniqueId();
    this._queueName = queueName;
    this._payload = JSON.stringify(payload);
    this._status = JOB_STATUS.WAIT;
    this._createdAt = Date.now();
  }

  get id() {
    return this._id;
  }
  get queueName() {
    return this._queueName;
  }
  get payload() {
    return this._payload;
  }
  get status() {
    return this._status;
  }
  get createdAt() {
    return this._createdAt;
  }
  getJobDetails(): JobDetails {
    return {
      queueName: this._queueName,
      payload: this._payload,
      status: this._status,
      createdAt: this._createdAt,
    };
  }
}
