import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Client-side supabase for browser usage
export const createClientSupabase = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Server-side client for API routes
export function createServerClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Database types
export interface Database {
  public: {
    Tables: {
      disasters: {
        Row: {
          id: string
          title: string
          description: string
          tags: string[]
          location_name: string
          coordinates: any
          severity: "low" | "medium" | "high" | "critical"
          status: "active" | "monitoring" | "resolved" | "closed"
          disaster_type: string
          affected_people: number
          verified: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description: string
          tags?: string[]
          location_name: string
          coordinates?: any
          severity?: "low" | "medium" | "high" | "critical"
          status?: "active" | "monitoring" | "resolved" | "closed"
          disaster_type: string
          affected_people?: number
          verified?: boolean
          created_by?: string
        }
      }
      disaster_reports: {
        Row: {
          id: string
          disaster_id: string
          user_id: string
          title: string
          description: string
          image_url?: string
          image_verified: boolean
          location_name?: string
          coordinates?: any
          priority: "low" | "medium" | "high" | "urgent"
          status: "pending" | "verified" | "investigating" | "resolved" | "rejected"
          created_at: string
        }
        Insert: {
          disaster_id?: string
          user_id?: string
          title: string
          description: string
          image_url?: string
          location_name?: string
          coordinates?: any
          priority?: "low" | "medium" | "high" | "urgent"
        }
      }
      resources: {
        Row: {
          id: string
          name: string
          type: "shelter" | "hospital" | "relief_center" | "food_distribution" | "medical_camp" | "evacuation_center"
          description?: string
          location_name: string
          coordinates: any
          capacity?: number
          current_occupancy: number
          status: "active" | "full" | "closed" | "maintenance"
          contact_phone?: string
          facilities?: string[]
          created_at: string
        }
      }
      alerts: {
        Row: {
          id: string
          disaster_id: string
          title: string
          message: string
          alert_type: "evacuation" | "weather" | "resource" | "safety" | "update"
          severity: "info" | "warning" | "critical" | "emergency"
          coordinates?: any
          active: boolean
          created_at: string
        }
      }
    }
  }
}
