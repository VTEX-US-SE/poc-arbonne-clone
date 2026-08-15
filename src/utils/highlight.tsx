/**
 * Emphasises the matched part of a suggestion. Intelligent Search returns whole
 * phrases, so the term is not necessarily a prefix -- "intellig" comes back as
 * "arbonne intelligence".
 */
export const highlight = (value: string, term: string) => {
  const index = value.toLowerCase().indexOf(term.toLowerCase())

  if (index < 0) {
    return value
  }

  return (
    <>
      {value.slice(0, index)}
      <strong>{value.slice(index, index + term.length)}</strong>
      {value.slice(index + term.length)}
    </>
  )
}
