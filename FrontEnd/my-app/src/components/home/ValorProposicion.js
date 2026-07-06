import { FaMedal, FaHeadset, FaFingerprint, FaBullhorn } from "react-icons/fa"
import { TarjetaValor } from "./TarjetasValor.js"

const valores = [
  {
    icono: FaMedal,
    titulo: "Calidad confiable",
    descripcion: "Prendas duraderas, bien confeccionadas y con controles que aseguran excelencia y buena presentación.",
  },
  {
    icono: FaHeadset,
    titulo: "Servicio al cliente",
    descripcion: "Acompañamiento claro y constante, escuchando tus necesidades para ofrecer soluciones a tu medida.",
  },
  {
    icono: FaFingerprint,
    titulo: "Identidad",
    descripcion: "Diseñamos prendas que refuerzan la identidad visual de tu empresa y generan un impacto real.",
  },
  {
    icono: FaBullhorn,
    titulo: "Impacto publicitario",
    descripcion: "Creamos artículos que destacan tu marca y generan un impacto positivo en el mercado.",
  },
]

export default function ValorProposicion() {
  return (
    <section className="py-16 md:py-20 px-6 md:px-8 bg-[#F6F7F9] overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-10 md:gap-14">

        {/* TÍTULO */}
        <div className="flex flex-col items-center text-center gap-3 max-w-xl mx-auto">
          <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-dorado">
            Por qué INNVOLO
          </span>
          <h2 className="font-titulo font-semibold text-[2rem] md:text-[2.5rem] leading-tight text-primary">
            Calidad que genera confianza
          </h2>
          <span className="block h-px w-12 bg-dorado/60 mt-1" />
        </div>

        {/* 📱 MOBILE (stack vertical — todo visible) */}
        <div className="flex flex-col gap-4 w-full md:hidden">
          {valores.map((valor) => (
            <TarjetaValor key={valor.titulo} {...valor} />
          ))}
        </div>

        {/* 💻 TABLET + DESKTOP */}
        <div className="hidden md:grid w-full gap-8 md:grid-cols-2 lg:grid-cols-4">
          {valores.map((valor) => (
            <TarjetaValor key={valor.titulo} {...valor} />
          ))}
        </div>

      </div>
    </section>
  )
}