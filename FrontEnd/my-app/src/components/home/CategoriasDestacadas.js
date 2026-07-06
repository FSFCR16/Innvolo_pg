// src/components/home/CategoriasDestacadas.js
import { TarjetaCategoria } from "./tarjetasCategorias.js"

const categorias = [
  { nombre: "Ropa corporativa", imagen: "/categorias/ropa.jpeg", href: "/catalogo/ropa-corporativa" },
  { nombre: "Dotación", imagen: "/categorias/dotacion.jpeg", href: "/catalogo/indumentaria-y-dotacion" },
  { nombre: "Recipientes", imagen: "/categorias/recipientes.jpeg", href: "/catalogo/recipientes-personalizados" },
  { nombre: "Promocionales", imagen: "/categorias/promocionales.jpeg", href: "/catalogo/oficina-y-promocionales" },
  { nombre: "Textiles", imagen: "/categorias/textiles.jpeg", href: "/catalogo/textiles-promocionales" },
  { nombre: "Mascotas", imagen: "/categorias/mascotas.jpeg", href: "/catalogo/productos-para-mascotas" },
]

export default function CategoriasDestacadas() {
  return (
    <section className="py-14 md:py-20 px-6 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-10 md:gap-12">

        {/* TÍTULO */}
        <div className="flex flex-col items-center text-center gap-2.5 max-w-xl mx-auto">
          <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-dorado">
            Catálogo
          </span>
          <h2 className="font-titulo font-semibold text-[1.9rem] md:text-[2.5rem] leading-tight text-primary">
            Productos con calidad
          </h2>
        </div>

        {/* 📱 MOBILE (solo mobile) */}
        <div className="flex gap-4 overflow-x-auto pb-4 md:hidden">
          {categorias.map((cat, index) => (
            <div
              key={cat.nombre}
              className={index === 0 ? "min-w-[90%] shrink-0" : "min-w-[85%] shrink-0"}
            >
              <TarjetaCategoria
                nombre={cat.nombre}
                imagen={cat.imagen}
                href={cat.href}
              />
            </div>
          ))}
        </div>

        {/* 💻 DESKTOP (grid uniforme 3×2, balanceado) */}
        <div className="hidden md:grid grid-cols-3 gap-3">
          {categorias.map((cat) => (
            <TarjetaCategoria
              key={cat.nombre}
              nombre={cat.nombre}
              imagen={cat.imagen}
              href={cat.href}
            />
          ))}
        </div>

      </div>
    </section>
  )
}