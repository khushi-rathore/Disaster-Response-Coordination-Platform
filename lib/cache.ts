import { createServerClient } from "./supabase"

export class CacheManager {
  private supabase = createServerClient()

  async get(key: string): Promise<any | null> {
    try {
      const { data, error } = await this.supabase.from("cache").select("value, expires_at").eq("key", key).single()

      if (error || !data) return null

      // Check if cache has expired
      if (new Date(data.expires_at) < new Date()) {
        await this.delete(key)
        return null
      }

      return data.value
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  async set(key: string, value: any, ttlMinutes = 60): Promise<void> {
    try {
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes)

      await this.supabase.from("cache").upsert({
        key,
        value,
        expires_at: expiresAt.toISOString(),
      })
    } catch (error) {
      console.error("Cache set error:", error)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.supabase.from("cache").delete().eq("key", key)
    } catch (error) {
      console.error("Cache delete error:", error)
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.supabase.from("cache").delete().lt("expires_at", new Date().toISOString())
    } catch (error) {
      console.error("Cache cleanup error:", error)
    }
  }
}

export const cache = new CacheManager()
