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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUploader } from "@/components/image-uploader"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface RichTextEditorProps {
  initialValue?: string
  onChange: (value: string) => void
}

export function RichTextEditor({ initialValue = "", onChange }: RichTextEditorProps) {
  const [content, setContent] = useState(initialValue)
  const [activeTab, setActiveTab] = useState<string>("edit")
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
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
