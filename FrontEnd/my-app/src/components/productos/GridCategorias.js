import { TarjetaCategoria } from "@/components/productos/TarjetaCategoria"
import { getCategorias } from "@/lib/woocommerce/queries/categorias"

export default async function GridCategorias({ conHeader = false }) {
  const categorias = await getCategorias()

  return (
    <section className="py-10 md:py-16 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-10 md:gap-12">
        {conHeader && (
          <div className="max-w-xl flex flex-col gap-3 anim-page">
            <h2 className="text-xl md:text-3xl font-bold text-primary">
              Explora nuestras categorías
            </h2>
            <p className="text-sm md:text-base text-gris">
              Encuentra el producto ideal para tu empresa o evento.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {categorias.map((cat, index) => (
            <div
              key={cat.id}
              className="anim-card"
              style={{
                animationDelay: `${index * 0.05}s`,
                animationFillMode: "both",
              }}
            >
              <TarjetaCategoria
                nombre={cat.name}
                imagen={cat.image?.url ?? "/categorias/ropa.jpeg"}
                href={`/catalogo/${cat.slug}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}