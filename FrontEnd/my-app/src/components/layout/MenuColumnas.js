import Link from "next/link"

// Componente legacy mantenido por compatibilidad si se importa en otro lado
export function MenuColumna({ titulo, href, links }) {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href={href}
        className="text-dorado font-semibold text-[11px] tracking-[0.2em] uppercase hover:text-white transition-colors"
      >
        {titulo}
      </Link>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-white/60 hover:text-dorado text-[13px] transition-colors">
              {link.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}