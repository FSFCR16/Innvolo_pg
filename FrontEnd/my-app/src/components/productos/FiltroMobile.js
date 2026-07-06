"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaSlidersH, FaTimes } from "react-icons/fa"

export default function FiltroMobile({ categorias }) {
  const [abierto, setAbierto] = useState(false)
  const router = useRouter()

  const irA = (url) => {
    setAbierto(false)
    router.push(url)
  }

  return (
    <>
      {/* Botón */}
      <button
        onClick={() => setAbierto(true)}
        className="md:hidden flex items-center gap-2 border px-4 py-2 text-sm"
      >
        <FaSlidersH />
        Filtrar
      </button>

      {/* Drawer */}
      <div className={`fixed inset-0 z-50 ${abierto ? "block" : "hidden"}`}>
        
        {/* Fondo */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setAbierto(false)}
        />

        {/* Panel */}
        <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto">

          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">Filtros</h2>
            <FaTimes onClick={() => setAbierto(false)} className="cursor-pointer" />
          </div>

          {categorias.map((cat) => (
            <div key={cat.id} className="mb-4">

              {/* 🔥 CATEGORIA NAVEGA */}
              <button
                onClick={() => irA(cat.href)}
                className="font-bold mb-2 block text-left w-full"
              >
                {cat.titulo}
              </button>

              {/* SUBCATEGORIAS */}
              {cat.links.map((sub) => (
                <button
                  key={sub.slug}
                  onClick={() => irA(sub.href)}
                  className="block text-left w-full py-1 text-sm text-gris hover:text-dorado"
                >
                  {sub.nombre}
                </button>
              ))}

            </div>
          ))}

        </div>
      </div>
    </>
  )
}