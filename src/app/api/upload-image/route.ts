import { NextRequest, NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    // Register sayfasında session olmayabilir, bu yüzden session kontrolünü kaldıralım
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: "Dosya seçilmedi" },
        { status: 400 }
      )
    }

    // File validation
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "Sadece resim dosyaları kabul edilir" },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      return NextResponse.json(
        { error: "Dosya boyutu 5MB'dan büyük olamaz" },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "team-logos", // Cloudinary'de klasör
          public_id: `team-${Date.now()}-${Math.random().toString(36).substring(7)}`, // Random unique ID
          overwrite: true,
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const result = uploadResult as any

    return NextResponse.json({
      imageUrl: result.secure_url,
      publicId: result.public_id
    })

  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json(
      { error: "Fotoğraf yüklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
