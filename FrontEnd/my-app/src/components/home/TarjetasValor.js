export function TarjetaValor({ icono: Icono, titulo, descripcion }) {
  return (
    <div className="group flex md:flex-col items-start gap-4 md:gap-0 bg-white p-5 md:p-7 rounded-2xl ring-1 ring-primary/[0.07] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:ring-dorado/30">

      {/* Icono en chip */}
      <div className="shrink-0 flex items-center justify-center w-12 h-12 md:mb-5 rounded-xl bg-primary/[0.04] ring-1 ring-dorado/20 text-dorado text-xl md:text-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-dorado group-hover:text-white group-hover:ring-dorado">
        <Icono />
      </div>

      <div className="flex flex-col">
        {/* Título */}
        <h3 className="font-titulo font-semibold text-xl md:text-2xl leading-tight text-primary mb-1.5 md:mb-2">
          {titulo}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-primary/65 leading-relaxed">
          {descripcion}
        </p>
      </div>

    </div>
  )
}
