interface ContentProps {
  content: string
}

export function BlogContent({ content }: ContentProps) {
  return (
    <div
      className="blog-content prose max-w-none dark:prose-invert prose-lg"
      dangerouslySetInnerHTML={{ __html: content }}
      dir="ltr"
      style={{
        direction: "ltr",
        textAlign: "left",
      }}
    />
  )
}
