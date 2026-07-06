import { fetchWoo } from "../woo"

export async function getCategorias() {
  const cats = await fetchWoo('/products/categories', { parent: 0, per_page: 20 })

  const catsConHijos = await Promise.all(
    cats.map(async (cat) => {
      const children = await fetchWoo('/products/categories', { parent: cat.id })
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: { url: cat.image?.src || null },
        children: children.map((c) => ({
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
  const cat = cats[0]
  if (!cat) throw new Error(`Categoría no encontrada: ${slug}`)

  const [children, products] = await Promise.all([
    fetchWoo('/products/categories', { parent: cat.id }),
    fetchWoo('/products', { category: cat.id, per_page: 50 }),
  ])

  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image: { url: cat.image?.src || null },
    children: children.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      thumbnail: { url: p.images[0]?.src || null },
    })),
  }
}