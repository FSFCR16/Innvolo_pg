"use client"

import Link from "next/link"

export function Breadcrumbs({ categoria, subcategoria, producto }) {
  return (
    <div className="text-xs md:text-sm text-gris flex flex-wrap gap-2">

      <Link href="/" className="hover:text-dorado">
        Inicio
      </Link>

      {categoria && (
        <>
          <span>/</span>
          <Link href={`/catalogo/${categoria}`} className="hover:text-dorado">
            {categoria.replace(/-/g, " ")}
          </Link>
        </>
      )}

      {subcategoria && (
        <>
          <span>/</span>
          <Link
            href={`/catalogo/${categoria}/${subcategoria}`}
            className="hover:text-dorado"
          >
            {subcategoria.replace(/-/g, " ")}
          </Link>
        </>
      )}

      {producto && (
        <>
          <span>/</span>
          <span className="text-primary font-bold">
            {producto}
          </span>
        </>
      )}

    </div>
  )
}