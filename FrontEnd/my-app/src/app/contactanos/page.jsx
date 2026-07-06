import { HeroPagina } from "@/components/layout/heroPagina"
import FormularioCotizacion from "@/components/home/FormularioCotizacion"
import { FaWhatsapp, FaInstagram, FaClock, FaMapMarkerAlt } from "react-icons/fa"

export const metadata = {
  title: "Contáctanos | INNVOLO",
  description: "Solicita tu cotización de dotación e indumentaria corporativa personalizada.",
}

export default function Contactanos() {
  return (
    <main>

      <HeroPagina
        titulo="Comunícate"
        subtitulo="con nosotros"
        imagen="/hero/hero_uno.jpeg"
      />

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 flex flex-col gap-10 md:gap-12 anim-page">

        {/* 🔥 GRID RESPONSIVE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">

          {/* 🧾 FORMULARIO */}
          <div className="order-2 md:order-1">
            <FormularioCotizacion sinTitulo />
          </div>

          {/* 📞 INFO */}
          <div className="flex flex-col gap-8 md:pt-6 order-1 md:order-2">

            {/* Info */}
            <div className="flex flex-col gap-6">

              <div className="flex items-start gap-4">
                <FaClock className="text-dorado text-lg md:text-xl mt-1 shrink-0" />
                <div>
                  <p className="font-bold text-primary text-xs md:text-sm tracking-wide uppercase">
                    Tiempo de respuesta
                  </p>
                  <p className="text-gris text-xs md:text-sm mt-1">
                    Respondemos en menos de 24 horas hábiles.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FaMapMarkerAlt className="text-dorado text-lg md:text-xl mt-1 shrink-0" />
                <div>
                  <p className="font-bold text-primary text-xs md:text-sm tracking-wide uppercase">
                    Ubicación
                  </p>
                  <p className="text-gris text-xs md:text-sm mt-1">
                    Bogotá, Colombia. Envíos a todo el país.
                  </p>
                </div>
              </div>

            </div>

            <div className="border-t border-gris/20" />

            {/* CONTACTO DIRECTO */}
            <div className="flex flex-col gap-4">

              <p className="text-xs md:text-sm font-bold text-primary tracking-widest uppercase">
                Escríbenos directo
              </p>

              {/* WhatsApp */}
              <a
                href="https://wa.me/57"
                target="_blank"
                className="group flex items-center gap-4 md:gap-6 p-4 md:p-5 border border-gris/20 hover:border-dorado transition-all duration-300 rounded-xl active:scale-95 anim-card"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary group-hover:bg-dorado transition-colors duration-300 flex items-center justify-center shrink-0 rounded-lg">
                  <FaWhatsapp className="text-white text-lg md:text-xl" />
                </div>

                <div>
                  <p className="font-bold text-primary text-xs md:text-sm">
                    WhatsApp
                  </p>
                  <p className="text-gris text-[11px] md:text-xs mt-1">
                    Respuesta inmediata en horario laboral
                  </p>
                </div>

                <span className="ml-auto text-dorado text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  →
                </span>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/innvolo"
                target="_blank"
                className="group flex items-center gap-4 md:gap-6 p-4 md:p-5 border border-gris/20 hover:border-dorado transition-all duration-300 rounded-xl active:scale-95 anim-card"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary group-hover:bg-dorado transition-colors duration-300 flex items-center justify-center shrink-0 rounded-lg">
                  <FaInstagram className="text-white text-lg md:text-xl" />
                </div>

                <div>
                  <p className="font-bold text-primary text-xs md:text-sm">
                    Instagram
                  </p>
                  <p className="text-gris text-[11px] md:text-xs mt-1">
                    @innvolo — síguenos y escríbenos
                  </p>
                </div>

                <span className="ml-auto text-dorado text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  →
                </span>
              </a>

            </div>

          </div>

        </div>

      </section>

    </main>
  )
}