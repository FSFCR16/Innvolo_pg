// src/components/home/Testimonios.js
import { TarjetaTestimonio } from "./tarjetasTestimonios"

const testimonios = [
  {
    nombre: "Juan",
    texto: "Excelente servicio. Las prendas son de muy buena calidad y el proceso fue siempre claro. Los recomiendo.",
  },
  {
    nombre: "Sebastián",
    texto: "Nos entregaron todo a tiempo y el equipo completo quedó muy satisfecho. Definitivamente los recomiendo.",
  },
  {
    nombre: "Andrea",
    texto: "INNVOLO nos hizo la dotación completa de la empresa y quedamos encantados. Calidad y cumplimiento.",
  },
]

export default function Testimonios() {
  return (
    <section className="py-14 md:py-20 px-6 md:px-8 bg-primary">
      <div className="max-w-7xl mx-auto flex flex-col gap-10 md:gap-12">

        {/* TÍTULO */}
        <div className="flex flex-col items-center text-center gap-2.5 max-w-xl mx-auto">
          <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-dorado">
            Testimonios
          </span>
          <h2 className="font-titulo font-semibold text-[1.9rem] md:text-[2.5rem] leading-tight text-white">
            Lo que dicen nuestros clientes
          </h2>
        </div>

        {/* GRID RESPONSIVE (vertical) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonios.map((t) => (
            <TarjetaTestimonio key={t.nombre} {...t} />
          ))}
        </div>

      </div>
    </section>
  )
}