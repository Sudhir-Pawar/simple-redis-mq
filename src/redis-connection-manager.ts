import Redis, { RedisOptions } from "ioredis";
import EventEmitter from "node:events";

export class RedisConnectionManager extends EventEmitter {
  static port: number;
  static host: string;
  static redisOptions?: RedisOptions;
  static instance: RedisConnectionManager;
  private redisConnection: Redis;
  private constructor() {
    super();

    this.redisConnection = new Redis(
      RedisConnectionManager.port,
      RedisConnectionManager.host,
      RedisConnectionManager.redisOptions || {},
    );

    this.redisConnection.on("connect", function () {
      console.log("Redis connection established");
    });

    this.redisConnection.on("error", function (error) {
      console.log("Faield to establish connection with redis");
      console.error(error);
    });
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
    return this.redisConnection;
  }
  getWorkerConnection() {
    return this.redisConnection.duplicate();
  }
}
