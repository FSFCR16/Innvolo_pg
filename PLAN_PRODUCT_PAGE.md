# PLAN — Rediseño Product Page (INNVOLO)

> Documento de trabajo. Norte visual: `Downloads/innvolo_pagina_producto_polo.html`.
> Paleta: navy `#0D1B2A` · dorado `#C9A84C` · gris `#4A4A4A` · fondo blanco. Tipografía Inter.

---

## 🎯 Objetivo

Mejorar la página de producto para que se vea como el mockup y maneje **cotización dinámica**:
al cambiar la **cantidad**, cambia el **precio**. Como esos datos aún no existen en WordPress,
en **Fase 1 los quemamos** (hardcode) para ver el resultado; en **Fase 2** se crean los campos
en WooCommerce y se reemplaza lo quemado por datos reales.

---

## ✅ Decisiones tomadas (2026-06-11)

| Tema | Decisión |
|------|----------|
| **Precio Fase 1** | Placeholders realistas: tabla de tramos que baja con el volumen. Se reemplaza en Fase 2. |
| **CTA WhatsApp** | Abre `wa.me` con mensaje prellenado: producto + cantidad + técnica seleccionadas. |
| **Alcance Fase 1** | Todos los productos (componente compartido `DetalleProductoCliente.js`). |
| **Botón "Solicitar muestra física"** | Sí, enlaza a `/contactanos` con asunto "muestra física" prellenado. |
| **Sección "ya lo usaron" (reseñas)** | ❌ No se agrega. |
| **Sección "También te puede interesar"** | ✅ Se mantiene (ya existe, relacionados por categoría). |

**Pendiente para ejecutar:** ⚠️ número de WhatsApp → constante `WHATSAPP_NUMERO` (placeholder hasta que lo des).

---

## 🟡 FASE 1 — Rediseño con valores quemados ✅ HECHA (2026-06-12)

> Ejecutada. Número WhatsApp resuelto: `573112424872`. ESLint limpio. Ver detalle en `CLAUDE.md → Cambios realizados`.

**Criticidad:** 🟡 Media — solo frontend. No toca la DB de WordPress. Cero riesgo en datos.

> ⚙️ Nota técnica: antes de escribir código, revisar `node_modules/next/dist/docs/` (este Next
> tiene cambios respecto al estándar, según `FrontEnd/my-app/AGENTS.md`).

### Archivos

| Archivo | Acción |
|---------|--------|
| `src/lib/config/cotizacion.js` | **NUEVO** — valores quemados centralizados (todo lo de Fase 2 sale de aquí, para que reemplazarlo sea trivial). |
| `src/components/productos/DetalleProductoCliente.js` | **Reescritura** del bloque de info (columna derecha) + ficha técnica en acordeón. Mantiene Visor3D y relacionados. |

### `cotizacion.js` (lo quemado, en un solo lugar)

```js
// ⚠️ FASE 1: valores quemados. En Fase 2 vienen de WooCommerce (ver plan).
export const WHATSAPP_NUMERO = "57XXXXXXXXXX" // <-- pendiente

export const EYEBROW = "ROPA DEPORTIVA PERSONALIZADA"

// Tramos de precio (placeholder realista — baja con volumen)
export const TRAMOS_PRECIO = [
  { cantidad: 12,  label: "12",   precio: 39900 },
  { cantidad: 25,  label: "25",   precio: 34900 },
  { cantidad: 50,  label: "50",   precio: 31900 },
  { cantidad: 100, label: "100+", precio: 28900 },
]

export const TECNICAS = ["Bordado", "Estampado DTF", "Sublimación"]

export const BADGES = [
  { icono: "truck",        texto: "Envío a todo el país" },
  { icono: "stopwatch",    texto: "Entrega 8–12 días" },
  { icono: "shield-check", texto: "Calidad garantizada" },
]
```

### Comportamiento (interactividad, client-side)

