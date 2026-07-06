export function parsearDescripcion(descripcionJson) {
  if (!descripcionJson) return ""
  
  try {
    const parsed = JSON.parse(descripcionJson)
    return parsed.blocks
      .map((block) => block.data?.text ?? "")
      .join(" ")
  } catch {
    return descripcionJson
  }
}