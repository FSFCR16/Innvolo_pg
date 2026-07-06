import { fetchWoo } from '../woo'

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

export async function getProducto(id) {
  const [p, variationsRaw] = await Promise.all([
    fetchWoo(`/products/${id}`),
    fetchWoo(`/products/${id}/variations`),
  ])

  // Fallback seguro: si Woo no responde, el consumidor ya maneja `null`.
  if (!p || !p.id) return null

  const variations = Array.isArray(variationsRaw) ? variationsRaw : []

  const metaData = Array.isArray(p.meta_data) ? p.meta_data : []

  const model3dUrl = normalizarModelUrl(
    metaData.find((m) => m.key === 'model_3d_url')?.value || null
  )

  const tipo3d =
    metaData.find((m) => m.key === 'tipo_3d')?.value || 'torso'

  const customizationZones = JSON.parse(
    metaData.find((m) => m.key === 'customization_zones')?.value || '[]'
  )

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
    images: (p.images || []).map((img) => ({ url: img.src })),
    thumbnail: { url: p.images?.[0]?.src || null },
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
    thumbnail: { url: p.images[0]?.src || null },
  }))
}