import Link from "next/link"
import Image from "next/image"
import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa"

export default function Footer() {

  const linkClase = "relative tracking-widest text-sm uppercase transition-colors duration-200 hover:text-dorado after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-dorado after:transition-all after:duration-300 hover:after:w-full"

  return (
    <footer className="bg-primary border-t border-dorado/30">

      {/* Parte superior */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 flex flex-col items-center gap-6">

        <Link href="/">
          <Image src="/logo_innvolo.png" alt="INNVOLO" width={140} height={70} priority />
        </Link>

        {/* LINKS */}
        <ul className="flex flex-col md:flex-row items-center gap-4 md:gap-10 text-white">
          <li><Link href="/" className={linkClase}>Inicio</Link></li>
          <li><Link href="/catalogo" className={linkClase}>Productos</Link></li>
          <li><Link href="/contactanos" className={linkClase}>Contáctanos</Link></li>
          <li><Link href="/nosotros" className={linkClase}>Nosotros</Link></li>
        </ul>

      </div>

      {/* Línea */}
      <div className="border-t border-dorado/20 w-[90%] mx-auto" />

      {/* Parte inferior */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 text-white">

        {/* Redes */}
        <ul className="flex gap-5">
          <li>
            <a href="https://instagram.com" target="_blank" className="text-white/60 hover:text-dorado transition-colors duration-200">
              <FaInstagram size={20} />
            </a>
          </li>
          <li>
            <a href="https://facebook.com" target="_blank" className="text-white/60 hover:text-dorado transition-colors duration-200">
              <FaFacebook size={20} />
            </a>
          </li>
          <li>
            <a href="https://wa.me/57" target="_blank" className="text-white/60 hover:text-dorado transition-colors duration-200">
              <FaWhatsapp size={20} />
            </a>
          </li>
        </ul>

        {/* Copyright */}
        <p className="text-white/50 text-sm tracking-widest text-center md:text-right">
          ©2025 Innvolo
        </p>

      </div>

    </footer>
  )
}