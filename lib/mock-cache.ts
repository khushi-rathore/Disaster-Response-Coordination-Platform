// Mock caching system for demo purposes
interface CacheEntry {
  value: any
  expiresAt: number
  createdAt: number
}

export class MockCacheManager {
  private cache = new Map<string, CacheEntry>()
  private hitCount = 0
  private missCount = 0

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      this.missCount++
      console.log(`🔍 Cache MISS: ${key}`)
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.missCount++
      console.log(`⏰ Cache EXPIRED: ${key}`)
      return null
    }

    this.hitCount++
    console.log(`✅ Cache HIT: ${key}`)
    return entry.value
  }

  async set(key: string, value: any, ttlMinutes = 60): Promise<void> {
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
    })

    console.log(`💾 Cache SET: ${key} (TTL: ${ttlMinutes}m)`)
  }

  async delete(key: string): Promise<void> {
    const deleted = this.cache.delete(key)
    if (deleted) {
      console.log(`🗑️ Cache DELETE: ${key}`)
    }
  }

  async clear(): Promise<void> {
    const size = this.cache.size
    this.cache.clear()
    console.log(`🧹 Cache CLEARED: ${size} entries removed`)
  }

  // Cache statistics
  getStats() {
    const totalRequests = this.hitCount + this.missCount
    const hitRate = totalRequests > 0 ? ((this.hitCount / totalRequests) * 100).toFixed(1) : "0"

    return {
      entries: this.cache.size,
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: `${hitRate}%`,
      totalRequests,
    }
  }

  // Cleanup expired entries
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache cleanup: ${cleaned} expired entries removed`)
    }

    return cleaned
  }

  // Get cache entries by pattern
  getByPattern(pattern: string): Array<{ key: string; value: any; age: number }> {
    const results = []
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (key.includes(pattern) && now <= entry.expiresAt) {
        results.push({
          key,
          value: entry.value,
          age: Math.floor((now - entry.createdAt) / 1000), // age in seconds
        })
      }
    }

    return results
  }

  // Simulate cache warming
  async warmCache(keys: string[], dataGenerator: (key: string) => any): Promise<void> {
    console.log(`🔥 Warming cache with ${keys.length} entries...`)

    for (const key of keys) {
      const data = await dataGenerator(key)
      await this.set(key, data, 120) // 2 hour TTL for warmed data
    }

    console.log(`✅ Cache warmed successfully`)
  }
}

export const mockCache = new MockCacheManager()

// Auto cleanup every 5 minutes
setInterval(
  () => {
    mockCache.cleanup()
  },
  5 * 60 * 1000,
)
