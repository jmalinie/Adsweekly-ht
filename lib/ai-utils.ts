"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateBlogContent(imageUrl: string, prompt: string) {
  try {
    const systemPrompt = `Sen profesyonel bir blog yazarısın. Verilen görsel ve açıklama doğrultusunda detaylı, SEO dostu ve ilgi çekici blog içeriği oluştur. 
    Görsel bir ürünü gösteriyorsa, ürünün özelliklerini, faydalarını ve kullanım alanlarını vurgula.
    İçerik Türkçe olmalı ve en az 3 paragraf içermeli.
    Başlık önerisi, giriş paragrafı, ana içerik ve sonuç bölümlerini içermeli.
    HTML formatında yanıt ver, böylece içerik doğrudan blog editörüne eklenebilir.`

    const userPrompt = `Bu görseli analiz et ve hakkında bir blog yazısı oluştur: ${imageUrl}
    
    Konu hakkında ek bilgi: ${prompt || "Detaylı bir blog yazısı oluştur."}`

    const { text } = await generateText({
      model: openai("gpt-4o"),
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
      model: openai("gpt-4o"),
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
