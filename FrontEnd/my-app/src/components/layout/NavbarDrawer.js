"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa"

export default function NavbarDrawer({ abierto, onCerrar, categorias }) {
  const [categoriaAbierta, setCategoriaAbierta] = useState(null)

  return (
    <>
      {/* Overlay */}
      {abierto && (
        <div
          className="fixed inset-0 bg-black/60 z-50 md:hidden"
          onClick={onCerrar}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-primary z-50 transform transition-transform duration-300 md:hidden overflow-y-auto ${
        abierto ? "translate-x-0" : "translate-x-full"
      }`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dorado/20">
          <Image src="/logo_innvolo.png" alt="INNVOLO" width={80} height={40} />
          <button onClick={onCerrar} className="text-white hover:text-dorado transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Links principales */}
        <div className="px-6 py-6 flex flex-col gap-1 border-b border-dorado/20">
          <Link href="/" className="text-white tracking-widest text-sm uppercase py-3 hover:text-dorado transition-colors">
            Inicio
          </Link>
          <Link href="/contactanos" className="text-white tracking-widest text-sm uppercase py-3 hover:text-dorado transition-colors">
            Contáctanos
          </Link>
          <Link href="/nosotros" className="text-white tracking-widest text-sm uppercase py-3 hover:text-dorado transition-colors">
            Nosotros
          </Link>
        </div>

        {/* Categorías */}
        <div className="px-6 py-4">
          <p className="text-dorado text-xs tracking-widest uppercase font-bold mb-4">Catálogo</p>
          <div className="flex flex-col gap-1">
            {categorias.map((cat) => (
              <div key={cat.id}>
                <button
                  onClick={() => setCategoriaAbierta(categoriaAbierta === cat.id ? null : cat.id)}
                  className="w-full flex items-center justify-between py-3 text-white text-sm tracking-wide hover:text-dorado transition-colors"
                >
                  {cat.titulo}
                  {categoriaAbierta === cat.id
                    ? <FaChevronUp size={10} className="text-dorado" />
                    : <FaChevronDown size={10} />
                  }
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${
                  categoriaAbierta === cat.id ? "max-h-96" : "max-h-0"
                }`}>
                  <div className="pl-4 pb-3 flex flex-col gap-2 border-l border-dorado/30">
                    <Link href={cat.href} className="text-dorado text-xs tracking-widest uppercase py-1 hover:text-white transition-colors">
                      Ver todos
                    </Link>
                    {cat.links.map((link) => (
                      <Link key={link.href} href={link.href} className="text-white/60 text-sm py-1 hover:text-dorado transition-colors">
                        {link.nombre}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón cotizar */}
        <div className="px-6 py-6">
          <Link
            href="/contactanos"
            className="block w-full py-3 bg-dorado text-primary text-sm tracking-widest uppercase font-bold text-center hover:bg-white transition-colors duration-300"
          >
            Cotiza ya
          </Link>
        </div>

      </div>
    </>
  )
}