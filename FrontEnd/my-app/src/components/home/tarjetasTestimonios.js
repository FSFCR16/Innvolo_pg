"use client"

import { FaUserCircle } from "react-icons/fa"
import { useEffect, useRef, useState } from "react"

export function TarjetaTestimonio({ nombre, texto }) {
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
    <div
      ref={ref}
      className={`
        flex flex-col gap-4 p-8 border border-white/20 rounded-lg
        transition-all duration-700 ease-out
        hover:border-dorado hover:shadow-lg
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
      `}
    >
      <p className="text-white/70 text-sm leading-relaxed italic">
        &quot;{texto}&quot;
      </p>

      <div className="flex items-center gap-3">
        <FaUserCircle className="text-dorado text-4xl" />
        <span className="font-bold text-white text-sm">{nombre}</span>
      </div>
    </div>
  )
}