// ============================================================
//  CONFIG DE COTIZACIÓN — FASE 1 (valores QUEMADOS)
// ------------------------------------------------------------
//  ⚠️ Estos valores aún no viven en WooCommerce. En FASE 2 se
//  crean los campos en WP y se reemplaza lo de aquí por datos
//  reales por producto. Mantener TODO lo quemado en este archivo
//  para que la migración sea un solo punto de cambio.
//  Ver PLAN_PRODUCT_PAGE.md.
// ============================================================

// Número de WhatsApp de INNVOLO (formato internacional, sin +)
export const WHATSAPP_NUMERO = "573112424872"

// Texto pequeño dorado encima del título
export const EYEBROW = "ROPA DEPORTIVA PERSONALIZADA"

// Tramos de precio — placeholder realista (baja con el volumen).
// `cantidad` se usa para ordenar/comparar; `label` es lo que se muestra.
export const TRAMOS_PRECIO = [
  { cantidad: 12, label: "12", precio: 39900 },
  { cantidad: 25, label: "25", precio: 34900 },
  { cantidad: 50, label: "50", precio: 31900 },
  { cantidad: 100, label: "100+", precio: 28900 },
]

// Índice del tramo seleccionado por defecto (el 25)
export const TRAMO_DEFAULT = 1

// Técnicas de personalización disponibles
export const TECNICAS = ["Bordado", "Estampado DTF", "Sublimación"]

// Badges de confianza (icono = clave que mapea el componente)
export const BADGES = [
  { icono: "envio", texto: "Toda Colombia" },
  { icono: "entrega", texto: "Entrega 10–15 días" },
  { icono: "calidad", texto: "Garantía de calidad" },
]

// ============================================================
//  FICHA TÉCNICA + INFO (valores QUEMADOS — Fase 1)
//  Espejan el mockup de referencia. En Fase 2 salen de Woo.
// ============================================================

// Pares etiqueta/valor de la ficha técnica (estilo mockup).
export const FICHA_TECNICA = [
  { label: "Material",    valor: "Algodón 100%" },
  { label: "Gramaje",     valor: "180 g/m²" },
  { label: "Tallas",      valor: "XS · S · M · L · XL · 2XL · 3XL" },
  { label: "Colores base", valor: "12 disponibles" },
  { label: "Mínimo",      valor: "20 unidades" },
  { label: "Técnicas",    valor: "Bordado · Estampado · Sublimación" },
]

// Texto del bloque "¿Cómo funciona el proceso?"
export const PROCESO_TEXTO =
  "Cotizas → apruebas la muestra → confirmas producción → recibes en 10–15 días hábiles. Te acompañamos en cada paso del proceso."

// Texto del bloque "Envíos y tiempos"
export const ENVIOS_TEXTO =
  "Despachamos a toda Colombia. Tiempo de producción: 10–15 días hábiles desde la aprobación de la muestra. Envío incluido en pedidos desde 100 unidades."

// ============================================================
//  COLORES — nombre → hex (compartido por swatches y visor 3D).
//  Si un producto trae sus colores reales de Woo (coloresVariantes)
//  se usan esos; si no, se muestra esta paleta base por defecto.
// ============================================================
export const COLORES_HEX = {
  "Negro":       "#1a1a1a",
  "Blanco":      "#FFFFFF",
  "Gris":        "#9e9e9e",
  "Azul marino": "#283593",
  "Azul":        "#1e88e5",
  "Rojo":        "#e53935",
  "Verde":       "#43a047",
  "Amarillo":    "#fdd835",
  "Naranja":     "#fb8c00",
  "Beige":       "#d7c4a3",
  "Vinotinto":   "#8e1d2d",
  "Café":        "#5d4037",
}

// Paleta por defecto cuando el producto no tiene variantes de color en Woo.
export const COLORES_BASE_DEFAULT = [
  "Negro", "Blanco", "Gris", "Azul marino", "Azul", "Rojo",
  "Verde", "Amarillo", "Beige", "Vinotinto", "Café", "Naranja",
]

// Formatea un número como pesos colombianos: 39900 -> "$39.900"
export function formatoCOP(valor) {
  return "$" + Number(valor).toLocaleString("es-CO")
}
