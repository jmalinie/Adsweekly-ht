"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadImageToBlob } from "@/lib/blob-utils"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void
  multiple?: boolean
  accept?: string
  maxSize?: number // MB cinsinden
}

export function ImageUploader({
  onImageUploaded,
  multiple = false,
  accept = "image/*",
  maxSize = 5,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [blobTokenStatus, setBlobTokenStatus] = useState<"checking" | "available" | "missing" | "error">("checking")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check blob token status on component mount
  useEffect(() => {
    const checkBlobToken = async () => {
      try {
        const response = await fetch("/api/blob-token-check")
        if (!response.ok) {
          setBlobTokenStatus("error")
          return
        }

        const data = await response.json()
        setBlobTokenStatus(data.hasToken ? "available" : "missing")
      } catch (error) {
        console.error("Error checking blob token:", error)
        setBlobTokenStatus("error")
      }
    }

    checkBlobToken()
  }, [])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // File size check
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "Hata",
          description: `${file.name} dosyası çok büyük. Maksimum ${maxSize}MB olmalıdır.`,
          variant: "destructive",
        })
        return
      }
    }

    setIsUploading(true)

    try {
      if (multiple) {
        // Multiple file upload
        const uploadPromises = Array.from(files).map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)
          const result = await uploadImageToBlob(formData)
          console.log("Upload result for", file.name, ":", result)
          return result
        })

        const results = await Promise.all(uploadPromises)

        // Check successful uploads
        const successfulUploads = results.filter((result) => result.success && result.url)
        const failedUploads = results.filter((result) => result.error)

        if (failedUploads.length > 0) {
          console.error("Failed uploads:", failedUploads)
          toast({
            title: "Uyarı",
            description: `${failedUploads.length} dosya yüklenemedi: ${failedUploads[0].error}`,
            variant: "destructive",
          })
        }

        if (successfulUploads.length > 0) {
          successfulUploads.forEach((result) => {
            if (result.url) {
              onImageUploaded(result.url)
            }
          })

          toast({
            title: "Başarılı",
            description: `${successfulUploads.length} dosya başarıyla yüklendi.`,
          })
        }
      } else {
        // Single file upload
        const formData = new FormData()
        formData.append("file", files[0])

        console.log("Uploading single file:", files[0].name)
        const result = await uploadImageToBlob(formData)
        console.log("Upload result:", result)

        if (result.error) {
          toast({
            title: "Hata",
            description: result.error,
            variant: "destructive",
          })
        } else if (result.url) {
          onImageUploaded(result.url)
          toast({
            title: "Başarılı",
            description: "Görsel başarıyla yüklendi.",
          })
        }
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Hata",
        description: "Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Render token status warning if there's an issue
  if (blobTokenStatus === "missing" || blobTokenStatus === "error") {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Görsel Yükleme Hatası</AlertTitle>
          <AlertDescription>
            {blobTokenStatus === "missing"
              ? "Blob token eksik. Görsel yükleme şu anda kullanılamıyor. Lütfen site yöneticisiyle iletişime geçin."
              : "Blob token durumu kontrol edilirken bir hata oluştu. Görsel yükleme şu anda kullanılamıyor."}
          </AlertDescription>
        </Alert>

        <Button type="button" variant="outline" onClick={() => window.location.reload()} className="w-full">
          Yeniden Dene
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        disabled={isUploading || blobTokenStatus === "checking"}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Yükleniyor...
          </>
        ) : blobTokenStatus === "checking" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Kontrol ediliyor...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {multiple ? "Görselleri Seç" : "Görsel Seç"}
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground">
        {multiple ? "Birden fazla görsel seçebilirsiniz." : "Tek görsel seçebilirsiniz."} Maksimum {maxSize}MB.
      </p>
    </div>
  )
}
