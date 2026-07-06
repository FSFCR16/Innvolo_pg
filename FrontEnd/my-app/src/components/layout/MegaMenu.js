"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

export function MegaMenu({ abierto, categorias = [], cerrar }) {
  // Filtrar "Sin categorizar"
  const categoriasVisibles = categorias.filter((cat) => {
    const nombre = (cat.name || "").toLowerCase().trim()
    const slug = (cat.slug || "").toLowerCase().trim()
    return (
      nombre !== "sin categorizar" &&
      nombre !== "uncategorized" &&
      slug !== "sin-categorizar" &&
      slug !== "uncategorized"
    )
  })

  const categoriasFormateadas = categoriasVisibles.map((cat) => ({
    id: cat.id,
    titulo: cat.name,
    href: `/catalogo/${cat.slug}`,
    links: cat.children?.map((sub) => ({
      nombre: sub.name,
      href: `/catalogo/${cat.slug}/${sub.slug}`
    })) ?? []
  }))

  const [categoriaActiva, setCategoriaActiva] = useState(0)

  // Resetear a la primera al abrir
  useEffect(() => {
    if (abierto) setCategoriaActiva(0)
  }, [abierto])

  if (categoriasFormateadas.length === 0) return null

  const activa = categoriasFormateadas[categoriaActiva]

  return (
    <div
      className={`megamenu relative w-full shadow-2xl overflow-hidden transition-all duration-500 ease-out ${
        abierto ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        background: "linear-gradient(135deg, #0D1B2A 0%, #0a1520 60%, #1a2d40 100%)",
        maxHeight: abierto ? "600px" : "0",
      }}
    >
      {/* Patrón decorativo de fondo */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, #D4AF37 1px, transparent 1px),
            radial-gradient(circle at 80% 70%, #D4AF37 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px, 60px 60px",
        }}
      />

      {/* Línea dorada superior */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-dorado to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-12 py-12 relative">
        <div className="grid grid-cols-12 gap-12">

          {/* IZQUIERDA: Lista de categorías como navegación vertical */}
          <div className="col-span-4">
            <div className="mb-6 flex items-center gap-3">
              <span className="text-dorado text-[10px] tracking-[0.3em] uppercase font-bold">
                Categorías
              </span>
              <span className="flex-1 h-px bg-dorado/30" />
              <span className="text-white/30 text-[10px] font-mono">
                {String(categoriasFormateadas.length).padStart(2, "0")}
              </span>
            </div>

            <ul className="flex flex-col">
              {categoriasFormateadas.map((cat, idx) => {
                const esActiva = idx === categoriaActiva
                return (
                  <li
                    key={cat.id}
                    onMouseEnter={() => setCategoriaActiva(idx)}
                    className="group relative"
                  >
                    <Link
                      href={cat.href}
                      onClick={cerrar}
                      className={`flex items-center justify-between py-3 px-1 border-b border-white/5 transition-all duration-300 ${
                        esActiva ? "pl-4" : "pl-1"
                      }`}
                    >
                      {/* Indicador izquierdo animado */}
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-dorado transition-all duration-300 ${
                          esActiva ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                        }`}
                      />

                      <div className="flex items-center gap-4 min-w-0">
                        <span
                          className={`text-[10px] font-mono transition-colors duration-300 ${
                            esActiva ? "text-dorado" : "text-white/30"
                          }`}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`text-sm font-medium tracking-wide transition-colors duration-300 ${
                            esActiva ? "text-white" : "text-white/60 group-hover:text-white/90"
                          }`}
                        >
                          {cat.titulo}
                        </span>
                      </div>

                      {/* Flecha que aparece en activa */}
                      <span
                        className={`text-dorado transition-all duration-300 ${
                          esActiva ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                        }`}
                      >
                        →
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* DERECHA: Preview de la categoría activa */}
          <div className="col-span-8 relative min-h-[340px]">
            {categoriasFormateadas.map((cat, idx) => {
              const esActiva = idx === categoriaActiva
              return (
                <div
                  key={cat.id}
                  className={`absolute inset-0 transition-all duration-500 ${
                    esActiva
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-8 pointer-events-none"
                  }`}
                >
                  {/* Header de la categoría activa */}
                  <div className="mb-8 flex items-end justify-between">
                    <div>
                      <span className="text-dorado text-[10px] tracking-[0.3em] uppercase font-bold">
                        Explorando
                      </span>
                      <h3 className="text-white text-4xl font-light mt-2 leading-none">
                        {cat.titulo}
                      </h3>
                    </div>
                    <Link
                      href={cat.href}
                      onClick={cerrar}
                      className="text-dorado text-[11px] tracking-[0.2em] uppercase font-semibold border-b border-dorado/40 hover:border-dorado pb-1 transition-all duration-200 whitespace-nowrap"
                    >
                      Ver categoría
                    </Link>
                  </div>

                  {/* Grid de subcategorías como tarjetas */}
                  {cat.links.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {cat.links.map((link, lidx) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={cerrar}
                          className="group relative bg-white/[0.03] hover:bg-dorado/10 border border-white/5 hover:border-dorado/40 rounded-md px-4 py-3 transition-all duration-300 overflow-hidden"
                          style={{
                            transitionDelay: esActiva ? `${lidx * 30}ms` : "0ms",
                          }}
                        >
                          {/* Brillo diagonal en hover */}
                          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-dorado/10 to-transparent" />

                          <div className="relative flex items-center justify-between">
                            <span className="text-white/80 group-hover:text-white text-[13px] font-medium tracking-wide">
                              {link.nombre}
                            </span>
                            <span className="text-dorado opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300 text-xs">
                              ↗
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-white/40 text-sm italic">
                      Próximamente disponible
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </div>

      {/* Línea dorada inferior */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-dorado to-transparent opacity-30" />
    </div>
  )
}