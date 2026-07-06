export function Input({ id, label, type = "text", placeholder, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-gris tracking-wide">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`border-b bg-transparent py-2 text-sm text-primary placeholder:text-gris/50 focus:outline-none transition-colors duration-200 ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-gris/40 focus:border-dorado"
        }`}
      />
      {error && (
        <span className="text-red-500 text-xs mt-1">{error}</span>
      )}
    </div>
  )
}