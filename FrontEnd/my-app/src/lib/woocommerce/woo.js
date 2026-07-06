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
    })

    if (!res.ok) {
      throw new Error(`WooCommerce API error ${res.status} en ${endpoint}`)
    }

    return await res.json()
  } catch (error) {
    throw new Error(`fetchWoo falló en ${endpoint}: ${error.message}`)
  }
}