"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function Hero() {

  const imagenes = [
    { src: "/hero/hero_uno.jpeg", alt: "Uniformes corporativos personalizados INNVOLO" },
    { src: "/hero/hero_dos.jpeg", alt: "Dotación empresarial de alta calidad INNVOLO" },
    { src: "/hero/hero_tres.jpeg", alt: "Ropa corporativa personalizada con logo INNVOLO" },
    { src: "/hero/hero_cuatro.jpeg", alt: "Indumentaria y dotación para empresas INNVOLO" },
  ]

  const [imagenActiva, setImagenActiva] = useState(0)

  useEffect(() => {
    const intervalo = setInterval(() => {
      setImagenActiva((actual) => (actual + 1) % imagenes.length)
    }, 5000)
    return () => clearInterval(intervalo)
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden">

      {/* Imágenes de fondo */}
      {imagenes.map((imagen, index) => (
        <Image
          key={imagen.src}
          src={imagen.src}
          alt={imagen.alt}
          fill
          priority={index === 0}
          className={`object-cover transition-opacity duration-1000 ${
            index === imagenActiva ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/65 to-primary/90" />

      {/* Texto */}
      <div className="absolute inset-0 flex flex-col justify-center items-center gap-6 px-6 md:px-24 text-center">

        {/* Desktop EXACTO / Mobile ajustado */}
        <h1 className="font-sans font-bold text-3xl md:text-6xl text-white leading-tight text-center md:text-start">
          Somos una<br/>
          <span className="ml-0 md:ml-16">empresa de</span>
        </h1>

        {/* Desktop intacto */}
        <h2 className="font-cursiva text-2xl md:text-5xl text-dorado">
          dotación e indumentaria
        </h2>

        {/* SOLO FIX ancho mobile */}
        <div className="flex flex-col gap-2 w-full max-w-md md:max-w-none">
          <p className="text-white/80 text-sm">Diseñamos y producimos prendas</p>
          <p className="text-white/80 text-sm">
            Para empresas que quieren proyectar identidad, estilo e innovación.
          </p>
        </div>

        {/* Botón igual (solo padding mobile leve) */}
        <Link
          href="/contactanos"
          className="mt-2 px-8 md:px-10 py-3 bg-white text-primary text-sm tracking-widest uppercase font-bold hover:bg-dorado hover:text-white transition-colors duration-300"
        >
          Cotiza ya
        </Link>

      </div>
    </div>
  )
}