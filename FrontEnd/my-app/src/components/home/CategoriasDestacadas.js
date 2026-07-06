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
    <section className="py-20 px-6 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">

        {/* TÍTULO */}
        <div className="w-full lg:w-[20%] mx-auto text-center lg:text-left">
          <h2 className="font-sans font-bold text-3xl md:text-3xl lg:text-4xl text-primary block">
            Productos
          </h2>
          <span className="font-cursiva text-3xl md:text-3xl lg:text-4xl text-dorado block lg:text-right">
            con calidad
          </span>
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

        {/* 💻 DESKTOP (solo desktop) */}
        <div className="hidden md:grid grid-cols-3 grid-rows-2 gap-2">
          {categorias.map((cat, index) => (
            <div
              key={cat.nombre}
              className={index === 0 ? "col-span-2 row-span-2" : ""}
            >
              <TarjetaCategoria
                nombre={cat.nombre}
                imagen={cat.imagen}
                href={cat.href}
                featured={index === 0}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}