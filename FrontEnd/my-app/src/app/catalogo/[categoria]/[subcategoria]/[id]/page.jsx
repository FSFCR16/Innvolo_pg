import { BandaMarcaProducto } from "@/components/layout/BandaMarcaProducto"
import DetalleProductoCliente from "@/components/productos/DetalleProductoCliente"
import { getProducto, getProductosRelacionados } from "@/lib/woocommerce/queries/productos"
import { getCategoria } from "@/lib/woocommerce/queries/categorias"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

// WooCommerce corre local y se expone por ngrok de forma intermitente:
// forzamos fetch en cada visita en vez de depender de una regeneración cacheada.
export const dynamic = "force-dynamic"

// "Negro, Blanco, Azul (otros bajo consulta)" -> ["Negro","Blanco","Azul"]
function parsearColores(str) {
  if (!str) return []
  return str
    .replace(/\([^)]*\)/g, "")      // quita paréntesis "(otros bajo consulta)"
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
}

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
        // Datos reales de Woo (Excel) para la ficha dinámica
        tramosPrecio: productoRaw.tramosPrecio ?? null,
        materiales: productoRaw.materiales ?? null,
        tecnicaRecomendada: productoRaw.tecnicaRecomendada ?? null,
        coloresDisponibles: parsearColores(productoRaw.coloresDisponibles),
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