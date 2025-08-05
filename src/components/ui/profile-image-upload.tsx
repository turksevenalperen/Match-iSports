"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload, X } from "lucide-react"
import { useToastContext } from "@/components/toast-provider"

interface ProfileImageUploadProps {
  currentImage?: string
  onImageChange: (imageUrl: string) => void
  teamName: string
}

export default function ProfileImageUpload({ 
  currentImage, 
  onImageChange, 
  teamName 
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null)
  const { toast } = useToastContext()

  // Resmi küçült ve kare crop yap
  const resizeAndPreviewImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // 400x400 kare boyut
        const size = 400
        canvas.width = size
        canvas.height = size

        // Kare crop için hesaplama
        const minDimension = Math.min(img.width, img.height)
        const scale = size / minDimension
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        
        // Merkeze yerleştir
        const x = (size - scaledWidth) / 2
        const y = (size - scaledHeight) / 2

        // Resmi çiz
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
        
        // Data URL olarak dön
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        resolve(dataUrl)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // File type validation
    if (!file.type.startsWith('image/')) {
      toast.error("Lütfen bir resim dosyası seçin")
      return
    }

    // File size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu 5MB'dan büyük olamaz")
      return
    }

    // Resmi önce local olarak küçült ve preview göster
    const resizedImageUrl = await resizeAndPreviewImage(file)
    setPreviewImage(resizedImageUrl)

    setIsUploading(true)

    try {
      // Backend API'mizi kullan (geçici çözüm)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Upload response:', data) // Debug log
        // Server'dan gelen URL'i kullan (Cloudinary'den gelen optimized image)
        setPreviewImage(data.imageUrl) 
        onImageChange(data.imageUrl)
        toast.success("Profil fotoğrafı yüklendi")
      } else {
        const errorData = await response.json()
        console.error('Cloudinary error:', errorData) // Debug log
        toast.error(`Upload hatası: ${errorData.error?.message || 'Bilinmeyen hata'}`)
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error) // Debug log
      setPreviewImage(null) // Hata durumunda preview'i temizle
      toast.error("Fotoğraf yüklenirken bir hata oluştu")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewImage(null)
    onImageChange('')
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-32 w-32 border-4 border-orange-500/30 ring-2 ring-orange-500/20">
          <AvatarImage 
            src={previewImage || ''} 
            alt={`${teamName} logo`}
            className="object-cover w-full h-full rounded-full"
            style={{ objectPosition: 'center' }}
          />
          <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-2xl font-bold">
            {teamName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {previewImage && (
          <Button
            onClick={handleRemoveImage}
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            disabled={isUploading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
            asChild
          >
            <span>
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              {isUploading ? 'Yükleniyor...' : 'Fotoğraf Seç'}
            </span>
          </Button>
        </label>
      </div>

      <p className="text-xs text-gray-400 text-center">
        JPG, PNG, GIF desteklenir. Maksimum 5MB.
      </p>
    </div>
  )
}
