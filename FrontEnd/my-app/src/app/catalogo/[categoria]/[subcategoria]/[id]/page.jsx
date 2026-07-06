import { BandaMarcaProducto } from "@/components/layout/BandaMarcaProducto"
import DetalleProductoCliente from "@/components/productos/DetalleProductoCliente"
import { getProducto, getProductosRelacionados } from "@/lib/woocommerce/queries/productos"
import { getCategoria } from "@/lib/woocommerce/queries/categorias"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

export async function generateMetadata({ params }) {
  const { id } = await params
  const producto = await getProducto(id)
  return {
    title: `${producto?.name ?? id?.replace(/-/g, " ")} | INNVOLO`,
    description: `Producto personalizado para empresas.`,
  }
}

export default async function PaginaProducto({ params }) {
  const { categoria, subcategoria, id } = await params

  const idDecodificado = decodeURIComponent(id)

  const productoRaw = await getProducto(idDecodificado)

  const producto = productoRaw
    ? {
        id: productoRaw.id,
        nombre: productoRaw.name,
        slug: productoRaw.slug,
        descripcion: productoRaw.description,
        imagen: productoRaw.thumbnail?.url ?? "/categorias/ropa.jpeg",
        imagenes: productoRaw.images?.map((img) => img.url) ?? [],
        categoria: productoRaw.category?.parent?.slug ?? categoria,
        subcategoria: productoRaw.category?.slug ?? subcategoria,
        atributos: productoRaw.attributes?.map((attr) => ({
          nombre: attr.attribute.name,
          valor: attr.values.map((v) => v.name).join(", "),
        })) ?? [],
        model3dUrl: productoRaw.model3dUrl,
        tipo3d: productoRaw.tipo3d,
        customizationZones: productoRaw.customizationZones,
        coloresVariantes: productoRaw.coloresVariantes ?? [],
      }
    : null

  const categoriaData = await getCategoria(categoria)
  const relacionados = await getProductosRelacionados(categoriaData?.id)

  const relacionadosFiltrados = relacionados
    .filter((p) => String(p.id) !== String(idDecodificado))
    .map((p) => ({
      id: p.id,
      nombre: p.name,
      slug: p.slug,
      imagen: p.thumbnail?.url ?? "/categorias/ropa.jpeg",
      categoria,
      subcategoria,
    }))

  return (
    <main>
      <BandaMarcaProducto />

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4">
        <Breadcrumbs
          categoria={categoria}
          subcategoria={subcategoria}
          producto={producto?.nombre}
        />
      </div>

      <DetalleProductoCliente
        producto={producto}
        relacionados={relacionadosFiltrados}
        categoria={categoria}
        subcategoria={subcategoria}
      />
    </main>
  )
}