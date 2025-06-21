// Mock rate limiting system
interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
}

export class MockRateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  private blockedIPs = new Set<string>()

  // Default limits
  private readonly DEFAULT_LIMITS = {
    GET: { requests: 100, windowMs: 60000 }, // 100 requests per minute
    POST: { requests: 20, windowMs: 60000 }, // 20 requests per minute
    PUT: { requests: 10, windowMs: 60000 }, // 10 requests per minute
    DELETE: { requests: 5, windowMs: 60000 }, // 5 requests per minute
  }

  checkLimit(
    identifier: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    customLimit?: { requests: number; windowMs: number },
  ): {
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  } {
    // Check if IP is blocked
    if (this.blockedIPs.has(identifier)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000, // 1 minute block
        retryAfter: 60,
      }
    }

    const limit = customLimit || this.DEFAULT_LIMITS[method]
    const key = `${identifier}:${method}`
    const now = Date.now()

    let entry = this.limits.get(key)

    // Initialize or reset if window expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + limit.windowMs,
        blocked: false,
      }
    }

    // Check if limit exceeded
    if (entry.count >= limit.requests) {
      entry.blocked = true
      this.limits.set(key, entry)

      // Block IP if too many violations
      this.checkForBlocking(identifier)

      console.log(`🚫 Rate limit exceeded: ${identifier} (${method})`)

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      }
    }

    // Increment counter
    entry.count++
    this.limits.set(key, entry)

    const remaining = limit.requests - entry.count

    if (remaining <= 5) {
      console.log(`⚠️ Rate limit warning: ${identifier} (${remaining} requests remaining)`)
    }

    return {
      allowed: true,
      remaining,
      resetTime: entry.resetTime,
    }
  }

  // Check if IP should be temporarily blocked
  private checkForBlocking(identifier: string) {
    const violations = Array.from(this.limits.entries()).filter(
      ([key, entry]) => key.startsWith(identifier) && entry.blocked,
    ).length

    if (violations >= 3) {
      // Block after 3 violations across different methods
      this.blockedIPs.add(identifier)
      console.log(`🔒 IP blocked temporarily: ${identifier}`)

      // Unblock after 5 minutes
      setTimeout(
        () => {
          this.blockedIPs.delete(identifier)
          console.log(`🔓 IP unblocked: ${identifier}`)
        },
        5 * 60 * 1000,
      )
    }
  }

  // Get current status for an identifier
  getStatus(identifier: string): {
    isBlocked: boolean
    limits: Array<{
      method: string
      count: number
      limit: number
      remaining: number
      resetTime: number
    }>
  } {
    const isBlocked = this.blockedIPs.has(identifier)
    const limits = []

    for (const [method, config] of Object.entries(this.DEFAULT_LIMITS)) {
      const key = `${identifier}:${method}`
      const entry = this.limits.get(key)

      limits.push({
        method,
        count: entry?.count || 0,
        limit: config.requests,
        remaining: Math.max(0, config.requests - (entry?.count || 0)),
        resetTime: entry?.resetTime || Date.now() + config.windowMs,
      })
    }

    return { isBlocked, limits }
  }

  // Reset limits for an identifier
  resetLimits(identifier: string) {
    const keysToDelete = Array.from(this.limits.keys()).filter((key) => key.startsWith(identifier))

    keysToDelete.forEach((key) => this.limits.delete(key))
    this.blockedIPs.delete(identifier)

    console.log(`🔄 Rate limits reset for: ${identifier}`)
  }

  // Get global statistics
  getGlobalStats() {
    const totalEntries = this.limits.size
    const blockedIPs = this.blockedIPs.size
    const activeViolations = Array.from(this.limits.values()).filter((entry) => entry.blocked).length

    return {
      totalTrackedIdentifiers: totalEntries,
      blockedIPs,
      activeViolations,
      memoryUsage: `${Math.round(totalEntries * 0.1)}KB`, // Rough estimate
    }
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Rate limiter cleanup: ${cleaned} expired entries removed`)
    }

    return cleaned
  }
}

export const mockRateLimiter = new MockRateLimiter()

// Auto cleanup every 2 minutes
setInterval(
  () => {
    mockRateLimiter.cleanup()
  },
  2 * 60 * 1000,
)
