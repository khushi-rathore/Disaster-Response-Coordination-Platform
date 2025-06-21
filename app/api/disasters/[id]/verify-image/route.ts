import { type NextRequest, NextResponse } from "next/server"
import { mockImageVerification } from "@/lib/mock-image-verification"
import { mockCache } from "@/lib/mock-cache"
import { mockRateLimiter } from "@/lib/mock-rate-limiter"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Rate limiting
    const ip = request.ip || "unknown"
    const rateLimit = mockRateLimiter.checkLimit(ip, "POST")

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.resetTime.toString(),
            "Retry-After": rateLimit.retryAfter?.toString() || "60",
          },
        },
      )
    }

    const body = await request.json()
    const { image_url, context, report_id } = body

    if (!image_url) {
      return NextResponse.json({ error: "image_url is required" }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `image_verification:${image_url}`
    let verification = await mockCache.get(cacheKey)

    if (!verification) {
      console.log("🔍 Verifying image with mock AI service...")

      // Perform mock verification
      verification = await mockImageVerification.verifyImage(image_url, context)

      // Cache the result for 1 hour
      await mockCache.set(cacheKey, verification, 60)
    } else {
      console.log("✅ Using cached verification result")
    }

    // Also get content analysis
    const contentAnalysis = await mockImageVerification.analyzeImageContent(image_url)

    // Mock database update if report_id provided
    if (report_id) {
      console.log(`📝 Updated report ${report_id} with verification status: ${verification.recommendation}`)
    }

    console.log(`✅ Image verification completed: ${verification.isAuthentic ? "AUTHENTIC" : "SUSPICIOUS"}`)

    return NextResponse.json({
      verification: {
        ...verification,
        contentAnalysis,
      },
      disaster_id: params.id,
      cached: !!(await mockCache.get(cacheKey)),
      processing_time: verification.processingTime,
    })
  } catch (error) {
    console.error("❌ Image verification API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Batch verification endpoint
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ip = request.ip || "unknown"
    const rateLimit = mockRateLimiter.checkLimit(ip, "PUT")

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const body = await request.json()
    const { image_urls } = body

    if (!Array.isArray(image_urls) || image_urls.length === 0) {
      return NextResponse.json({ error: "image_urls array is required" }, { status: 400 })
    }

    if (image_urls.length > 10) {
      return NextResponse.json({ error: "Maximum 10 images per batch" }, { status: 400 })
    }

    console.log(`🔍 Batch verifying ${image_urls.length} images...`)

    const results = await mockImageVerification.batchVerifyImages(image_urls)

    // Cache all results
    for (const result of results) {
      const cacheKey = `image_verification:${result.imageUrl}`
      await mockCache.set(cacheKey, result, 60)
    }

    console.log(`✅ Batch verification completed`)

    return NextResponse.json({
      results,
      disaster_id: params.id,
      total_processed: results.length,
      summary: {
        authentic: results.filter((r) => r.isAuthentic).length,
        suspicious: results.filter((r) => !r.isAuthentic).length,
        high_confidence: results.filter((r) => r.confidence > 80).length,
      },
    })
  } catch (error) {
    console.error("❌ Batch verification API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
