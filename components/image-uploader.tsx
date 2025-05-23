"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadImageToBlob } from "@/lib/blob-utils"

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void
  multiple?: boolean
}

export function ImageUploader({ onImageUploaded, multiple = false }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const totalFiles = files.length
      let processedFiles = 0
      let successfulUploads = 0

      // Her dosyayı sırayla yükle
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Dosya tipini kontrol et
        if (!file.type.startsWith("image/")) {
          console.error(`${file.name} is not an image file`)
          processedFiles++
          setUploadProgress(Math.round((processedFiles / totalFiles) * 100))
          continue
        }

        const formData = new FormData()
        formData.append("file", file)

        const result = await uploadImageToBlob(formData)

        if (result.error) {
          console.error(`Error uploading ${file.name}:`, result.error)
        } else if (result.url) {
          onImageUploaded(result.url)
          successfulUploads++
        }

        processedFiles++
        setUploadProgress(Math.round((processedFiles / totalFiles) * 100))
      }

      // Başarı mesajı göster
      if (successfulUploads > 0 && totalFiles > 1) {
        console.log(`${successfulUploads} resim başarıyla yüklendi`)
      }
    } catch (err) {
      setError("Resim yüklenirken bir hata oluştu")
      console.error(err)
    } finally {
      setIsUploading(false)
      // Dosya seçiciyi sıfırla
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      // Yükleme tamamlandıktan sonra ilerleme çubuğunu sıfırla
      setTimeout(() => {
        setUploadProgress(0)
      }, 1000)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={triggerFileInput} disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Yükleniyor... {uploadProgress > 0 && `(${uploadProgress}%)`}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {multiple ? "Çoklu Resim Yükle" : "Resim Yükle"}
            </>
          )}
        </Button>
        {error && (
          <div className="flex items-center text-red-500 text-sm">
            <X className="mr-1 h-4 w-4" />
            {error}
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
        multiple={multiple}
      />
      {multiple && (
        <p className="text-xs text-muted-foreground mt-2">
          Birden fazla resim seçmek için Ctrl (veya Command) tuşuna basılı tutarak seçim yapabilirsiniz.
        </p>
      )}
    </div>
  )
}
