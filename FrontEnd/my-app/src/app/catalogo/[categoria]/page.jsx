import { BandaMarcaProducto } from "@/components/layout/BandaMarcaProducto"
import { EncabezadoCatalogo } from "@/components/productos/EncabezadoCatalogo"
import { PaginaCategoriaCliente } from "@/components/productos/PaginaCategoriaCliente"
import { getCategorias, getCategoria } from "@/lib/woocommerce/queries/categorias"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

export async function generateMetadata({ params }) {
  const { categoria } = await params
  return {
    title: `${categoria?.replace(/-/g, " ") || ""} | INNVOLO`,
    description: `Productos de ${categoria?.replace(/-/g, " ") || ""} personalizados para empresas.`,
  }
}

export default async function PaginaCategoria({ params }) {
  const { categoria } = await params

  const [categoriaData, categorias] = await Promise.all([
    getCategoria(categoria),
    getCategorias(),
  ])

  const productos = categoriaData?.products?.map((p) => ({
    id: p.id,
    nombre: p.name,
    slug: p.slug,
    descripcion: "",
    subcategoria: categoria,
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
        <Breadcrumbs categoria={categoria} />
      </div>

      <EncabezadoCatalogo
        eyebrow="Categoría"
        titulo={categoriaData?.name ?? categoria?.replace(/-/g, " ")}
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