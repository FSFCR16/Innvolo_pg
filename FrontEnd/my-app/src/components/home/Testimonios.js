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
    <section className="py-20 px-6 md:px-8 bg-primary">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">

        {/* TÍTULO */}
        <div className="w-full lg:w-[35%] mx-auto text-center lg:text-left">
          <h2 className="font-sans font-bold text-3xl md:text-3xl lg:text-4xl text-white block">
            Testimonios que
          </h2>
          <span className="font-cursiva text-3xl md:text-3xl lg:text-4xl text-dorado block lg:text-right">
            respaldan nuestro trabajo
          </span>
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