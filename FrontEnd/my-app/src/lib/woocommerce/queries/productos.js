import { fetchWoo } from '../woo'
import { normalizarWpUrl } from '../urls'

// El valor guardado en Woo es una URL absoluta a localhost
// (http://localhost:3000/modelos/x.glb). La normalizamos a ruta relativa
// (/modelos/x.glb) para que resuelva contra el dominio que sirve la página
// (localhost en dev, *.vercel.app en prod) sin hardcodear el host.
function normalizarModelUrl(url) {
  if (!url) return null
  try {
    return new URL(url).pathname
  } catch {
    return url // ya era relativa
  }
}

// Construye los tramos de precio desde los meta precio_20/50/100/500.
// Devuelve null si el producto no tiene ninguno (el consumidor usa su fallback).
function construirTramos(getMeta) {
  const defs = [
    { cantidad: 20, label: '20' },
    { cantidad: 50, label: '50' },
    { cantidad: 100, label: '100' },
    { cantidad: 500, label: '500+' },
  ]
  const tramos = defs
    .map((d) => {
      const raw = getMeta(`precio_${d.cantidad}`)
      const precio = raw ? Math.round(Number(raw)) : null
      return precio && !Number.isNaN(precio) ? { ...d, precio } : null
    })
    .filter(Boolean)
  return tramos.length ? tramos : null
}

export async function getProducto(id) {
  const [p, variationsRaw] = await Promise.all([
    fetchWoo(`/products/${id}`),
    fetchWoo(`/products/${id}/variations`),
  ])

  // Fallback seguro: si Woo no responde, el consumidor ya maneja `null`.
  if (!p || !p.id) return null

  const variations = Array.isArray(variationsRaw) ? variationsRaw : []

  const metaData = Array.isArray(p.meta_data) ? p.meta_data : []
  const getMeta = (key) => metaData.find((m) => m.key === key)?.value ?? null

  const model3dUrl = normalizarModelUrl(getMeta('model_3d_url'))

  const tipo3d = getMeta('tipo_3d') || 'torso'

  const customizationZones = JSON.parse(getMeta('customization_zones') || '[]')

  // Datos reales del Excel poblados en Woo (meta por producto)
  const tramosPrecio = construirTramos(getMeta)
  const materiales = getMeta('materiales')
  const coloresDisponibles = getMeta('colores_disponibles')
  const tecnicaRecomendada = getMeta('tecnica_recomendada')

  // Extraer colores únicos de las variantes
  const coloresVariantes = [
    ...new Set(
      variations.flatMap((v) =>
        v.attributes
          .filter((a) => a.name.toLowerCase() === 'color')
          .map((a) => a.option)
      )
    ),
  ]

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    images: (p.images || []).map((img) => ({ url: normalizarWpUrl(img.src) })),
    thumbnail: { url: normalizarWpUrl(p.images?.[0]?.src) || null },
    category: {
      name: p.categories?.[0]?.name || null,
      slug: p.categories?.[0]?.slug || null,
      parent: {
        name: p.categories?.[1]?.name || null,
        slug: p.categories?.[1]?.slug || null,
      },
    },
    attributes: (p.attributes || []).map((a) => ({
      attribute: { name: a.name, slug: a.slug },
      values: (a.options || []).map((o) => ({ name: o })),
    })),
    variants: variations.map((v) => ({
      id: v.id,
      sku: v.sku,
      attributes: v.attributes.map((a) => ({
        attribute: { name: a.name, slug: a.name.toLowerCase() },
        values: [{ name: a.option }],
      })),
    })),
    model3dUrl,
    tipo3d,
    customizationZones,
    coloresVariantes,
    tramosPrecio,
    materiales,
    coloresDisponibles,
    tecnicaRecomendada,
  }
}

export async function getProductosRelacionados(categoryId) {
  const products = await fetchWoo('/products', {
    category: categoryId,
    per_page: 4,
  })

  // Fallback seguro: sin datos ⇒ lista vacía (el consumidor hace .filter()).
  if (!Array.isArray(products)) return []

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    thumbnail: { url: normalizarWpUrl(p.images[0]?.src) || null },
  }))
}