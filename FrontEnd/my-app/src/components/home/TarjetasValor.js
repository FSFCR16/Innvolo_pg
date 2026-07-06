export function TarjetaValor({ icono: Icono, titulo, descripcion }) {
  return (
    <div className="group bg-white p-6 rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">

      {/* Icono */}
      <div className="mb-4 text-dorado text-3xl transition-transform duration-300 group-hover:scale-110">
        <Icono />
      </div>

      {/* Título */}
      <h3 className="font-semibold text-lg text-primary mb-2">
        {titulo}
      </h3>

      {/* Descripción */}
      <p className="text-sm text-primary/70 leading-relaxed">
        {descripcion}
      </p>

    </div>
  )
}