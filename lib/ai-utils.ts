"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateBlogContent(imageUrl: string, prompt: string) {
  try {
    const systemPrompt = `Sen profesyonel bir blog yazarısın. Kullanıcının verdiği açıklama doğrultusunda detaylı, SEO dostu ve ilgi çekici blog içeriği oluştur. 
    Kullanıcı bir görsel URL'si paylaştı, ancak bu görseli doğrudan analiz edemezsin. Bunun yerine, kullanıcının açıklamasına odaklan.
    İçerik Türkçe olmalı ve en az 3 paragraf içermeli.
    Başlık önerisi, giriş paragrafı, ana içerik ve sonuç bölümlerini içermeli.
    HTML formatında yanıt ver, böylece içerik doğrudan blog editörüne eklenebilir.`

    const userPrompt = `Aşağıdaki konu hakkında detaylı bir blog yazısı oluştur:
    
    ${prompt || "Detaylı bir blog yazısı oluştur."}
    
    Not: Bir görsel de paylaştım, ancak bu görseli doğrudan analiz edemeyeceğini biliyorum. Lütfen yukarıdaki açıklamaya odaklan.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 1500,
    })

    return { success: true, content: text }
  } catch (error) {
    console.error("AI içerik oluşturma hatası:", error)
    return {
      success: false,
      error: "İçerik oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
    }
  }
}

export async function improveContent(content: string, instruction: string) {
  try {
    const systemPrompt = `Sen profesyonel bir blog editörüsün. Verilen içeriği kullanıcının talimatları doğrultusunda geliştir.
    İçerik Türkçe olmalı ve orijinal içeriğin ana fikrini korumalı.
    HTML formatında yanıt ver, böylece içerik doğrudan blog editörüne eklenebilir.`

    const userPrompt = `Bu içeriği şu talimata göre geliştir: "${instruction}"
    
    İçerik:
    ${content}`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 1500,
    })

    return { success: true, content: text }
  } catch (error) {
    console.error("AI içerik geliştirme hatası:", error)
    return {
      success: false,
      error: "İçerik geliştirilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
    }
  }
}
