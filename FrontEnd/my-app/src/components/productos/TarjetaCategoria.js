import Link from "next/link"
import Image from "next/image"

export function TarjetaCategoria({ nombre, imagen, href }) {
  return (
    <Link
      href={href}
      className="group relative block h-56 md:h-72 overflow-hidden rounded-2xl bg-gray-200 ring-1 ring-black/5 hover:shadow-[0_20px_50px_-20px_rgba(13,27,42,0.45)] hover:-translate-y-1 transition-all duration-300"
    >
      <Image
        src={imagen || "/categorias/ropa.jpeg"}
        alt={nombre}
        fill
        className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.07]"
        sizes="(max-width: 768px) 100vw, 33vw"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/35 to-transparent transition-all duration-300 group-hover:from-primary/95" />

      <div className="absolute inset-0 flex items-end p-5 md:p-6 z-10">
        <div className="flex flex-col gap-1.5">
          <span className="font-titulo font-bold text-white text-xl md:text-[1.75rem] leading-tight">
            {nombre}
          </span>

          <span className="inline-flex items-center gap-1 text-xs md:text-sm text-dorado opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            Ver categoría
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </Link>
  )
}