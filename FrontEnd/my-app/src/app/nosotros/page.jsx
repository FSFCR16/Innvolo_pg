import { HeroPagina } from "@/components/layout/heroPagina"
import Image from "next/image"

export const metadata = {
  title: "Nosotros | INNVOLO",
  description:
    "Somos una empresa especializada en el diseño, producción y entrega de productos personalizados de alta calidad.",
}

export default function Nosotros() {
  return (
    <main>

      <HeroPagina
        titulo="Nosotros"
        subtitulo="quiénes somos"
        imagen="/hero/hero_tres.jpeg"
      />

      {/* QUIÉNES SOMOS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center anim-page">

        {/* TEXTO */}
        <div className="flex flex-col gap-5 md:gap-6 order-2 md:order-1">
          <div className="leading-none">
            <h2 className="font-sans font-bold text-2xl md:text-4xl text-primary">
              Quiénes somos
            </h2>
            <span className="font-cursiva text-2xl md:text-4xl text-dorado block text-right -mt-1">
              INNVOLO
            </span>
          </div>

          <p className="text-gris text-sm md:text-base leading-relaxed">
            INNVOLO Publicidad & Marketing es una empresa especializada en el diseño,
            producción y entrega de productos personalizados de alta calidad. Creamos
            productos funcionales y memorables que ayudan a empresas, marcas y eventos
            a conectar emocionalmente con su público.
          </p>
        </div>

        {/* IMAGEN */}
        <div className="relative h-56 md:h-80 overflow-hidden rounded-xl order-1 md:order-2">
          <Image
            src="/hero/hero_uno.jpeg"
            alt="Quiénes somos INNVOLO"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/60" />
        </div>

      </section>

      {/* MISIÓN */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* IMAGEN */}
          <div className="relative h-56 md:h-80 overflow-hidden rounded-xl">
            <Image
              src="/hero/hero_dos.jpeg"
              alt="Misión INNVOLO"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/60" />
          </div>

          {/* TEXTO */}
          <div className="flex flex-col gap-5 md:gap-6">
            <div className="leading-none">
              <h2 className="font-sans font-bold text-2xl md:text-4xl text-white">
                Misión
              </h2>
              <span className="font-cursiva text-2xl md:text-4xl text-dorado block text-right -mt-1">
                lo que nos mueve
              </span>
            </div>

            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              Crear experiencias únicas a través de productos personalizados de alta
              calidad, transformando ideas en objetos funcionales que comuniquen
              identidad, generen impacto y aporten valor a marcas, empresas y eventos.
            </p>
          </div>

        </div>
      </section>

      {/* VISIÓN */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

        {/* TEXTO */}
        <div className="flex flex-col gap-5 md:gap-6 order-2 md:order-1">
          <div className="leading-none">
            <h2 className="font-sans font-bold text-2xl md:text-4xl text-primary">
              Visión
            </h2>
            <span className="font-cursiva text-2xl md:text-4xl text-dorado block text-right -mt-1">
              hacia dónde vamos
            </span>
          </div>

          <p className="text-gris text-sm md:text-base leading-relaxed">
            Ser líderes en la creación de experiencias únicas a través de productos
            personalizados de primera calidad, procesos de producción modernos y
            soluciones creativas adaptadas a distintos presupuestos.
          </p>
        </div>

        {/* IMAGEN */}
        <div className="relative h-56 md:h-80 overflow-hidden rounded-xl order-1 md:order-2">
          <Image
            src="/hero/hero_tres.jpeg"
            alt="Visión INNVOLO"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/60" />
        </div>

      </section>

    </main>
  )
}