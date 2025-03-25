import { createClient } from 'redis';

export const redisClient = createClient({
  socket: {
    host: 'redis',
    port: 6379,
  },
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));

async function connectRedis() {
  try {
    await redisClient.connect();
    console.log('🚀 Redis conectado con éxito');
  } catch (error) {
    console.error('❌ Error al conectar con Redis:', error);
  }
}

connectRedis();

export const clearSpecificRedis = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('❌ Error al limpiar Redis con clave:', key, error);
  }
};

export const clearRedis = async (pattern: string): Promise<void> => {
  try {
    const keys = await redisClient.keys(`${pattern}:*`);
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redisClient.del(key)));
    }
  } catch (error) {
    console.error('❌ Error al limpiar Redis con patrón:', pattern, error);
  }
};

export const clearAllRedis = async (): Promise<void> => {
  try {
    await redisClient.flushDb();
  } catch (error) {
    console.error('❌ Error al limpiar toda la base de datos Redis:', error);
  }
};

export const getRedisCache = async <T>(cacheKey: string): Promise<T | null> => {
  try {
    const reply = await redisClient.get(cacheKey);
    return reply ? (JSON.parse(reply) as T) : null;
  } catch (error) {
    console.error(`❌ Error al obtener clave ${cacheKey} de Redis:`, error);
    return null;
  }
};

export const setRedisCache = async <T>(
  cacheKey: string,
  value: T,
  expirationInSeconds?: number,
): Promise<void> => {
  try {
    const serializedValue = JSON.stringify(value);
    if (expirationInSeconds) {
      await redisClient.set(cacheKey, serializedValue, {
        EX: expirationInSeconds,
      });
    } else {
      await redisClient.set(cacheKey, serializedValue);
    }
  } catch (error) {
    console.error(`❌ Error al establecer clave ${cacheKey} en Redis:`, error);
  }
};
