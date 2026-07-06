import { BandaMarcaProducto } from "@/components/layout/BandaMarcaProducto"
import { EncabezadoCatalogo } from "@/components/productos/EncabezadoCatalogo"
import { PaginaCategoriaCliente } from "@/components/productos/PaginaCategoriaCliente"
import { getCategorias, getCategoria } from "@/lib/woocommerce/queries/categorias"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

// ISR: la ruta se regenera a lo sumo cada 5 min en vez de pegar a la PC (Woo
// local/ngrok) en cada visita. Vercel sirve la última versión buena aunque Woo caiga.
export const revalidate = 300

export async function generateMetadata({ params }) {
  const { categoria, subcategoria } = await params
  return {
    title: `${subcategoria?.replace(/-/g, " ")} | INNVOLO`,
    description: `Productos de ${subcategoria?.replace(/-/g, " ")} en ${categoria?.replace(/-/g, " ")}.`,
  }
}

export default async function PaginaSubcategoria({ params }) {
  const { categoria, subcategoria } = await params

  const [subcategoriaData, categorias] = await Promise.all([
    getCategoria(subcategoria),
    getCategorias(),
  ])

  const productos = subcategoriaData?.products?.map((p) => ({
    id: p.id,
    nombre: p.name,
    slug: p.slug,
    descripcion: "",
    subcategoria: subcategoria,
    imagen: p.thumbnail?.url ?? "/categorias/ropa.jpeg",
    categoria: categoria,
  })) ?? []

  const categoriasFormateadas = categorias.map((cat) => ({
    id: cat.id,
    titulo: cat.name,
    slug: cat.slug,
    href: `/catalogo/${cat.slug}`,
    links: cat.children?.map((sub) => ({
      nombre: sub.name,
      slug: sub.slug,
      href: `/catalogo/${cat.slug}/${sub.slug}`,
    })) ?? [],
  }))

  return (
    <main>
      <BandaMarcaProducto />

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4">
        <Breadcrumbs categoria={categoria} subcategoria={subcategoria} />
      </div>

      <EncabezadoCatalogo
        eyebrow={categoria?.replace(/-/g, " ")}
        titulo={subcategoriaData?.name ?? subcategoria?.replace(/-/g, " ")}
        subtitulo="Cotiza por volumen y recibe en 10–15 días en toda Colombia."
        total={productos.length}
      />

      <PaginaCategoriaCliente
        categoria={categoria}
        categorias={categoriasFormateadas}
        productos={productos}
      />
    </main>
  )
}