import https from 'https'

const BASE_URL = process.env.WC_BASE_URL + '/wp-json/wc/v3'
const agent = new https.Agent({ rejectUnauthorized: false })

export async function fetchWoo(endpoint, params = {}) {
  const token = Buffer.from(
    `${process.env.WC_KEY}:${process.env.WC_SECRET}`
  ).toString('base64')

  const query = new URLSearchParams(params).toString()
  const url = `${BASE_URL}${endpoint}${query ? '?' + query : ''}`

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${token}`,
      },
      agent,
      // Evita que un WooCommerce colgado/inaccesible bloquee el build indefinidamente.
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      console.warn(`[fetchWoo] respuesta no-ok ${res.status} en ${endpoint}`)
      return null
    }

    return await res.json()
  } catch (error) {
    // No lanzamos: durante el build (p. ej. Vercel) WooCommerce local no es
    // accesible. Devolvemos null y cada query decide su fallback seguro.
    console.warn(`[fetchWoo] falló en ${endpoint}: ${error.message}`)
    return null
  }
}