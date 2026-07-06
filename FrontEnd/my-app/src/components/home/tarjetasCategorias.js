"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export function TarjetaCategoria({ nombre, imagen, href, featured = false }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (ref.current) observer.observe(ref.current)
  }, [])

  return (
    <Link
      ref={ref}
      href={href}
      className={`
        relative block w-full overflow-hidden group rounded-lg
        transition-all duration-700 ease-out
        ${featured ? "h-full" : "h-64"}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
      `}
    >

      <Image
        src={imagen}
        alt={nombre}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />

      {/* badge featured */}
      {featured && (
        <span className="absolute top-4 left-4 bg-dorado text-white text-xs px-3 py-1 tracking-widest uppercase z-10">
          Destacado
        </span>
      )}

      {/* texto */}
      <span className="absolute bottom-4 left-4 text-white font-bold text-lg md:text-xl tracking-widest uppercase z-10">
        {nombre}
      </span>

    </Link>
  )
}