- `useState` para **cantidad seleccionada** y **técnica seleccionada**.
- La caja de precio muestra el `precio` del tramo activo → **cambia al tocar otra cantidad**.
- **WhatsApp:** `https://wa.me/{WHATSAPP_NUMERO}?text=...` con mensaje:
  `Hola INNVOLO, quiero cotizar: {producto} · Cantidad: {cantidad} · Técnica: {técnica}. Precio estimado: ${precio}/u.`
- **Muestra física:** `/contactanos?producto={nombre}&asunto=muestra-fisica`.

### Layout de la columna derecha (orden, estilo mockup)

1. Eyebrow dorado (`EYEBROW`)
2. Título (nombre del producto, navy bold)
3. Descripción corta (de WordPress, ya existe)
4. **CANTIDAD** — chips seleccionables (estado activo: borde dorado + fondo crema)
5. **TÉCNICA DE PERSONALIZACIÓN** — chips seleccionables
6. **Caja de precio** (fondo crema `#FBF6E9`, borde dorado) — "Desde $X / unidad" + "el precio baja a mayor volumen"
7. CTA primario dorado **Cotizar por WhatsApp**
8. CTA secundario outline **Solicitar muestra física**
9. Fila de 3 **badges** de confianza
10. **Ficha técnica** en acordeón (atributos de WordPress) — estilo imagen 2 del mockup

### Lo que NO cambia en Fase 1
- Visor 3D (`Visor3D`) — se mantiene tal cual.
- Sección "También te puede interesar" (relacionados) — se mantiene.
- Queries de WooCommerce (`productos.js`) — sin tocar.

### ✅ Verificación Fase 1
- [ ] `npm run dev` y abrir un producto con modelo 3D y otro sin modelo.
- [ ] Cambiar cantidad → el precio cambia.
- [ ] Botón WhatsApp abre `wa.me` con el mensaje correcto (cantidad/técnica reales).
- [ ] Responsive: se ve bien en móvil (chips no se rompen, columnas apiladas).
- [ ] Relacionados siguen apareciendo.

---

## 🔴 FASE 2 — Mover lo quemado a WordPress (DESPUÉS, por partes)

**Criticidad:** 🔴 Crítica — crea/edita campos en la DB de WooCommerce. Requiere aprobación
explícita y backup previo (entorno local confirmado).

> Se hará **por sub-fases**, una a la vez, validando antes de seguir. No se ejecuta en esta sesión.

### Sub-fase 2A — Campos de cotización por producto
- Crear meta/ACF por producto:
  - `precio_tramos` (JSON con cantidad→precio) o usar precios de variaciones de Woo.
  - `tecnicas_disponibles` (lista).
- Script de poblado idempotente + backup (mismo patrón que `woo_poblar_3d.py`).
- `productos.js` lee los nuevos campos → reemplaza `TRAMOS_PRECIO` y `TECNICAS`.

### Sub-fase 2B — Datos globales de marca
- WhatsApp, badges y eyebrow → opciones globales (no por producto).
- Reemplazan las constantes de `cotizacion.js`.

### Sub-fase 2C — Limpieza
- Eliminar de `cotizacion.js` todo lo ya migrado; dejar solo fallbacks.

### ⚠️ Riesgos Fase 2 (a detallar antes de ejecutar)
- Sobrescribir campos existentes → backup obligatorio.
- Mapeo de precios incorrecto si la estructura no coincide.
- Sin rollback automático salvo backup previo.

---

## ❓ Preguntas abiertas
- [ ] **Número de WhatsApp** (formato internacional, ej. `573001234567`).
- [ ] ¿La técnica también debe afectar el precio, o solo la cantidad? (Fase 1 asume: solo cantidad).
- [ ] ¿El eyebrow es fijo ("ROPA DEPORTIVA PERSONALIZADA") o usa la subcategoría del producto?
- [ ] Fase 2: ¿precios por variación de Woo o un campo JSON de tramos propio?
