import { fetchWoo } from "../woo"

// Imagen de categoría servida desde Vercel (public/categorias) — antes salía de
// WordPress local (innvolo.local/ngrok) y el navegador pegaba a la PC en cada
// visita. Se mapea por nombre porque las 6 top-level son estables.
function imagenCategoriaLocal(name) {
  const n = (name || "").toLowerCase()
  if (n.includes("ropa")) return "/categorias/ropa.jpeg"
  if (n.includes("dotaci") || n.includes("indumentaria")) return "/categorias/dotacion.jpeg"
  if (n.includes("recipiente")) return "/categorias/recipientes.jpeg"
  if (n.includes("oficina") || n.includes("promocional")) return "/categorias/promocionales.jpeg"
  if (n.includes("textil") || n.includes("bolsa")) return "/categorias/textiles.jpeg"
  if (n.includes("mascota")) return "/categorias/mascotas.jpeg"
  return "/categorias/ropa.jpeg"
}

// Imagen de producto servida desde Vercel (public/productos/<id>.webp).
function imagenProductoLocal(id) {
  return `/productos/${id}.webp`
}

// Oculta la categoría por defecto de WooCommerce ("Sin categorizar"/"Uncategorized")
// en TODA la app (nav, megamenú, catálogo, sidebar, breadcrumbs) desde un solo punto.
function esCategoriaVisible(cat) {
  const n = (cat?.name || "").toLowerCase().trim()
  const s = (cat?.slug || "").toLowerCase().trim()
  return (
    n !== "sin categorizar" && n !== "uncategorized" &&
    s !== "sin-categorizar" && s !== "uncategorized"
  )
}

export async function getCategorias() {
  const cats = await fetchWoo('/products/categories', { parent: 0, per_page: 20 })

  // Fallback seguro: si Woo no responde, no hay categorías que mostrar.
  if (!Array.isArray(cats)) return []

  const catsConHijos = await Promise.all(
    cats.filter(esCategoriaVisible).map(async (cat) => {
      const children = await fetchWoo('/products/categories', { parent: cat.id })
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: { url: imagenCategoriaLocal(cat.name) },
        children: (Array.isArray(children) ? children : []).filter(esCategoriaVisible).map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        })),
      }
    })
  )

  return catsConHijos
}

export async function getCategoria(slug) {
  const cats = await fetchWoo('/products/categories', { slug })
  const cat = Array.isArray(cats) ? cats[0] : null
  // Fallback seguro: los consumidores ya manejan `null` con optional chaining.
  if (!cat) return null

  const [children, products] = await Promise.all([
    fetchWoo('/products/categories', { parent: cat.id }),
    fetchWoo('/products', { category: cat.id, per_page: 50 }),
  ])

  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image: { url: imagenCategoriaLocal(cat.name) },
    children: (Array.isArray(children) ? children : []).filter(esCategoriaVisible).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
    products: (Array.isArray(products) ? products : []).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      thumbnail: { url: imagenProductoLocal(p.id) },
    })),
  }
}