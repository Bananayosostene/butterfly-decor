import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function uploadToCloudinary(buffer: Buffer, folder: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto", timeout: 120000 },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "butterfly-events"

    if (!file)
      return NextResponse.json({ success: false, message: "No file provided", statusCode: 400 }, { status: 400 })

    if (file.size > 10 * 1024 * 1024)
      return NextResponse.json({ success: false, message: "File too large (max 10MB)", statusCode: 400 }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let result: any
    let lastError: any
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await uploadToCloudinary(buffer, folder)
        break
      } catch (err: any) {
        lastError = err
        const isRetryable = err?.code === "ECONNRESET" || err?.code === "ETIMEDOUT" || err?.http_code >= 500
        if (!isRetryable || attempt === 3) throw err
        await new Promise((r) => setTimeout(r, attempt * 1000))
      }
    }

    return NextResponse.json({ success: true, message: "File uploaded", statusCode: 200, data: { url: result.secure_url, publicId: result.public_id } })
  } catch (error: any) {
    console.error("Cloudinary upload error:", error)
    return NextResponse.json({ success: false, message: error?.message ?? "Upload failed", statusCode: 500 }, { status: 500 })
  }
}
