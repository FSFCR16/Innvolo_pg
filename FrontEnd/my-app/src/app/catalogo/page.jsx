import { BandaMarcaProducto } from "@/components/layout/BandaMarcaProducto"
import { EncabezadoCatalogo } from "@/components/productos/EncabezadoCatalogo"
import { PaginaCategoriaCliente } from "@/components/productos/PaginaCategoriaCliente"
import { getCategorias } from "@/lib/woocommerce/queries/categorias"
import { getTodosLosProductos } from "@/lib/woocommerce/queries/productos"

// WooCommerce corre local y se expone por ngrok de forma intermitente. En vez de
// pegar a la PC en cada visita (la saturaba y devolvía "0 productos"), usamos ISR:
// la ruta se regenera a lo sumo cada 5 min y Vercel sirve la última versión buena.
export const revalidate = 300

export const metadata = {
  title: "Catálogo | INNVOLO",
  description:
    "Todos nuestros productos corporativos personalizados — filtra por categoría y cotiza por volumen.",
}

export default async function Catalogo() {
  const [categorias, productosRaw] = await Promise.all([
    getCategorias(),
    getTodosLosProductos(),
  ])

  // Mapa subcategoría→categoría (padre) y set de categorías top-level, para
  // resolver el enlace de cada producto desde sus slugs de categoría en Woo.
  const topLevel = new Set(categorias.map((c) => c.slug))
  const hijoAPadre = {}
  categorias.forEach((c) =>
    c.children?.forEach((ch) => {
      hijoAPadre[ch.slug] = c.slug
    })
  )

  const resolverSlugs = (slugs = []) => {
    const s = slugs.filter(
      (x) => x && x !== "uncategorized" && x !== "sin-categorizar"
    )
    const hijo = s.find((x) => hijoAPadre[x])
    if (hijo) return { categoria: hijoAPadre[hijo], subcategoria: hijo }
    const top = s.find((x) => topLevel.has(x))
    if (top) return { categoria: top, subcategoria: top }
    const f = s[0] || "catalogo"
    return { categoria: f, subcategoria: f }
  }

  const productos = productosRaw.map((p) => {
    const { categoria, subcategoria } = resolverSlugs(p.categoriesSlugs)
    return {
      id: p.id,
      nombre: p.name,
      slug: p.slug,
      descripcion: "",
      categoria,
      subcategoria,
      imagen: p.thumbnail?.url ?? "/categorias/ropa.jpeg",
    }
  })

  const categoriasFormateadas = categorias.map((cat) => ({
    id: cat.id,
    titulo: cat.name,
    slug: cat.slug,
    href: `/catalogo/${cat.slug}`,
    links:
      cat.children?.map((sub) => ({
        nombre: sub.name,
        slug: sub.slug,
        href: `/catalogo/${cat.slug}/${sub.slug}`,
      })) ?? [],
  }))

  return (
    <main>
      <BandaMarcaProducto />

      <EncabezadoCatalogo
        eyebrow="Catálogo"
        titulo="Todos los productos"
        subtitulo="Filtra por categoría en el panel lateral o busca lo que necesitas. Cotiza por volumen y recibe en 10–15 días en toda Colombia."
        total={productos.length}
      />

      <PaginaCategoriaCliente
        categorias={categoriasFormateadas}
        productos={productos}
      />
    </main>
  )
}
