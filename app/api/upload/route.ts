import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "butterfly-events"

    if (!file)
      return NextResponse.json({ success: false, message: "No file provided", statusCode: 400 }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder, resource_type: "auto" }, (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }).end(buffer)
    })

    return NextResponse.json({ success: true, message: "File uploaded", statusCode: 200, data: { url: result.secure_url, publicId: result.public_id } })
  } catch {
    return NextResponse.json({ success: false, message: "Upload failed", statusCode: 500 }, { status: 500 })
  }
}
