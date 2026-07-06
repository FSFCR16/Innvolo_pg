// Las URLs de medios de WordPress se guardan absolutas al sitio local
// (https://innvolo.local/wp-content/uploads/...). En producción (Vercel) ese
// host no existe. Reescribimos el host al de WC_BASE_URL (en prod = URL
// pública/ngrok; en local sigue siendo innvolo.local ⇒ sin cambio).
export function normalizarWpUrl(url) {
  if (!url) return url
  const base = process.env.WC_BASE_URL
  if (!base) return url
  try {
    const u = new URL(url)
    const b = new URL(base)
    u.protocol = b.protocol
    u.host = b.host
    return u.toString()
  } catch {
    return url
  }
}
