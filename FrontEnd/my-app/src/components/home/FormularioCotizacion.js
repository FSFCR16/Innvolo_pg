"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/Input"
import { cotizacionSchema } from "@/lib/saleor/validations/cotizacion"
import toast from "react-hot-toast"
const campos = [
  { id: "nombre", label: "Nombre", type: "text", placeholder: "Tu nombre" },
  { id: "correo", label: "Correo electrónico", type: "email", placeholder: "tu@empresa.com" },
  { id: "celular", label: "Número celular", type: "tel", placeholder: "300 000 0000" },
  { id: "empresa", label: "Empresa", type: "text", placeholder: "Nombre de tu empresa" },
]

export default function FormularioCotizacion({ sinTitulo = false }) {
  const searchParams = useSearchParams()
  const productoParam = searchParams.get("producto")
  const asuntoParam = searchParams.get("asunto")

  const mensajeDefecto = productoParam
    ? asuntoParam === "muestra-fisica"
      ? `Hola, quisiera solicitar una muestra física del producto "${productoParam}" antes de cotizar.`
      : `Hola, estoy interesado en el producto "${productoParam}" y quisiera saber el precio para _____ unidades.`
    : ""

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    celular: "",
    empresa: "",
    producto: mensajeDefecto,
  })

  const [errores, setErrores] = useState({})
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const handleChange = (id) => (e) => {
    setForm({ ...form, [id]: e.target.value })

    if (errores[id]) {
      const nuevosErrores = { ...errores }
      delete nuevosErrores[id]
      setErrores(nuevosErrores)
    }
  }

  const handleSubmit = async () => {
    const resultado = cotizacionSchema.safeParse(form)

    if (!resultado.success) {
      const erroresZod = {}
      resultado.error.issues.forEach((issue) => {
        erroresZod[issue.path[0]] = issue.message
      })
      setErrores(erroresZod)
      return
    }

    setErrores({})
    setEnviando(true)

    try {
      const response = await fetch("/api/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!data.ok) throw new Error(data.mensaje)

      toast.success("Solicitud enviada 🚀")

      // WhatsApp
      const mensaje = `
    Hola INNVOLO!
    Mi nombre es *${form.nombre}* y represento a *${form.empresa}*.

    *Solicitud de cotización:*
    ${form.producto}

    Celular: ${form.celular}
    Correo: ${form.correo}
      `

      const mensajeCodificado = encodeURIComponent(mensaje)
      window.open(`https://wa.me/573112424872?text=${mensajeCodificado}`, "_blank")

      setEnviado(true)

    } catch (error) {
      toast.error("Error al enviar 😢")
      console.error(error)
    }
  }

  // ✅ SUCCESS STATE PRO
  if (enviado) {
    return (
      <section className="py-16 px-4 md:px-8 bg-white anim-page">
        <div className="max-w-md mx-auto flex flex-col items-center gap-6 text-center">

          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center animate-bounce">
            <span className="text-white text-2xl">✓</span>
          </div>

          <h3 className="font-bold text-xl md:text-2xl text-primary">
            ¡Cotización enviada!
          </h3>

          <p className="text-gris text-sm">
            Te responderemos en menos de 24 horas.
          </p>

        </div>
      </section>
    )
  }

  return (
    <section className="py-10 md:py-16 px-4 md:px-8 bg-white">
      <div className="max-w-4xl mx-auto flex flex-col gap-10 md:gap-12">

        {/* Título */}
        {!sinTitulo && (
          <div className="w-fit mx-auto text-center">
            <h2 className="font-bold text-2xl md:text-4xl text-primary">
              Cotización
            </h2>
            <span className="font-cursiva text-2xl md:text-4xl text-dorado block">
              Rápida y segura
            </span>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

          {campos.map((campo) => (
            <Input
              key={campo.id}
              id={campo.id}
              label={campo.label}
              type={campo.type}
              placeholder={campo.placeholder}
              value={form[campo.id]}
              onChange={handleChange(campo.id)}
              error={errores[campo.id]}
            />
          ))}

          {/* Textarea */}
          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-xs md:text-sm text-gris">
              ¿Qué producto busca y en qué cantidad?
            </label>

            <textarea
              value={form.producto}
              onChange={handleChange("producto")}
              rows={4}
              className={`border rounded-md px-3 py-2 text-sm focus:outline-none transition resize-none ${
                errores.producto
                  ? "border-red-500"
                  : "border-gris/30 focus:border-dorado"
              }`}
            />

            {errores.producto && (
              <span className="text-red-500 text-xs">{errores.producto}</span>
            )}
          </div>

        </div>

        {/* Errores */}
        {Object.keys(errores).length > 0 && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-xs md:text-sm">
            <p className="text-red-600 font-bold mb-1">
              Corrige los siguientes campos:
            </p>
            {Object.values(errores).map((e, i) => (
              <p key={i} className="text-red-500">• {e}</p>
            ))}
          </div>
        )}

        {/* Botón */}
        <button
          onClick={handleSubmit}
          disabled={enviando}
          className="w-full py-3 md:py-4 bg-primary text-white text-xs md:text-sm tracking-widest uppercase font-bold hover:bg-dorado transition-all duration-300 active:scale-95 disabled:opacity-50"
        >
          {enviando ? "Enviando..." : "Cotiza ya"}
        </button>

      </div>
    </section>
  )
}