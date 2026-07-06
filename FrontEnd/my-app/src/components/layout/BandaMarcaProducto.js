import { FiTruck, FiClock, FiShield } from "react-icons/fi"
import { EYEBROW, BADGES } from "@/lib/config/cotizacion"

// Hero delgado de marca para la página de producto.
// Reemplaza al hero-banner (que duplicaba imagen + nombre del producto).
// `variante` selecciona el diseño: "simetrico" | "confianza" | "cinta" | "atmosferico".

const ICONOS_BADGE = { envio: FiTruck, entrega: FiClock, calidad: FiShield }

// Textura de grano sutil (compartida por las variantes atmosféricas)
const GRANO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"

export function BandaMarcaProducto({ variante = "premium" }) {
  if (variante === "simetrico") return <BandaSimetrico />
  if (variante === "confianza") return <BandaConfianza />
  if (variante === "cinta") return <BandaCinta />
  if (variante === "atmosferico") return <BandaAtmosferico />
  return <BandaPremium />
}

/* === ★ Premium (B + D): fondo atmosférico + eyebrow izq + sellos der === */
function BandaPremium() {
  return (
    <section
      className="relative text-white anim-page overflow-hidden"
      style={{ background: "linear-gradient(100deg, #0A1622 0%, #0D1B2A 45%, #102438 100%)" }}
    >
      {/* halo dorado */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(480px 130px at 38% 50%, rgba(201,168,76,0.16), transparent 70%)" }}
      />
      {/* grano sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: GRANO, backgroundSize: "120px 120px" }}
      />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center gap-3">
        <p className="text-[11px] md:text-xs font-semibold tracking-[0.25em] uppercase">
          {EYEBROW}
        </p>
        <div className="ml-auto hidden md:flex items-center gap-5">
          {BADGES.map((b) => {
            const Icono = ICONOS_BADGE[b.icono]
            return (
              <span key={b.icono} className="inline-flex items-center gap-1.5 text-[11px] text-white/85">
                {Icono && <Icono className="text-dorado text-sm" />}
                {b.texto}
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* === A) Simétrico minimal === */
function BandaSimetrico() {
  return (
    <section className="bg-primary text-white anim-page">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-center gap-4">
        <span className="h-px w-8 md:w-14 bg-dorado/70 shrink-0" />
        <p className="text-[11px] md:text-xs font-semibold tracking-[0.28em] uppercase text-center">
          {EYEBROW}
        </p>
        <span className="h-px w-8 md:w-14 bg-dorado/70 shrink-0" />
      </div>
    </section>
  )
}

/* === B) Con micro-confianza === */
function BandaConfianza() {
  return (
    <section className="bg-primary text-white anim-page">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center gap-3">
        <span className="h-px w-8 bg-dorado shrink-0" />
        <p className="text-[11px] md:text-xs font-semibold tracking-[0.25em] uppercase">
          {EYEBROW}
        </p>
        <div className="ml-auto hidden md:flex items-center gap-5">
          {BADGES.map((b) => {
            const Icono = ICONOS_BADGE[b.icono]
            return (
              <span key={b.icono} className="inline-flex items-center gap-1.5 text-[11px] text-white/80">
                {Icono && <Icono className="text-dorado text-sm" />}
                {b.texto}
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* === C) Cinta animada (marquee) === */
// Un track con el texto repetido; se renderiza dos veces para un loop continuo.
const CINTA_TRACK = (
  <div className="flex shrink-0 animate-marquee" aria-hidden="true">
    {Array.from({ length: 8 }).map((_, i) => (
      <span key={i} className="inline-flex items-center text-[11px] md:text-xs font-semibold tracking-[0.28em] uppercase whitespace-nowrap">
        {EYEBROW}
        <span className="mx-5 text-dorado">●</span>
      </span>
    ))}
  </div>
)

function BandaCinta() {
  return (
    <section className="bg-primary text-white anim-page overflow-hidden marquee-pausa">
      <p className="sr-only">{EYEBROW}</p>
      <div className="py-3.5 flex w-max">
        {CINTA_TRACK}
        {CINTA_TRACK}
      </div>
    </section>
  )
}

/* === D) Atmosférico (degradado + grano + glow) === */
function BandaAtmosferico() {
  return (
    <section
      className="relative text-white anim-page overflow-hidden"
      style={{ background: "linear-gradient(100deg, #0A1622 0%, #0D1B2A 45%, #102438 100%)" }}
    >
      {/* glow dorado detrás del texto */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(420px 120px at 50% 50%, rgba(201,168,76,0.18), transparent 70%)" }}
      />
      {/* grano sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: GRANO, backgroundSize: "120px 120px" }}
      />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-center">
        <p className="text-[11px] md:text-[13px] font-semibold tracking-[0.3em] uppercase text-center">
          {EYEBROW}
        </p>
      </div>
    </section>
  )
}
