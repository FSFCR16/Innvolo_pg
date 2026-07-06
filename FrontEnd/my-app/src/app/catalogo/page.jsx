import { BandaMarcaProducto } from "@/components/layout/BandaMarcaProducto"
import { EncabezadoCatalogo } from "@/components/productos/EncabezadoCatalogo"
import GridCategorias from "@/components/productos/GridCategorias"

// WooCommerce corre local y se expone por ngrok de forma intermitente. En vez de
// pegar a la PC en cada visita (la saturaba y devolvía "0 productos"), usamos ISR:
// la ruta se regenera a lo sumo cada 5 min y Vercel sirve la última versión buena.
export const revalidate = 300

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