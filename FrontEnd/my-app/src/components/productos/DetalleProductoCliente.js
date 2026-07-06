"use client"

import { useState } from "react"
import Link from "next/link"
import { FaWhatsapp } from "react-icons/fa"
import { FiTruck, FiClock, FiShield, FiBox, FiTrendingDown, FiChevronDown } from "react-icons/fi"
import TarjetaProducto from "./TarjetaProducto"
import GaleriaProducto from "./GaleriaProducto"
import {
  WHATSAPP_NUMERO,
  TRAMOS_PRECIO,
  TRAMO_DEFAULT,
  TECNICAS,
  BADGES,
  FICHA_TECNICA,
  PROCESO_TEXTO,
  ENVIOS_TEXTO,
  COLORES_HEX,
  COLORES_BASE_DEFAULT,
  formatoCOP,
} from "@/lib/config/cotizacion"

// mapea la clave del badge a su icono
const ICONOS_BADGE = { envio: FiTruck, entrega: FiClock, calidad: FiShield }

export default function DetalleProductoCliente({ producto, relacionados }) {

  // Tramos de precio: reales de Woo (precio_20/50/100/500) si existen; si no, fallback quemado
  const tramos = producto?.tramosPrecio?.length ? producto.tramosPrecio : TRAMOS_PRECIO

  // Estado de cotización (cantidad + técnica)
  const [cantidadIdx, setCantidadIdx] = useState(Math.min(TRAMO_DEFAULT, tramos.length - 1))
  const [tecnicaIdx, setTecnicaIdx] = useState(0)

  // Colores: variantes reales de Woo → colores del Excel → paleta base
  const colores = producto?.coloresVariantes?.length
    ? producto.coloresVariantes
    : producto?.coloresDisponibles?.length
    ? producto.coloresDisponibles
    : COLORES_BASE_DEFAULT
  const [colorIdx, setColorIdx] = useState(0)

  if (!producto) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <p className="text-gris">Producto no encontrado.</p>
    </div>
  )

  const tramo = tramos[cantidadIdx]
  const tecnica = TECNICAS[tecnicaIdx]

  // Ficha técnica dinámica desde Woo (con fallback a lo quemado)
  const fichaDinamica = [
    producto.materiales && { label: "Material", valor: producto.materiales },
    colores.length && { label: "Colores", valor: colores.join(" · ") },
    producto.tecnicaRecomendada && { label: "Técnica recomendada", valor: producto.tecnicaRecomendada },
    tramos.length && { label: "Mínimo", valor: `${tramos[0].label} unidades` },
  ].filter(Boolean)
  const fichaTecnica = fichaDinamica.length ? fichaDinamica : FICHA_TECNICA
  const colorNombre = colores[colorIdx]
  const colorHex = COLORES_HEX[colorNombre] || "#cccccc"

  // Mensaje de WhatsApp armado con la selección actual
  const mensajeWhatsApp = `Hola INNVOLO! Quiero cotizar:

*${producto.nombre}*
Cantidad: ${tramo.label} unidades
Técnica: ${tecnica}
Color: ${colorNombre}
Precio estimado: ${formatoCOP(tramo.precio)}/u`

  const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensajeWhatsApp)}`
  const urlMuestra = `/contactanos?producto=${encodeURIComponent(producto.nombre)}&asunto=muestra-fisica`

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col gap-16 md:gap-24 anim-page">

      {/* ===== Detalle principal ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">

        {/* --- Galería (imágenes + 3D solo exhibición) --- */}
        <div>
          <GaleriaProducto
            imagenes={producto.imagenes}
            imagenFallback={producto.imagen}
            model3dUrl={producto.model3dUrl}
            color={colorHex}
            nombre={producto.nombre}
          />
        </div>

        {/* --- Info / cotización (sticky en desktop) --- */}
        <div className="flex flex-col gap-6 md:sticky md:top-24 md:self-start">

          {/* Encabezado */}
          <div>
            <span className="block h-px w-10 bg-dorado mb-4" />
            <h1 className="font-titulo font-bold text-[2rem] md:text-[2.6rem] leading-[1.05] text-primary">
              {producto.nombre}
            </h1>
          </div>

          {/* Descripción */}
          {producto.descripcion && (
            <div
              className="text-gris text-[15px] leading-relaxed line-clamp-3"
              dangerouslySetInnerHTML={{ __html: producto.descripcion }}
            />
          )}

          {/* COLORES DISPONIBLES */}
          <div>
            <div className="flex items-baseline justify-between mb-2.5">
              <p className="text-[11px] font-bold tracking-[0.12em] text-primary">COLORES DISPONIBLES</p>
              <span className="text-[11px] text-gris/70">{colores.length} colores</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {colores.map((nombre, i) => {
                const hex = COLORES_HEX[nombre] || "#cccccc"
                const activo = i === colorIdx
                return (
                  <button
                    key={nombre}
                    type="button"
                    onClick={() => setColorIdx(i)}
                    title={nombre}
                    aria-label={nombre}
                    aria-pressed={activo}
                    className={`relative w-9 h-9 rounded-full transition-transform ${
                      activo ? "scale-110" : "hover:scale-105"
                    }`}
                  >
                    <span
                      className="absolute inset-0 rounded-full border border-black/10"
                      style={{ backgroundColor: hex }}
                    />
                    <span
                      className={`absolute -inset-1 rounded-full border-2 transition ${
                        activo ? "border-dorado" : "border-transparent"
                      }`}
                    />
                  </button>
                )
              })}
            </div>
            <p className="text-[12px] text-gris mt-2">
              Seleccionado: <span className="font-semibold text-primary">{colorNombre}</span>
              {producto.model3dUrl && <span className="text-gris/60"> · previsualízalo en la vista 3D</span>}
            </p>
          </div>

          {/* CANTIDAD */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] text-primary mb-2.5">CANTIDAD</p>
            <div className="flex flex-wrap gap-2">
              {tramos.map((t, i) => (
                <button
                  key={t.cantidad}
                  type="button"
                  onClick={() => setCantidadIdx(i)}
                  aria-pressed={i === cantidadIdx}
                  className={`px-4 py-2 text-sm rounded-xl border transition-all duration-150 ${
                    i === cantidadIdx
                      ? "border-dorado bg-[#FBF6E9] text-primary shadow-[inset_0_0_0_1px_#C9A84C] font-semibold"
                      : "border-black/10 bg-white text-primary hover:border-dorado/60"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* TÉCNICA */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] text-primary mb-2.5">TÉCNICA DE PERSONALIZACIÓN</p>
            <div className="flex flex-wrap gap-2">
              {TECNICAS.map((tec, i) => (
                <button
                  key={tec}
                  type="button"
                  onClick={() => setTecnicaIdx(i)}
                  aria-pressed={i === tecnicaIdx}
                  className={`px-4 py-2 text-[13px] rounded-xl border transition-all duration-150 ${
                    i === tecnicaIdx
                      ? "border-dorado bg-[#FBF6E9] text-primary shadow-[inset_0_0_0_1px_#C9A84C] font-semibold"
                      : "border-black/10 bg-white text-primary hover:border-dorado/60"
                  }`}
                >
                  {tec}
                </button>
              ))}
            </div>
            {producto.tecnicaRecomendada && (
              <p className="text-[12px] text-gris mt-2">
                Recomendada para este producto:{" "}
                <span className="font-semibold text-primary">{producto.tecnicaRecomendada}</span>
              </p>
            )}
          </div>

          {/* PRECIO (reacciona a la cantidad) */}
          <div className="bg-[#FBF6E9] border border-dorado/40 rounded-2xl px-5 py-4">
            <span className="text-xs text-gris">Desde</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-[2rem] font-bold text-dorado tabular-nums leading-none">{formatoCOP(tramo.precio)}</span>
              <span className="text-sm text-gris">/ unidad</span>
            </div>
            <span className="text-[11px] text-gris inline-flex items-center gap-1.5 mt-2">
              <FiTrendingDown className="text-dorado" /> El precio baja a mayor volumen
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5">
            <a
              href={urlWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-dorado text-primary font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2.5 text-[15px] hover:brightness-105 active:scale-[0.99] transition"
            >
              <FaWhatsapp className="text-xl" /> Cotizar por WhatsApp
            </a>
            <Link
              href={urlMuestra}
              className="w-full bg-white text-primary font-semibold rounded-xl py-3 border-[1.5px] border-primary flex items-center justify-center gap-2 text-sm hover:bg-primary hover:text-white active:scale-[0.99] transition"
            >
              <FiBox className="text-lg" /> Solicitar muestra física
            </Link>
          </div>

          {/* BADGES */}
          <div className="grid grid-cols-3 gap-2.5">
            {BADGES.map((b) => {
              const Icono = ICONOS_BADGE[b.icono]
              return (
                <div key={b.icono} className="text-center bg-[#F6F6F3] rounded-xl px-2 py-3.5">
                  {Icono && <Icono className="mx-auto text-xl text-dorado" />}
                  <p className="text-[10.5px] font-medium text-primary mt-2 leading-tight">{b.texto}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ===== Ficha técnica + info ===== */}
      <div className="max-w-3xl w-full mx-auto flex flex-col gap-3">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="h-px w-7 bg-dorado" />
          <h2 className="text-[11px] font-semibold tracking-[0.22em] text-dorado">DETALLES DEL PRODUCTO</h2>
        </div>

        {/* Ficha técnica — grid curado estilo mockup */}
        <div className="rounded-2xl border border-black/10 px-6 py-5">
          <p className="text-[15px] font-semibold text-primary mb-4">Ficha técnica</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {fichaTecnica.map((f) => (
              <div key={f.label} className="flex flex-col">
                <span className="text-[11px] text-gris">{f.label}</span>
                <span className="text-sm font-semibold text-primary mt-0.5">{f.valor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ¿Cómo funciona el proceso? */}
        <Acordeon titulo="¿Cómo funciona el proceso?">
          <p className="text-sm text-gris leading-relaxed">{PROCESO_TEXTO}</p>
        </Acordeon>

        {/* Envíos y tiempos */}
        <Acordeon titulo="Envíos y tiempos">
          <p className="text-sm text-gris leading-relaxed">{ENVIOS_TEXTO}</p>
        </Acordeon>

        {/* Especificaciones reales de WooCommerce (si las hay) */}
        {producto.atributos?.length > 0 && (
          <Acordeon titulo="Especificaciones del producto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {producto.atributos.map((attr) => (
                <div key={attr.nombre} className="flex flex-col">
                  <span className="text-[11px] text-gris">{attr.nombre}</span>
                  <span className="text-sm font-semibold text-primary">{attr.valor}</span>
                </div>
              ))}
            </div>
          </Acordeon>
        )}
      </div>

      {/* ===== También te puede interesar ===== */}
      {relacionados.length > 0 && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-titulo font-bold text-2xl md:text-3xl text-primary">
              También te puede interesar
            </h2>
            <span className="font-cursiva text-lg md:text-xl text-dorado">
              productos relacionados
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relacionados.map((p) => (
              <TarjetaProducto key={p.id} producto={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

// Acordeón accesible reutilizable (native <details>)
function Acordeon({ titulo, children, abiertoInicial = false }) {
  return (
    <details open={abiertoInicial} className="group border border-black/10 rounded-2xl px-6 py-1 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex items-center justify-between py-4 cursor-pointer list-none">
        <span className="text-[15px] font-semibold text-primary">{titulo}</span>
        <FiChevronDown className="text-gris transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pb-4 pt-1">{children}</div>
    </details>
  )
}
