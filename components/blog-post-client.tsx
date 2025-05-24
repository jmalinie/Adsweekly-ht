"use client"

import Image from "next/image"

interface FeaturedImageProps {
  src: string
  alt: string
}

function FeaturedImage({ src, alt }: FeaturedImageProps) {
  return (
    <div className="relative w-full mb-8">
      <Image
        src={src || "/placeholder.svg"}
        alt={alt || "Featured image"}
        width={1200}
        height={600}
        className="w-full h-auto object-cover rounded-lg"
        priority
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </div>
  )
}

interface ContentProps {
  content: string
}

function Content({ content }: ContentProps) {
  return (
    <div
      className="blog-content prose max-w-none dark:prose-invert prose-lg"
      dangerouslySetInnerHTML={{ __html: content || "" }}
      dir="ltr"
      style={{
        direction: "ltr",
        textAlign: "left",
      }}
    />
  )
}

export const BlogPostClient = {
  FeaturedImage,
  Content,
}
