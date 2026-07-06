"use client"

import SidebarCategorias from "./SidebarCategorias"
import GridProductos from "./GridProductos"
import FiltroMobile from "./FiltroMobile"

export function PaginaCategoriaCliente({ categoria, categorias, productos }) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-6 md:gap-12 anim-page">

      {/* Mobile */}
      <div className="md:hidden">
        <FiltroMobile categorias={categorias} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <SidebarCategorias
          categoriaActiva={categoria}
          categorias={categorias}
        />
      </div>

      {/* Productos */}
      <div className="flex-1 flex flex-col gap-6">
        <GridProductos productosIniciales={productos} />
      </div>

    </section>
  )
}