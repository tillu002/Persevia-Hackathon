import Redis from 'ioredis';

//singleton initialization for Redis
class RedisClient {
    private static instance: Redis | null = null;

    private constructor() { }

    public static getInstance(): Redis {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis({
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

export default RedisClient;
