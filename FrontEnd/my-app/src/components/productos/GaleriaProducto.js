"use client"

// ============================================================
//  GaleriaProducto — carrusel de imágenes del producto + vista 3D.
//  El 3D es solo de exhibición (gira). La personalización se retiró.
// ============================================================

import { useState, useEffect } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { FiChevronLeft, FiChevronRight, FiRotateCw } from "react-icons/fi"

const VisorProducto3D = dynamic(
  () => import("@/components/visor3d/VisorProducto3D"),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#F4F4F2] animate-pulse" />,
  }
)

export default function GaleriaProducto({ imagenes = [], imagenFallback, model3dUrl, color, nombre, onVistaChange }) {
  // Lista de imágenes a mostrar (al menos el fallback)
  const imgs = imagenes.length > 0 ? imagenes : (imagenFallback ? [imagenFallback] : [])

  // Vista activa: índice numérico de imagen, o "3d".
  // El 3D va primero cuando el producto tiene modelo.
  const [vista, setVista] = useState(model3dUrl ? "3d" : 0)

  const en3D = vista === "3d"

  // Notifica al padre si la vista activa es 3D (para habilitar/no el selector de color).
  useEffect(() => {
    onVistaChange?.(en3D)
  }, [en3D, onVistaChange])
  const idxActual = typeof vista === "number" ? vista : 0

  const irA = (delta) => {
    if (imgs.length === 0) return
    setVista((idxActual + delta + imgs.length) % imgs.length)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* === Viewport principal === */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_50%_38%,#ffffff_0%,#eceae5_100%)] ring-1 ring-black/5">
        {en3D ? (
          <VisorProducto3D modelUrl={model3dUrl} color={color} />
        ) : (
          imgs.length > 0 && (
            <Image
              key={idxActual}
              src={imgs[idxActual]}
              alt={nombre}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover anim-card"
              priority
            />
          )
        )}

        {/* Flechas (solo en modo imagen y con +1 imagen) */}
        {!en3D && imgs.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => irA(-1)}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 backdrop-blur flex items-center justify-center text-primary shadow-sm opacity-0 group-hover:opacity-100 transition hover:bg-white"
            >
              <FiChevronLeft className="text-lg" />
            </button>
            <button
              type="button"
              onClick={() => irA(1)}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 backdrop-blur flex items-center justify-center text-primary shadow-sm opacity-0 group-hover:opacity-100 transition hover:bg-white"
            >
              <FiChevronRight className="text-lg" />
            </button>
          </>
        )}

        {/* Indicador 360° cuando está en 3D */}
        {en3D && (
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-primary/85 text-white text-[11px] font-medium px-3 py-1.5 backdrop-blur">
            <FiRotateCw className="text-sm" /> Arrastra para girar
          </span>
        )}
      </div>

      {/* === Miniaturas === */}
      {(imgs.length > 1 || model3dUrl) && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {imgs.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setVista(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`relative shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl overflow-hidden transition ${
                !en3D && idxActual === i
                  ? "ring-2 ring-dorado ring-offset-2"
                  : "ring-1 ring-black/10 hover:ring-black/25"
              }`}
            >
              <Image src={src} alt="" fill sizes="72px" className="object-cover" />
            </button>
          ))}

          {/* Chip de vista 3D */}
          {model3dUrl && (
            <button
              type="button"
              onClick={() => setVista("3d")}
              aria-label="Ver en 3D"
              className={`shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl flex flex-col items-center justify-center gap-0.5 transition ${
                en3D
                  ? "bg-primary text-white ring-2 ring-dorado ring-offset-2"
                  : "bg-[#F6F6F3] text-primary ring-1 ring-black/10 hover:ring-black/25"
              }`}
            >
              <FiRotateCw className="text-xl" />
              <span className="text-[10px] font-semibold tracking-wide">3D</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
