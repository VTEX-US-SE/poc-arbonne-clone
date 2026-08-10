export interface RichTextProps {
  title?: string
  text?: string
}

export default function RichText({ title, text }: RichTextProps) {
  return (
    <section className="section section-rich-text">
      {title && <h2>{title}</h2>}
      {text && <p>{text}</p>}
    </section>
  )
}
