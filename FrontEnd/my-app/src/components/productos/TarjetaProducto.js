"use client"

import Image from "next/image"
import Link from "next/link"

export default function TarjetaProducto({ producto }) {
  return (
    <Link
      href={`/catalogo/${producto.categoria}/${producto.subcategoria}/${producto.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white ring-1 ring-black/5 hover:ring-black/10 hover:shadow-[0_18px_45px_-18px_rgba(13,27,42,0.35)] hover:-translate-y-1 transition-all duration-300 active:scale-[0.99] anim-card"
    >
      {/* Imagen */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F6F6F3]">
        <Image
          src={producto.imagen}
          alt={producto.nombre}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover transition-transform duration-[600ms] ease-out md:group-hover:scale-[1.06]"
        />
        {/* velo sutil al hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className="p-4 md:p-5 flex flex-col gap-1.5">
        {producto.subcategoria && (
          <span className="text-[10px] md:text-[11px] text-dorado uppercase tracking-[0.18em]">
            {producto.subcategoria.replace(/-/g, " ")}
          </span>
        )}

        <h3 className="text-[15px] md:text-base font-semibold text-primary leading-snug line-clamp-2">
          {producto.nombre}
        </h3>

        {producto.descripcion && (
          <p className="text-xs md:text-sm text-gris line-clamp-2">
            {producto.descripcion}
          </p>
        )}

        <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-primary group-hover:text-dorado transition-colors">
          Ver producto
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  )
}
