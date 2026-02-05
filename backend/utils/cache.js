const Redis = require('ioredis');

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  lazyConnect: true
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

class Cache {
  constructor() {
    this.defaultTTL = 3600; // 1 hour
    this.sessionTTL = 86400; // 24 hours
    this.productTTL = 1800; // 30 minutes for products
    this.categoryTTL = 3600; // 1 hour for categories
  }

  // ============ Product Caching ============

  async getProduct(productId) {
    try {
      const cached = await redis.get(`product:${productId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis getProduct error:', error);
      return null;
    }
  }

  async setProduct(productId, data, ttl = this.productTTL) {
    try {
      await redis.setex(`product:${productId}`, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Redis setProduct error:', error);
    }
  }

  async invalidateProduct(productId) {
    try {
      await redis.del(`product:${productId}`);
    } catch (error) {
      console.error('Redis invalidateProduct error:', error);
    }
  }

  async invalidateProductsByCategory(categoryId) {
    try {
      const keys = await redis.keys(`category:${categoryId}:products:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis invalidateProductsByCategory error:', error);
    }
  }

  // ============ Category Caching ============

  async getCategories() {
    try {
      const cached = await redis.get('categories:all');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis getCategories error:', error);
      return null;
    }
  }

  async setCategories(data, ttl = this.categoryTTL) {
    try {
      await redis.setex('categories:all', ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Redis setCategories error:', error);
    }
  }

  async invalidateCategories() {
    try {
      await redis.del('categories:all');
    } catch (error) {
      console.error('Redis invalidateCategories error:', error);
    }
  }

  // ============ Cart Caching ============

  async getCart(userId) {
    try {
      const cached = await redis.get(`cart:${userId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis getCart error:', error);
      return null;
    }
  }

  async setCart(userId, data, ttl = this.sessionTTL) {
    try {
      await redis.setex(`cart:${userId}`, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Redis setCart error:', error);
    }
  }

  async invalidateCart(userId) {
    try {
      await redis.del(`cart:${userId}`);
    } catch (error) {
      console.error('Redis invalidateCart error:', error);
    }
  }

  // ============ User Session Caching ============

  async getUserSession(userId) {
    try {
      const cached = await redis.get(`session:${userId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis getUserSession error:', error);
      return null;
    }
  }

  async setUserSession(userId, data, ttl = this.sessionTTL) {
    try {
      await redis.setex(`session:${userId}`, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Redis setUserSession error:', error);
    }
  }

  async invalidateSession(userId) {
    try {
      await redis.del(`session:${userId}`);
    } catch (error) {
      console.error('Redis invalidateSession error:', error);
    }
  }

  // ============ Generic Cache Methods ============

  async get(key) {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error(`Redis get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, data, ttl = this.defaultTTL) {
    try {
      if (ttl) {
        await redis.setex(key, ttl, JSON.stringify(data));
      } else {
        await redis.set(key, JSON.stringify(data));
      }
    } catch (error) {
      console.error(`Redis set error for key ${key}:`, error);
    }
  }

  async del(key) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Redis del error for key ${key}:`, error);
    }
  }

  async getOrSet(key, fetchFn, ttl = this.defaultTTL) {
    try {
      const cached = await this.get(key);
      if (cached) return cached;

      const data = await fetchFn();
      await this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`Redis getOrSet error for key ${key}:`, error);
      return await fetchFn();
    }
  }

  // ============ Pattern-based Invalidation ============

  async invalidatePattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`Redis invalidatePattern error for pattern ${pattern}:`, error);
    }
  }

  // ============ Rate Limiting ============

  async rateLimit(key, limit = 100, window = 60) {
    try {
      const current = await redis.incr(`ratelimit:${key}`);
      
      if (current === 1) {
        await redis.expire(`ratelimit:${key}`, window);
      }

      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetIn: await redis.ttl(`ratelimit:${key}`)
      };
    } catch (error) {
      console.error('Redis rateLimit error:', error);
      return { allowed: true, remaining: limit, resetIn: window };
    }
  }

  // ============ Distributed Locking ============

  async acquireLock(lockName, ttl = 30) {
    try {
      const lockValue = Date.now() + ttl * 1000;
      const acquired = await redis.set(
        `lock:${lockName}`,
        lockValue,
        'NX',
        'EX',
        ttl
      );

      return acquired === 'OK' ? lockValue : null;
    } catch (error) {
      console.error('Redis acquireLock error:', error);
      return null;
    }
  }

  async releaseLock(lockName, lockValue) {
    try {
      const current = await redis.get(`lock:${lockName}`);
      if (current === lockValue.toString()) {
        await redis.del(`lock:${lockName}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Redis releaseLock error:', error);
      return false;
    }
  }

  // ============ Stock Reservation ============

  async reserveStock(productId, quantity, reservationId, ttl = 900) {
    try {
      const currentStock = await redis.get(`stock:${productId}`);
      
      if (currentStock !== null && parseInt(currentStock) < quantity) {
        return { success: false, message: 'Insufficient stock' };
      }

      const newStock = await redis.decrby(`stock:${productId}`, quantity);
      
      if (parseInt(newStock) < 0) {
        await redis.incrby(`stock:${productId}`, quantity);
        return { success: false, message: 'Stock no longer available' };
      }

      await redis.setex(
        `reservation:${reservationId}`,
        ttl,
        JSON.stringify({ productId, quantity, expiresAt: Date.now() + ttl * 1000 })
      );

      return { success: true, reservationId };
    } catch (error) {
      console.error('Redis reserveStock error:', error);
      return { success: false, message: 'Reservation failed' };
    }
  }

  async releaseReservation(reservationId) {
    try {
      const reservation = await redis.get(`reservation:${reservationId}`);
      if (reservation) {
        const { productId, quantity } = JSON.parse(reservation);
        await redis.incrby(`stock:${productId}`, quantity);
        await redis.del(`reservation:${reservationId}`);
      }
    } catch (error) {
      console.error('Redis releaseReservation error:', error);
    }
  }

  async confirmReservation(reservationId) {
    try {
      await redis.del(`reservation:${reservationId}`);
    } catch (error) {
      console.error('Redis confirmReservation error:', error);
    }
  }

  // ============ Analytics Caching ============

  async getAnalytics(key, ttl = 300) {
    try {
      const cached = await redis.get(`analytics:${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis getAnalytics error:', error);
      return null;
    }
  }

  async setAnalytics(key, data, ttl = 300) {
    try {
      await redis.setex(`analytics:${key}`, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Redis setAnalytics error:', error);
    }
  }

  // ============ Health Check ============

  async ping() {
    try {
      return await redis.ping();
    } catch (error) {
      console.error('Redis ping error:', error);
      return null;
    }
  }

  async disconnect() {
    try {
      await redis.quit();
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }
}

module.exports = new Cache();
