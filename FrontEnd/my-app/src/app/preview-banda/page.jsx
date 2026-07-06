import { BandaMarcaProducto } from "@/components/layout/BandaMarcaProducto"

// Página temporal para comparar los diseños de la banda de marca.
// Abrir en /preview-banda. Borrar cuando se elija una.

const VARIANTES = [
  { id: "premium",     nombre: "★ Elegida (B + D)" },
  { id: "simetrico",   nombre: "A · Simétrico minimal" },
  { id: "confianza",   nombre: "B · Con micro-confianza" },
  { id: "cinta",       nombre: "C · Cinta animada" },
  { id: "atmosferico", nombre: "D · Atmosférico" },
]

export default function PreviewBanda() {
  return (
    <main className="py-10">
      <h1 className="max-w-7xl mx-auto px-4 md:px-8 font-titulo text-3xl text-primary mb-8">
        Diseños de banda de marca
      </h1>

      <div className="flex flex-col gap-12">
        {VARIANTES.map((v) => (
          <div key={v.id}>
            <p className="max-w-7xl mx-auto px-4 md:px-8 text-[11px] font-bold tracking-[0.15em] text-gris/70 uppercase mb-2">
              {v.nombre}
            </p>
            <BandaMarcaProducto variante={v.id} />
          </div>
        ))}
      </div>

      <p className="max-w-7xl mx-auto px-4 md:px-8 text-sm text-gris mt-12">
        Dime cuál te gusta (A, B, C o D) y la dejo en la página de producto. Esta página se borra después.
      </p>
    </main>
  )
}
