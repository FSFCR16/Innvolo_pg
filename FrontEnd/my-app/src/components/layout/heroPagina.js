import Image from "next/image"

export function HeroPagina({ titulo, subtitulo, imagen }) {
  return (
    <div className="relative h-[200px] md:h-[300px] lg:h-[400px] overflow-hidden anim-page">

      {/* Imagen */}
      <Image
        src={imagen}
        alt={titulo}
        fill
        className="object-cover scale-105"
        priority
      />

      {/* Overlay pro */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />

      {/* Contenido */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="text-center">

          <h1 className="font-sans font-bold text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-white tracking-widest uppercase leading-tight">
            {titulo}
          </h1>

          {subtitulo && (
            <span className="font-cursiva text-lg sm:text-xl md:text-3xl lg:text-4xl text-dorado block mt-1">
              {subtitulo}
            </span>
          )}

        </div>
      </div>

    </div>
  )
}