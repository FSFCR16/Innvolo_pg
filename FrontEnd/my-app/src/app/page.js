import Hero from "@/components/home/Hero"
import ValorProposicion from "@/components/home/ValorProposicion"
import CategoriasDestacadas from "@/components/home/CategoriasDestacadas"
import FormularioCotizacion from "@/components/home/FormularioCotizacion"
import Testimonios from "@/components/home/Testimonios"

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Hero />
      <ValorProposicion />
      <CategoriasDestacadas />
      <FormularioCotizacion />
      <Testimonios/>
    </main>
  )
}