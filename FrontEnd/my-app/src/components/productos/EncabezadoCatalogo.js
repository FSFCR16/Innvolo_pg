// Encabezado editorial para las páginas de catálogo / categoría / subcategoría.
// Mismo lenguaje que la product page: regla dorada + eyebrow + título Playfair.

export function EncabezadoCatalogo({ eyebrow, titulo, subtitulo, total }) {
  return (
    <header className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12 pb-2 anim-page">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="h-px w-8 bg-dorado" />
        {eyebrow && (
          <p className="text-[11px] font-semibold tracking-[0.22em] text-dorado uppercase">
            {eyebrow}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-titulo font-bold text-[2rem] md:text-[3rem] leading-[1.02] text-primary capitalize">
          {titulo}
        </h1>
        {typeof total === "number" && (
          <span className="text-[13px] text-gris pb-2">
            {total} {total === 1 ? "producto" : "productos"}
          </span>
        )}
      </div>

      {subtitulo && (
        <p className="text-gris text-[15px] leading-relaxed max-w-2xl mt-3">
          {subtitulo}
        </p>
      )}
    </header>
  )
}
