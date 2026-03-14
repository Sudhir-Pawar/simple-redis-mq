import Redis, { RedisOptions } from "ioredis";
import EventEmitter from "node:events";

export class RedisConnectionManager extends EventEmitter {
  static port: number;
  static host: string;
  static redisOptions?: RedisOptions;
  static instance: RedisConnectionManager;
  private redisInstance: Redis;
  private constructor() {
    super();

    this.redisInstance = new Redis(
      RedisConnectionManager.port,
      RedisConnectionManager.host,
      RedisConnectionManager.redisOptions || {},
    );
  }

  public static getInstance(
    port?: number,
    host?: string,
    redisOptions?: RedisOptions,
  ) {
    if (!this.instance) {
      if (!port || !host) {
        throw new Error("Port and host is required for redis connection");
      }
      this.port = port;
      this.host = host;
      this.redisOptions = redisOptions;
      this.instance = new RedisConnectionManager();
      return this.instance;
    }
    return this.instance;
  }

  getRedisConnection() {
    return this.redisInstance;
  }
  getWorkerConnection() {
    return this.redisInstance.duplicate();
  }
}
