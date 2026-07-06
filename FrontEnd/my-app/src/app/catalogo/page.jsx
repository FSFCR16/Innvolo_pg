import { BandaMarcaProducto } from "@/components/layout/BandaMarcaProducto"
import { EncabezadoCatalogo } from "@/components/productos/EncabezadoCatalogo"
import GridCategorias from "@/components/productos/GridCategorias"

// WooCommerce corre local y se expone por ngrok de forma intermitente:
// forzamos fetch en cada visita en vez de depender de una regeneración cacheada.
export const dynamic = "force-dynamic"

export const metadata = {
  title: "Catalogo | INNVOLO",
  description:
    "Catálogo de productos corporativos personalizados — ropa, dotación, recipientes, promocionales y más.",
}

export default function Productos() {
  return (
    <main>
      <BandaMarcaProducto />

      <EncabezadoCatalogo
        eyebrow="Catálogo"
        titulo="Productos que dejan marca"
        subtitulo="Explora nuestra dotación corporativa y artículos promocionales. Cotiza por volumen y recibe en 10–15 días en toda Colombia."
      />

      <GridCategorias conHeader={false} />
    </main>
  )
}