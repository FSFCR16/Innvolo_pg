"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { MegaMenu } from "./MegaMenu.js"
import NavbarDrawer from "./NavbarDrawer.js"
import { FaBars } from "react-icons/fa"

export default function Navbar({ categorias }) {
  const [dropdownAbierto, setDropdownAbierto] = useState(false)
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const esHome = pathname === "/"

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => { setDrawerAbierto(false) }, [pathname])

  // Cierra el megamenú al navegar (antes quedaba abierto tras hacer clic y el
  // usuario no notaba que la página ya había cambiado).
  useEffect(() => { setDropdownAbierto(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = drawerAbierto ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [drawerAbierto])

  const linkClase = "relative tracking-widest text-sm uppercase transition-colors duration-200 hover:text-dorado after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-dorado after:transition-all after:duration-300 hover:after:w-full"

  // Filtrar "Sin categorizar"
  const categoriasFiltradas = categorias.filter((cat) => {
    const nombre = (cat.name || "").toLowerCase().trim()
    return nombre !== "sin categorizar" && nombre !== "uncategorized"
  })

  const categoriasFormateadas = categoriasFiltradas.map((cat) => ({
    id: cat.id,
    titulo: cat.name,
    href: `/catalogo/${cat.slug}`,
    links: cat.children?.map((sub) => ({
      nombre: sub.name,
      href: `/catalogo/${cat.slug}/${sub.slug}`
    })) ?? []
  }))

  return (
    <>
      <div
        onMouseLeave={() => setDropdownAbierto(false)}
        className={`z-40 w-full transition-all duration-500 ${
          esHome && !scrolled && !dropdownAbierto
            ? "fixed top-0 bg-transparent"
            : esHome
            ? "fixed top-0 bg-primary shadow-lg"
            : "sticky top-0 bg-primary shadow-lg"
        }`}
      >
        <div className="relative w-full">
          <nav>
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-5 flex items-center justify-between">

              <Link href="/">
                <Image src="/logo_innvolo.png" alt="INNVOLO" width={100} height={50} priority />
              </Link>

              <ul className="hidden md:flex gap-10 text-white">
                <li onMouseEnter={() => setDropdownAbierto(false)}>
                  <Link href="/" className={linkClase}>Inicio</Link>
                </li>
                <li onMouseEnter={() => setDropdownAbierto(true)}>
                  <Link href="/catalogo" className={`${linkClase} text-white`}>Catálogo</Link>
                </li>
                <li onMouseEnter={() => setDropdownAbierto(false)}>
                  <Link href="/contactanos" className={linkClase}>Contáctanos</Link>
                </li>
                <li onMouseEnter={() => setDropdownAbierto(false)}>
                  <Link href="/nosotros" className={linkClase}>Nosotros</Link>
                </li>
              </ul>

              <button className="md:hidden text-white p-2" onClick={() => setDrawerAbierto(true)}>
                <FaBars size={22} />
              </button>

            </div>
          </nav>

          {/* MegaMenu full-width pero contenido centrado y limitado */}
          <div className={`hidden md:block transition-all duration-300 ease-out overflow-hidden ${
            dropdownAbierto ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}>
            <MegaMenu abierto={dropdownAbierto} categorias={categoriasFiltradas} cerrar={() => setDropdownAbierto(false)} />
          </div>

        </div>
      </div>

      <NavbarDrawer
        abierto={drawerAbierto}
        onCerrar={() => setDrawerAbierto(false)}
        categorias={categoriasFormateadas}
      />
    </>
  )
}