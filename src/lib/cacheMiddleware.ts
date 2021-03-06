import { Prisma } from '@app/generated/centralLedger';

interface Cache {
  setValue: (key: string, value: object) => void;
  getValue: (key: string) => object | undefined;
}

type CacheMiddlewareOptions = {
  actions: Prisma.PrismaAction[];
  keys?: string[];
  cache: Cache;
};

const cacheMiddleware =
  ({ actions, keys, cache }: CacheMiddlewareOptions): Prisma.Middleware =>
  async (params, next) => {
    if (!actions.includes(params.action)) {
      return next(params);
    }

    // Return early if caching should only happen when specific keys are selected
    // but the current query does not include all of them
    if (keys) {
      const selectedKeys = Object.keys(params.args.select);
      const match = selectedKeys.every((key) => keys.includes(key));

      if (!match) {
        return next(params);
      }
    }

    let result;
    const key = `${params.model}:${params.action}:${JSON.stringify(params.args)}`;

    result = await cache.getValue(key);

    if (!Object.keys(result || {}).length) {
      result = await next(params);
      await cache.setValue(key, result);
    }

    return result;
  };

export const createCacheMiddleware = () => {
  // TODO: use redis cache for middleware
  const cache = {
    size: 0,
    maxSize: 1000,
    items: new Map<string, object>(),
  };
  const onTick = () => {
    if (cache.size) {
      cache.items.clear();
      cache.size = 0;
    }
    setImmediate(() => process.nextTick(onTick)).unref();
  };
  process.nextTick(onTick);
  return cacheMiddleware({
    actions: ['findUnique', 'findMany', 'findFirst'],
    cache: {
      getValue(key) {
        return cache.items.get(key);
      },
      setValue(key, value) {
        if (cache.size >= cache.maxSize) {
          cache.items.clear();
          cache.size = 0;
        }
        cache.size++;
        cache.items.set(key, value);
      },
    },
  });
};
