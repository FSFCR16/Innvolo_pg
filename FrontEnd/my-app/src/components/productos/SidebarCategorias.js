"use client"

import { useState } from "react"
import Link from "next/link"
import { FaChevronDown, FaChevronUp } from "react-icons/fa"

export default function SidebarCategorias({
  categoriaActiva,
  subcategoriaActiva,
  categorias
}) {
  const [abierta, setAbierta] = useState(categoriaActiva)

  return (
    <aside className="w-64 shrink-0">
      <div className="sticky top-24 flex flex-col gap-6">

        <div>
          <span className="block h-px w-8 bg-dorado mb-3" />
          <h2 className="font-titulo font-bold text-2xl text-primary leading-tight">
            Categorías
          </h2>
          <span className="font-cursiva text-lg text-dorado">
            de productos
          </span>
        </div>

        <ul className="flex flex-col gap-2">
          {categorias.map((cat) => (
            <li key={cat.id}>

              {/* 🔥 Categoria clickeable */}
              <div className="flex items-center justify-between">

                <Link
                  href={cat.href}
                  className="text-sm font-bold text-primary hover:text-dorado transition"
                >
                  {cat.titulo}
                </Link>

                <button
                  onClick={() =>
                    setAbierta(abierta === cat.slug ? null : cat.slug)
                  }
                  className="p-1"
                >
                  {abierta === cat.slug ? (
                    <FaChevronUp size={12} />
                  ) : (
                    <FaChevronDown size={12} />
                  )}
                </button>

              </div>

              {/* Subcategorias */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  abierta === cat.slug ? "max-h-96" : "max-h-0"
                }`}
              >
                <ul className="flex flex-col gap-1 pl-3 pb-2 border-l border-dorado/30">
                  {cat.links.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={sub.href}
                        className={`block py-1 text-sm transition ${
                          subcategoriaActiva === sub.slug
                            ? "text-dorado font-bold"
                            : "text-gris hover:text-dorado"
                        }`}
                      >
                        {sub.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </li>
          ))}
        </ul>

      </div>
    </aside>
  )
}