"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"

const imagenes = [
  { src: "/carrusel/1.webp", alt: "Dotación corporativa INNVOLO — chaleco, termo y mochila personalizados en una oficina" },
  { src: "/carrusel/2.webp", alt: "Productos personalizados INNVOLO para empresas" },
  { src: "/carrusel/3.webp", alt: "Bandera INNVOLO ondeando sobre la ciudad" },
  { src: "/carrusel/4.webp", alt: "Indumentaria corporativa personalizada INNVOLO" },
]

const stats = [
  { n: "10–15 días", k: "Entrega en Colombia" },
  { n: "+36", k: "Productos personalizables" },
  { n: "3D", k: "Previsualiza tu prenda" },
]

export default function Hero() {
  const [activa, setActiva] = useState(0)
  const inicioX = useRef(null)

  useEffect(() => {
    const intervalo = setInterval(() => {
      setActiva((actual) => (actual + 1) % imagenes.length)
    }, 6000)
    return () => clearInterval(intervalo)
  }, [])

  const ir = (delta) =>
    setActiva((a) => (a + delta + imagenes.length) % imagenes.length)

  // Arrastrar (mouse / trackpad / touch) para cambiar de imagen
  const onPointerDown = (e) => {
    inicioX.current = e.clientX
  }
  const onPointerUp = (e) => {
    if (inicioX.current == null) return
    const dx = e.clientX - inicioX.current
    inicioX.current = null
    if (dx > 50) ir(-1)
    else if (dx < -50) ir(1)
  }

  return (
    <section
      className="relative h-screen min-h-[600px] w-full overflow-hidden bg-primary select-none"
      style={{ touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >

      {/* Carrusel de imágenes (cross-fade) */}
      {imagenes.map((imagen, index) => (
        <Image
          key={imagen.src}
          src={imagen.src}
          alt={imagen.alt}
          fill
          priority={index === 0}
          sizes="100vw"
          draggable={false}
          className={`object-cover transition-opacity duration-[1200ms] ease-in-out ${
            index === activa ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Degradado navy: fuerte a la izquierda (legibilidad) y transparente a la
          derecha (deja ver la imagen). Base inferior suave. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/5" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/55 via-transparent to-primary/10" />

      {/* Contenido editorial — pt para no quedar bajo el navbar */}
      <div className="relative h-full max-w-7xl mx-auto px-6 md:px-8 flex items-center pt-24 pb-20 md:pt-36 md:pb-0">
        <div className="max-w-2xl flex flex-col anim-page">

          {/* Eyebrow */}
          <span className="text-[10px] md:text-xs font-bold tracking-[0.26em] uppercase text-dorado mb-4 md:mb-5">
            Dotación e indumentaria corporativa
          </span>

          {/* Titular Playfair + acento cursivo */}
          <h1 className="font-titulo font-semibold text-white text-[2.1rem] leading-[1.05] md:text-[4rem] md:leading-[1.03] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
            Vestimos la identidad<br className="hidden sm:block" /> de tu empresa
          </h1>
          <span className="font-cursiva text-dorado text-2xl md:text-5xl mt-1.5 md:mt-3">
            con diseño e innovación
          </span>

          {/* Subtítulo */}
          <p className="text-white/80 text-sm md:text-[15px] max-w-lg mt-5 md:mt-6 leading-relaxed">
            Diseñamos y producimos prendas y dotación para empresas que quieren
            proyectar identidad, estilo e innovación — en toda Colombia.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-7 md:mt-8">
            <Link
              href="/catalogo"
              className="px-7 py-3.5 rounded-lg bg-dorado text-primary text-xs md:text-sm font-bold tracking-widest uppercase inline-flex items-center gap-2 hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.99] transition"
            >
              Ver catálogo <span aria-hidden>→</span>
            </Link>
            <Link
              href="/contactanos"
              className="px-7 py-3.5 rounded-lg border-[1.5px] border-white/55 text-white text-xs md:text-sm font-bold tracking-widest uppercase hover:bg-white hover:text-primary hover:-translate-y-0.5 active:scale-[0.99] transition"
            >
              Cotizar ahora
            </Link>
          </div>

          {/* Datos de confianza */}
          <div className="flex flex-wrap gap-x-8 gap-y-4 md:gap-x-10 mt-8 md:mt-10">
            {stats.map((s) => (
              <div key={s.k} className="flex flex-col">
                <span className="font-titulo font-semibold text-dorado text-xl md:text-2xl leading-none">
                  {s.n}
                </span>
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.12em] text-white/60 mt-1.5">
                  {s.k}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Indicadores del carrusel (clickeables) */}
      <div className="absolute bottom-6 right-6 left-auto md:right-10 z-10 flex gap-2">
        {imagenes.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiva(i)}
            aria-label={`Ver imagen ${i + 1}`}
            aria-pressed={i === activa}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activa ? "w-7 bg-dorado" : "w-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

    </section>
  )
}
