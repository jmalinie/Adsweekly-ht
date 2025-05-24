"use client"

import { useState, useRef, useEffect } from "react"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Sparkles,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUploader } from "@/components/image-uploader"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { generateBlogContent, improveContent } from "@/lib/ai-utils"
import { toast } from "@/hooks/use-toast"

interface RichTextEditorProps {
  initialValue?: string
  onChange: (value: string) => void
}

export function RichTextEditor({ initialValue = "", onChange }: RichTextEditorProps) {
  const [content, setContent] = useState(initialValue)
  const [activeTab, setActiveTab] = useState<string>("edit")
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
  const [isAiImproveDialogOpen, setIsAiImproveDialogOpen] = useState(false)
  const [aiImageUrl, setAiImageUrl] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiImprovePrompt, setAiImprovePrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue

      // Metin yönünü LTR (Left-to-Right) olarak ayarla
      editorRef.current.style.direction = "ltr"
      editorRef.current.setAttribute("dir", "ltr")
    }
  }, [initialValue])

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)
      onChange(newContent)
    }
  }

  const execCommand = (command: string, value = "") => {
    document.execCommand(command, false, value)
    handleContentChange()
    editorRef.current?.focus()
  }

  const insertImage = (imageUrl: string) => {
    execCommand(
      "insertHTML",
      `<img src="${imageUrl}" alt="Blog görseli" style="max-width: 100%; height: auto; margin: 10px 0;" />`,
    )
  }

  const insertLink = () => {
    const url = prompt("Bağlantı URL'si girin:")
    if (url) {
      execCommand("createLink", url)
    }
  }

  const handleGenerateContent = async () => {
    if (!aiImageUrl) {
      toast({
        title: "Hata",
        description: "Lütfen bir görsel URL'si girin.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const result = await generateBlogContent(aiImageUrl, aiPrompt)

      if (result.success && result.content) {
        execCommand("insertHTML", result.content)
        setIsAiDialogOpen(false)
        setAiImageUrl("")
        setAiPrompt("")
        toast({
          title: "Başarılı",
          description: "AI içeriği başarıyla oluşturuldu ve editöre eklendi.",
        })
      } else {
        toast({
          title: "Hata",
          description: result.error || "İçerik oluşturulurken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("AI içerik oluşturma hatası:", error)
      toast({
        title: "Hata",
        description: "İçerik oluşturulurken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleImproveContent = async () => {
    if (!aiImprovePrompt) {
      toast({
        title: "Hata",
        description: "Lütfen bir iyileştirme talimatı girin.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const currentContent = editorRef.current?.innerHTML || ""

      if (!currentContent.trim()) {
        toast({
          title: "Hata",
          description: "İyileştirilecek içerik bulunamadı.",
          variant: "destructive",
        })
        setIsGenerating(false)
        return
      }

      const result = await improveContent(currentContent, aiImprovePrompt)

      if (result.success && result.content) {
        editorRef.current!.innerHTML = result.content
        handleContentChange()
        setIsAiImproveDialogOpen(false)
        setAiImprovePrompt("")
        toast({
          title: "Başarılı",
          description: "İçerik başarıyla iyileştirildi.",
        })
      } else {
        toast({
          title: "Hata",
          description: result.error || "İçerik iyileştirilirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("AI içerik iyileştirme hatası:", error)
      toast({
        title: "Hata",
        description: "İçerik iyileştirilirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="border rounded-md">
      <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b px-3 py-2">
          <TabsList className="grid w-40 grid-cols-2">
            <TabsTrigger value="edit">Düzenle</TabsTrigger>
            <TabsTrigger value="preview">Önizleme</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit" className="p-0">
          <div className="border-b px-3 py-2 flex flex-wrap gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("bold")}>
              <Bold className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("italic")}>
              <Italic className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("insertUnorderedList")}>
              <List className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("insertOrderedList")}>
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={insertLink}>
              <Link className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("justifyLeft")}>
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("justifyCenter")}>
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("justifyRight")}>
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("formatBlock", "<h1>")}>
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("formatBlock", "<h2>")}>
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("formatBlock", "<h3>")}>
              <Heading3 className="h-4 w-4" />
            </Button>
            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="icon">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Resim Ekle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    Tek seferde birden fazla resim yükleyebilirsiniz. Yüklenen her resim içeriğe otomatik olarak
                    eklenecektir.
                  </p>
                  <ImageUploader
                    onImageUploaded={(url) => {
                      insertImage(url)
                    }}
                    multiple={true}
                  />
                </div>
              </DialogContent>
            </Dialog>

            {/* AI İçerik Oluşturma Butonu */}
            <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="ml-2 bg-purple-50 dark:bg-purple-900/20">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>AI ile İçerik Oluştur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    Bir görsel URL'si ve konu hakkında kısa bir açıklama girin. AI, görsel hakkında detaylı bir blog
                    yazısı oluşturacak.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Görsel URL'si</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      value={aiImageUrl}
                      onChange={(e) => setAiImageUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Konu Açıklaması (İsteğe Bağlı)</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Bu ürün hakkında detaylı bir inceleme yazısı oluştur..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button onClick={handleGenerateContent} className="w-full" disabled={isGenerating || !aiImageUrl}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        İçerik Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        İçerik Oluştur
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* AI İçerik İyileştirme Butonu */}
            <Dialog open={isAiImproveDialogOpen} onOpenChange={setIsAiImproveDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="ghost" className="ml-2 text-xs bg-purple-50 dark:bg-purple-900/20">
                  <Sparkles className="mr-1 h-3 w-3 text-purple-500" />
                  İyileştir
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>AI ile İçeriği İyileştir</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    Mevcut içeriğinizi nasıl iyileştirmek istediğinizi belirtin. AI, talimatlarınıza göre içeriği
                    geliştirecek.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="improvePrompt">İyileştirme Talimatı</Label>
                    <Textarea
                      id="improvePrompt"
                      placeholder="Daha profesyonel bir dil kullan ve SEO için anahtar kelimeleri ekle..."
                      value={aiImprovePrompt}
                      onChange={(e) => setAiImprovePrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button onClick={handleImproveContent} className="w-full" disabled={isGenerating || !aiImprovePrompt}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        İçerik İyileştiriliyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        İçeriği İyileştir
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="p-3 border-b">
            <ImageUploader onImageUploaded={insertImage} multiple={true} />
            <p className="text-xs text-muted-foreground mt-2">
              İpucu: Öne çıkan görsel seçmezseniz, yazınızdaki ilk görsel otomatik olarak öne çıkan görsel olarak
              kullanılacaktır. Birden fazla resim seçmek için Ctrl (veya Command) tuşuna basılı tutarak seçim
              yapabilirsiniz.
            </p>
          </div>

          <div
            ref={editorRef}
            className="min-h-[300px] p-4 focus:outline-none"
            contentEditable
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: content }}
            dir="ltr"
            style={{ direction: "ltr", textAlign: "left" }}
          />
        </TabsContent>

        <TabsContent value="preview" className="p-4 prose max-w-none">
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            dir="ltr"
            style={{ direction: "ltr", textAlign: "left" }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
