"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
//singleton initialization for Redis
class RedisClient {
    constructor() { }
    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new ioredis_1.default({
                host: 'redis-16362.c330.asia-south1-1.gce.redns.redis-cloud.com',
                port: 16362,
                username: 'default',
                password: 'EgLtrfIL6xDkTnvzhRzHqcyhaDA24KsE',
            });
            console.log("Singleton Instance: the redis cleint has been initialized");
        }
        return RedisClient.instance;
    }
}
RedisClient.instance = null;
exports.default = RedisClient;
