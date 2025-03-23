import { createClient } from 'redis';

export const redisClient = createClient();

redisClient.on('error', (err) => console.error('Redis Client Error', err));

async function connectRedis() {
  await redisClient.connect();
  console.log('🚀 Redis conectado');
}

connectRedis();

export const clearRedis = async (pattern: string) => {
  const keys = await redisClient.keys(`${pattern}:*`);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

export const clearAllRedis = async () => {
  await redisClient.flushDb();
};

export const getRedisCache = async <T>(cacheKey: string): Promise<T | null> => {
  const reply = await redisClient.get(cacheKey);
  if (reply) {
    const result: T = JSON.parse(reply);
    return result;
  }
  return null;
};

export const setRedisCache = async <T>(cacheKey: string, value: T) => {
  await redisClient.set(cacheKey, JSON.stringify(value));
};
