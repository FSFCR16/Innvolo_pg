"use client"

import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const Visor3D = dynamic(() => import("@/components/visor3d/Visor3D"), {
  ssr: false,
  loading: () => <p>Cargando visor...</p>
})

function Contenido() {
  const params = useSearchParams()
  // Ej: /test-visor?model=/modelos/HOODIE.r0.06.glb
  const model = params.get("model") || "/modelos/CAMISA-v1.glb"

  return (
    <>
      <p className="text-sm text-gray-500 mb-4">
        Modelo: <code>{model}</code> — cambia con <code>?model=/modelos/&lt;archivo&gt;.glb</code>
      </p>
      <Visor3D modelUrl={model} />
    </>
  )
}

export default function PruebaVisor() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl mb-4">Prueba del visor 3D</h1>
      <Suspense fallback={<p>Cargando...</p>}>
        <Contenido />
      </Suspense>
    </main>
  )
}
