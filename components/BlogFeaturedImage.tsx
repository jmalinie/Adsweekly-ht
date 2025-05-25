import Image from "next/image"

interface FeaturedImageProps {
  src: string
  alt: string
}

export function BlogFeaturedImage({ src, alt }: FeaturedImageProps) {
  return (
    <div className="relative w-full mb-8">
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
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
