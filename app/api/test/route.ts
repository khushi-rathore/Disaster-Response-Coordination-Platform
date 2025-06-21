import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Test basic connection
    const { data, error } = await supabase.from("disasters").select("count").single()

    if (error) {
      return NextResponse.json({
        status: "error",
        message: "Database connection failed",
        error: error.message,
      })
    }

    return NextResponse.json({
      status: "success",
      message: "Database connection working",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
