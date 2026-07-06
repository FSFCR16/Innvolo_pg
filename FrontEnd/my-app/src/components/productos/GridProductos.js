"use client"

import { useState } from "react"
import TarjetaProducto from "./TarjetaProducto"
import { FaSearch } from "react-icons/fa"

export default function GridProductos({ subcategoria, productosIniciales = [] }) {
  const [busqueda, setBusqueda] = useState("")

  const productosFiltrados = productosIniciales
    .filter((p) => !subcategoria || p.subcategoria === subcategoria)
    .filter((p) => {
      const texto = busqueda.toLowerCase()
      return (
        p.nombre.toLowerCase().includes(texto) ||
        p.descripcion?.toLowerCase().includes(texto) ||
        p.subcategoria?.toLowerCase().includes(texto)
      )
    })

  return (
    <div className="flex flex-col gap-5 anim-page">

      {/* Buscador */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gris/50 text-sm" />
        <input
          type="text"
          placeholder="Buscar producto…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F6F6F3] text-sm md:text-[15px] text-primary placeholder:text-gris/50 ring-1 ring-black/5 focus:outline-none focus:ring-dorado focus:bg-white transition"
        />
      </div>

      {/* Resultados */}
      <p className="text-[13px] text-gris/80">
        {productosFiltrados.length} {productosFiltrados.length === 1 ? "producto" : "productos"}
      </p>

      {/* Grid con animación */}
      {productosFiltrados.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 anim-grid">
          {productosFiltrados.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-gris/70 text-sm">
          No encontramos productos para “{busqueda}”.
        </div>
      )}

    </div>
  )
}