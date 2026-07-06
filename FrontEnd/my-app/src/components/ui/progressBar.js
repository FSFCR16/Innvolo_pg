"use client"
import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

const RUTAS_OVERLAY = ["/", "/catalogo", "/contactanos", "/nosotros"]

NProgress.configure({ showSpinner: false })

export default function RouteLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const prevPathRef = useRef(pathname)

  useEffect(() => {
    const prevPath = prevPathRef.current

    if (pathname !== prevPath) {
      const esRutaOrigen = RUTAS_OVERLAY.includes(prevPath)

      if (esRutaOrigen) {
        setLoading(true)
        const timer = setTimeout(() => {
          setLoading(false)
        }, 800)
        prevPathRef.current = pathname
        return () => clearTimeout(timer)
      } else {
        // rutas dentro del catálogo → barra de progreso
        NProgress.start()
        const timer = setTimeout(() => {
          NProgress.done()
        }, 500)
        prevPathRef.current = pathname
        return () => clearTimeout(timer)
      }
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary/90 via-primary/80 to-black/90 backdrop-blur-md">
      <div className="absolute w-72 h-72 bg-dorado/20 rounded-full blur-3xl opacity-60" />
      <div className="relative flex flex-col items-center gap-6">
        <Image
          src="/logo_innvolo.png"
          alt="INNVOLO"
          width={140}
          height={70}
          className="animate-pulse"
        />
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-white/20" />
          <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-dorado animate-spin" />
        </div>
        <p className="text-white/80 text-sm tracking-wide">Cargando...</p>
      </div>
    </div>
  )
}