"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { FaTimes, FaChevronDown, FaChevronUp, FaWhatsapp } from "react-icons/fa"
import { WHATSAPP_NUMERO } from "@/lib/config/cotizacion"

const LINKS = [
  { t: "Inicio", h: "/" },
  { t: "Contáctanos", h: "/contactanos" },
  { t: "Nosotros", h: "/nosotros" },
]

export default function NavbarDrawer({ abierto, onCerrar, categorias }) {
  const [categoriaAbierta, setCategoriaAbierta] = useState(null)
  const waUrl = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent("Hola INNVOLO! Quiero cotizar.")}`

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onCerrar}
        className={`fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 md:hidden transition-opacity duration-300 ${
          abierto ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[84%] max-w-[340px] bg-primary z-50 flex flex-col shadow-[-20px_0_50px_-20px_rgba(0,0,0,0.6)] transition-transform duration-300 md:hidden ${
          abierto ? "translate-x-0" : "translate-x-full"
        }`}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dorado/20 shrink-0">
          <Image src="/logo_innvolo.png" alt="INNVOLO" width={84} height={42} />
          <button
            onClick={onCerrar}
            aria-label="Cerrar menú"
            className="w-10 h-10 flex items-center justify-center text-white hover:text-dorado transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Cuerpo scrolleable */}
        <div className="flex-1 overflow-y-auto px-5 py-3">

          {/* Links principales */}
          <nav className="flex flex-col">
            {LINKS.map(({ t, h }) => (
              <Link
                key={h}
                href={h}
                onClick={onCerrar}
                className="flex items-center justify-between text-white text-[15px] tracking-[0.12em] uppercase py-3.5 border-b border-white/[0.07] hover:text-dorado transition-colors"
              >
                {t}
                <span className="text-dorado/70 text-sm" aria-hidden>→</span>
              </Link>
            ))}
          </nav>

          {/* Catálogo */}
          <p className="text-dorado text-[11px] tracking-[0.2em] uppercase font-bold mt-6 mb-1">
            Catálogo
          </p>
          <div className="flex flex-col">
            {categorias.map((cat) => {
              const open = categoriaAbierta === cat.id
              return (
                <div key={cat.id} className="border-b border-white/[0.07]">
                  <button
                    onClick={() => setCategoriaAbierta(open ? null : cat.id)}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between py-3.5 text-white/90 text-[15px] hover:text-dorado transition-colors"
                  >
                    {cat.titulo}
                    {open ? (
                      <FaChevronUp size={11} className="text-dorado" />
                    ) : (
                      <FaChevronDown size={11} className="text-white/50" />
                    )}
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96" : "max-h-0"}`}>
                    <div className="pl-4 pb-3 ml-1 flex flex-col gap-2.5 border-l border-dorado/30">
                      <Link
                        href={cat.href}
                        onClick={onCerrar}
                        className="text-dorado text-[11px] tracking-[0.16em] uppercase hover:text-white transition-colors"
                      >
                        Ver todos
                      </Link>
                      {cat.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={onCerrar}
                          className="text-white/60 text-[14px] hover:text-dorado transition-colors"
                        >
                          {link.nombre}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer fijo: Cotizar + WhatsApp */}
        <div className="shrink-0 px-5 py-4 border-t border-dorado/20 flex flex-col gap-2.5">
          <Link
            href="/contactanos"
            onClick={onCerrar}
            className="block w-full py-3 rounded-lg bg-dorado text-primary text-[13px] tracking-widest uppercase font-bold text-center hover:brightness-105 active:scale-[0.99] transition"
          >
            Cotizar ahora
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-lg bg-[#25D366] text-[#04310f] text-[13px] tracking-wide uppercase font-bold text-center inline-flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.99] transition"
          >
            <FaWhatsapp className="text-base" /> WhatsApp directo
          </a>
        </div>

      </div>
    </>
  )
}
