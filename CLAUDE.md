# CLAUDE.md — Catálogo Web 3D (INNVOLO)

## 🧠 Filosofía de trabajo

**Antes de cualquier cambio: PLAN PRIMERO.**

Claude no ejecuta nada sin presentar un plan detallado y recibir aprobación explícita. El flujo es siempre:

1. **Leer** → Inspeccionar los archivos relevantes antes de proponer nada
2. **Planear** → Describir exactamente qué se va a cambiar, dónde y por qué
3. **Clasificar criticidad** → Usando la escala de abajo
4. **Esperar aprobación** → No avanzar sin confirmación explícita del usuario
5. **Ejecutar** → Cambio atómico, verificable, documentado aquí

Si el usuario no dice explícitamente "sí", "adelante", "hazlo" o equivalente → **Claude no ejecuta.**

---

## 🚦 Escala de criticidad

| Nivel | Cuándo aplica | Qué hace Claude |
|-------|---------------|-----------------|
| 🟢 **Baja** | Cambio visual aislado, sin efecto en datos ni lógica de negocio | Propone el cambio con código listo, puede sugerir ejecutar de inmediato |
| 🟡 **Media** | Afecta comportamiento del visor, rutas, queries, o estilos globales | Presenta plan completo, espera aprobación antes de escribir una sola línea |
| 🔴 **Crítica** | Toca DB de WordPress/WooCommerce, archivos .glb originales, lógica de mapeo productos↔modelos, o cualquier operación irreversible | **Debe explicar: qué puede salir mal, qué no tiene rollback fácil, qué verificar antes.** Solo avanza con aprobación explícita. |

---

## 🗂️ Contexto del proyecto

### Tipo de sitio
Catálogo web de ropa deportiva — **sin checkout ni carrito**. Solo visualización de productos en 3D.

### Stack confirmado
- **Frontend:** WordPress (tema custom) + Three.js para el visor 3D
- **Modelos:** Archivos `.glb` servidos por producto
- **Backend:** WooCommerce en entorno **local** (no producción)
- **Ruta local de modelos 3D:** `C:\Users\Netapplicatiosn\Downloads\INNVOLO\3D`

### Campo de modelo 3D en WooCommerce
- Existe un campo custom por producto que almacena la referencia al modelo `.glb`
- Si Claude Code no puede identificar el nombre del campo inspeccionando el tema/plugin, debe **pedirle al usuario que lo busque en el admin de WP** (Productos → Editar producto → buscar campo de modelo/3D)

---

## 📋 Backlog de mejoras

### 1. 🔗 Mapeo productos ↔ modelos 3D
**Estado:** Pendiente  
**Objetivo:** Verificar si los nombres de los `.glb` en `C:\...\3D` coinciden con los nombres/SKUs de productos en WooCommerce y poblar el campo custom automáticamente.

**Lo que Claude debe hacer ANTES de ejecutar:**
1. Listar archivos `.glb` en la carpeta de modelos
2. Listar productos de WooCommerce (vía WP-CLI: `wp post list --post_type=product` o query SQL directa)
3. Comparar nombres — proponer tabla de mapeo al usuario para revisión visual
4. Identificar el campo custom donde va la referencia (ACF field, post meta, etc.)
5. Solo después de aprobación: escribir el script de actualización

**Criticidad:** 🔴 Crítica — escribe en la DB de WordPress. Sin aprobación no se toca.

**Riesgos a mencionar:** Sobrescribir campos existentes, mapeo incorrecto si los nombres no coinciden exactamente, no hay rollback automático salvo backup previo.

#### 📌 Datos confirmados del mapeo (rev. 2026-05-31)

- **Campo custom:** `meta_data` con key **`model_3d_url`** (URL del `.glb`). También existe `customization_zones` (JSON). Confirmado en `FrontEnd/my-app/src/lib/woocommerce/queries/productos.js`.
- **Productos en Woo:** 32 (ver IDs en `woo_catalog_state.json`). Todos con `model_3d_url` **vacío**, EXCEPTO el #1 (ver abajo).
- **Archivos `.glb`:** 34 en `C:\Users\Netapplicatiosn\Downloads\INNVOLO\3D`.

**Ya mapeado manualmente por el usuario:**
- `Polo / Camisa / Camiseta personalizada` (id 13, CAM-CORP) → **`POLO.glb`** ✅ (único producto con `.glb` cargado en Woo).

**Mapeo confirmado pendiente de escribir:**
- `Botilito bebidas frías` (id 232, BOTILITO) → **`TERMO.glb`** (decisión del usuario).

#### ⚠️ Sobran: `.glb` que NO se pudieron mapear a ningún producto
- `CAMISA.glb` — el producto Polo/Camisa/Camiseta ya usa `POLO.glb`.
- `CAMISETA.glb` — ídem.
- `OVEROL.glb` — el producto "Bata / Overol" usa `BATA.glb`.
- `UNIFORME MEDICA.glb` — no hay producto equivalente.
- `BOLSO.glb` — posible candidato para `Mochila` (id 280), **sin confirmar**.

#### ❌ Faltan: productos SIN archivo `.glb` (el usuario los revisará después)
- `Vaso personalizado` (id 245, VASO) — no existe `.glb` de vaso.
- `Delantal personalizado` (id 193, DELANTAL) — no existe `.glb` de delantal.
- `Mochila personalizada` (id 280, MOCHILA) — sin `.glb` propio; candidato `BOLSO.glb` por confirmar.

---

### 2. 🎨 Mejora de texturas (sin modificar .glb)
**Estado:** Pendiente  
**Objetivo:** Mejorar la apariencia visual de los materiales en runtime, sin tocar los archivos del modelo.

**Approach técnico (Three.js + GLB):**
- Después de cargar el modelo con `GLTFLoader`, recorrer `scene.traverse()` para encontrar todos los `MeshStandardMaterial` o `MeshPhysicalMaterial`
- Ajustar propiedades en runtime: `roughness`, `metalness`, `envMapIntensity`, `normalScale`, `aoMapIntensity`
- Agregar un `envMap` (HDR environment map) si no hay uno — mejora dramáticamente la calidad visual
- Considerar añadir una textura de normal map de tela si los materiales no la tienen

**Criticidad:** 🟡 Media — solo afecta render visual, cero riesgo en datos

---

### 3. ✨ Reducir brillo / efecto de tela realista
**Estado:** Pendiente  
**Objetivo:** La ropa se ve brillante/plástica. Debe lucir como tela (matte fabric look).

**Approach técnico (Three.js):**
```js
// Objetivo de valores para materiales de tela
material.roughness = 0.85        // era probablemente ~0.3-0.5
material.metalness = 0.0         // era probablemente > 0
material.envMapIntensity = 0.3   // reducir reflejo del entorno
// Si el material es MeshPhysicalMaterial:
material.sheen = 1.0             // efecto de microfibra/velour
material.sheenRoughness = 0.8
material.sheenColor.set(0xffffff)
```

Claude debe primero **leer el código del visor** para ver qué valores actuales tienen los materiales antes de proponer números concretos.

**Criticidad:** 🟡 Media

---

### 4. 🎨 Paleta de colores primarios más natural
**Estado:** Pendiente  
**Objetivo:** Reemplazar los colores primarios actuales (random) por una paleta coherente y natural.

**Lo que Claude debe hacer ANTES:**
1. Identificar dónde están definidos los colores: CSS variables (`:root`), `theme.json`, `style.css` del tema, o archivo de configuración JS
2. Listar los colores actuales con sus valores hex
3. **Proponer paleta nueva** con justificación (no ejecutar sin mostrar la propuesta primero)
4. Aplicar solo en scope limitado primero para validar antes de aplicar globalmente

**Criticidad:** 🟡 Media — estilos globales afectan toda la UI

---

### 5. 🏷️ Logos en productos mejorados con IA
**Estado:** Exploración  
**Objetivo:** Que los logos se vean bien aplicados sobre la ropa 3D — con perspectiva, deformación según la superficie, integración realista.

**Dos enfoques posibles — Claude debe evaluar cuál aplica:**

**A) Runtime en Three.js (no destructivo):**
- Aplicar el logo como una textura en el canal de mapa de color o decal sobre el mesh
- Three.js tiene soporte para `DecalGeometry` — permite proyectar una imagen sobre una superficie 3D respetando su geometría
- No modifica el .glb, es una capa adicional en runtime

**B) Pipeline de generación con IA (pre-render):**
- Usar Replicate / fal.ai con un modelo de inpainting o ControlNet
- Input: render del producto + logo PNG con canal alpha
- Output: imagen con logo integrado respetando pliegues y curvatura de la tela
- Útil si el catálogo usa imágenes estáticas como fallback

**Criticidad:** 🟢 Baja si es DecalGeometry (capa adicional). 🔴 Crítica si reemplaza assets existentes.

**Claude debe preguntar** cuál enfoque prefiere el usuario antes de proponer código.

---

## ⚙️ Reglas operativas para Claude Code

1. **Leer antes de escribir.** Siempre inspeccionar el archivo relevante antes de proponer cambios. Nunca asumir la estructura del código.

2. **Nunca modificar archivos `.glb` originales.** Todos los ajustes de materiales van en el JS del visor, en runtime.

3. **Nunca escribir en la DB de WordPress sin aprobación explícita** y sin confirmar que existe un backup o que el entorno es local (ya confirmado: es local, pero igual pedir aprobación).

4. **Para el visor Three.js:** siempre buscar el punto donde se llama `GLTFLoader.load()` y dónde se procesa la `scene` resultante. Los cambios de material van en ese bloque, dentro de `scene.traverse()`.

5. **Para cambios de CSS globales:** proponer el cambio con scope acotado (ej. una clase específica) antes de aplicar a `:root` o al tema completo.

6. **Si no encuentra el nombre del campo 3D en WooCommerce:** no adivinar. Pedirle al usuario que vaya a WP Admin → Productos → editar cualquier producto → identificar el campo visualmente.

7. **Documentar todo cambio ejecutado** en la sección `## 📝 Cambios realizados` al final de este archivo.

8. **Si un cambio es 🔴 crítico**, escribir explícitamente:
   - ⚠️ Por qué es crítico
   - 🔁 Si tiene rollback y cómo hacerlo
   - ✅ Qué debe verificar el usuario antes de dar luz verde

---

## 📝 Cambios realizados

### 2026-07-06 — Subida de imágenes del catálogo a WooCommerce (36 productos) 🔴
- **Qué:** se subieron las 36 imágenes de `Downloads/INNVOLO/IMAGENES CATALOGO/_staged` (`NN-slug.png`) a Woo, 1 por producto. Resultado: **36/36 productos con imagen, 0 fallos**.
- **Contexto:** Woo ahora tiene **36 productos = 1:1 con el Excel** (un chat previo separó las fusiones: Camisa 354, Camiseta 371, Polo 13, Overol 388, Bata 215, Botella 405). Descripción/materiales/colores/técnica/`precio_20/50/100/500` **ya estaban** poblados; **solo faltaban las imágenes** (todos tenían 0).
- **Cómo (por el bloqueo SSRF de WP):** `wp/v2/media` rechaza las claves WC (401) y `download_url()` bloquea `localhost`/IP privada. Solución: copiar las imágenes a `Local Sites/innvolo/app/public/_staged_import/` → servidas por WP → `PUT /wc/v3/products/{id}` con `images:[{src: https://<ngrok>/_staged_import/NN.png}]` → WC las importa a la media library (`/wp-content/uploads/2026/07/...`). Carpeta temporal **borrada** tras la importación.
- **Mapeo:** match automático por nombre + 2 correcciones manuales (`05-gorra-dril`→id 30, `19-vaso-termico-botilito`→id 232). Verificado 36→36 IDs distintos.
- **Backup:** `scratchpad/woo_img_backup.json` (estado previo: todos con 0 imágenes). **Rollback:** vaciar `images` de los 36 ids.
- ⚠️ **Pendiente:** las URLs de imagen son `https://innvolo.local/...` → rompen en Vercel. Se reescribirá el host al hacer la product page dinámica (mismo patrón que `normalizarModelUrl`).

### 2026-07-06 — Fix modelos 3D en producción: servir `.glb` desde Vercel + URL relativa 🟡
- **Problema:** en prod el visor fallaba ("This page couldn't load"). El `.glb` se pedía a `http://localhost:3000/modelos/X.glb` (valor de `model_3d_url` en Woo, apunta a la PC de dev) y además los `.glb` estaban **gitignored** (no se desplegaban a Vercel).
- **Fix (sin tocar la DB de Woo):**
  - `queries/productos.js`: nueva `normalizarModelUrl()` convierte la URL absoluta a localhost en **ruta relativa** (`/modelos/X.glb`) → resuelve contra el dominio actual (localhost en dev, `*.vercel.app` en prod).
  - `.gitignore` (my-app): se quitó la exclusión `/public/modelos/*.glb`.
  - Se versionaron **29 `.glb` optimizados (~69 MB)** para que Vercel los sirva desde `/public/modelos/`.
- **Sin tocar:** DB de Woo, `.glb` originales de `Downloads/INNVOLO/3D` (regla #2 intacta — se commitearon las copias ya optimizadas). **Rollback:** `git revert` del commit + restaurar línea en `.gitignore`.
- **Pendiente:** productos sin modelo propio (Mochila 280, Vaso 245, Delantal 193) siguen sin `.glb`. Si el repo crece mucho a futuro → migrar a Vercel Blob/CDN (opción B, requiere escribir `model_3d_url` en Woo = 🔴).

### 2026-07-06 — Fix deploy Vercel: build con Webpack (ENOENT `routes-manifest-deterministic.json`) 🟡
- **Problema:** el deploy en Vercel fallaba con `ENOENT ... /vercel/path0/.next/routes-manifest-deterministic.json` **pese a** que `next build` reportaba `✓ Build Completed`. Ese archivo NO lo genera Next (confirmado: no aparece en `node_modules/next` ni en un `next build` local) — lo produce el adaptador de Vercel al finalizar. El build corría con **Turbopack** (`▲ Next.js 16.2.1 (Turbopack)`), que no emite lo que el adaptador espera. Root Directory (`FrontEnd/my-app`) y el toggle "include files outside root" ya estaban correctos, así que no era eso.
- **Fix:** `FrontEnd/my-app/package.json` → `"build": "next build --webpack"` (modo estable). `dev` sigue con Turbopack. Validado local: compila limpio, 10/10 páginas, misma tabla de rutas.
- **Sin tocar:** Woo, queries, `.glb`, estilos, DB. **Rollback:** `git checkout package.json`.
- **Nota Woo:** los `[fetchWoo] falló ... fetch failed` del log son esperados (Woo es local `https://innvolo.local`, inalcanzable desde Vercel). Para poblar el catálogo en prod se levantó **ngrok** (`ngrok http 80 --host-header=innvolo.local`) y se apunta `WC_BASE_URL` en las env vars de Vercel a la URL pública de ngrok. Requiere PC + LocalWP + ngrok encendidos (rutas de catálogo son `ƒ` dinámicas → consultan Woo en cada request). Solución real de prod = mover WP a hosting público.

### 2026-07-06 — Fix build Vercel: `useSearchParams` sin Suspense 🟡
- **Problema:** el build de Vercel fallaba al prerenderizar `/contactanos` — `useSearchParams() should be wrapped in a suspense boundary`. `FormularioCotizacion.js` usa `useSearchParams()` (lee `?producto` y `?asunto`) y en Next 16 eso obliga a un `<Suspense>` en páginas estáticas.
- **Fix:** `src/components/home/FormularioCotizacion.js` — el `export default` ahora es un wrapper que envuelve la lógica (renombrada a `FormularioCotizacionInner`) en `<Suspense fallback={null}>`. Arregla las 2 páginas que lo usan (`/contactanos` y home) y cualquier uso futuro. Import de `Suspense` añadido.
- **Verificado:** `npm run build` local → `Compiled successfully`, `10/10` páginas, `/contactanos` como ○ estático.
- **Sin tocar:** Woo, queries, `.glb`, estilos. **Rollback:** `git checkout` de `FormularioCotizacion.js`.

### 2026-06-12 — Unificación de diseño: catálogo / categoría / subcategoría + zoom 3D 🟡
- **Zoom 3D de inicio:** `VisorProducto3D.jsx` ahora usa `<Bounds fit clip observe margin={0.85}>` (en vez de `<Center>`) → encuadra el modelo lo más grande posible al cargar, adaptándose al tamaño de cada `.glb`. `OrbitControls` con `makeDefault`, `minDistance 1.2` / `maxDistance 6`.
- **Banda de marca con variantes:** `BandaMarcaProducto.js` admite `variante` = `simetrico | confianza | cinta | atmosferico | premium`. **Default = `premium`** (combinación elegida B+D): fondo navy con degradado + grano SVG + halo dorado, eyebrow a la izq + 3 sellos de confianza a la der (ocultos en móvil). Keyframes `marquee` en `globals.css`. Página temporal de comparación: `src/app/preview-banda/page.jsx` (BORRAR cuando se confirme).
- **Páginas de listado unificadas** con el lenguaje de la product page (banda + encabezado editorial + tarjetas premium). Reemplazado `HeroPagina` por `<BandaMarcaProducto />` en: `catalogo/page.jsx`, `catalogo/[categoria]/page.jsx`, `catalogo/[categoria]/[subcategoria]/page.jsx`. `HeroPagina` se conserva (lo usan Nosotros y Contáctanos).
- **Nuevo** `EncabezadoCatalogo.js`: encabezado editorial (regla dorada + eyebrow + título Playfair `font-titulo` + subtítulo + contador de productos).
- **Tarjetas premium:** `TarjetaProducto.js` (portrait `aspect-[4/5]`, `rounded-2xl`, ring suave, hover lift + zoom, eyebrow dorado, "Ver producto →"). `TarjetaCategoria.js` (rounded-2xl, hover lift, nombre en Playfair, regla dorada animada). `GridProductos.js` (buscador redondeado tipo pill + contador + estado vacío). `SidebarCategorias.js` (encabezado Playfair + regla dorada).
- **Sin tocar:** WooCommerce, queries, `.glb`, visor legado, páginas Nosotros/Contáctanos. ESLint limpio. Sin cambios en fuentes/colores globales (se usó `font-titulo` ya existente).
- **Rollback:** `git checkout` de los 3 `page.jsx` de catálogo + `TarjetaProducto/TarjetaCategoria/GridProductos/SidebarCategorias/VisorProducto3D` + `globals.css`; borrar `EncabezadoCatalogo.js` y `preview-banda/`.

### 2026-06-12 — Remaster Product Page · galería + ficha técnica + sin personalización 🟡
- **Decisión clave:** el visor 3D pasa a ser **solo de exhibición** (gira con `autoRotate` + arrastre). Se **quitó toda la personalización** de la product page (subir logo, texto, sliders tamaño/rotación, zonas, color picker libre, descargar PNG, mockup IA) — ya no es personalizable. Ref. del usuario: captura `Downloads/Captura de pantalla 2026-06-12 010108.png`.
- **Nuevo** `src/components/visor3d/VisorProducto3D.jsx`: visor lean display-only (rota + tela mate + prop `color` para tintar). **El visor legado `Visor3D.jsx` NO se tocó** (lo sigue usando `test-visor`).
- **Nuevo** `src/components/productos/GaleriaProducto.js`: galería con **carrusel de imágenes** (`producto.imagenes` de Woo, miniaturas + flechas) y **toggle a vista 3D** (chip 3D). Antes el 3D ocupaba toda la columna izquierda.
- **Config** `src/lib/config/cotizacion.js` ampliado (valores quemados, espejan el mockup `Downloads/WhatsApp...7.13.32 PM.jpeg`): `FICHA_TECNICA` (Material/Gramaje/Tallas/Colores base/Mínimo/Técnicas), `PROCESO_TEXTO`, `ENVIOS_TEXTO`, `COLORES_HEX` (nombre→hex compartido), `COLORES_BASE_DEFAULT`. `BADGES` actualizados a "Toda Colombia · Entrega 10–15 días · Garantía de calidad".
- **Reescrito** `DetalleProductoCliente.js`: diseño editorial premium (título `font-titulo` Playfair, reglas doradas, columna der. sticky). Añade **COLORES DISPONIBLES** (swatches reales de Woo o paleta default; el color tinta el visor 3D y va en el mensaje de WhatsApp). Ficha técnica curada estilo mockup (grid) + acordeones "¿Cómo funciona el proceso?" / "Envíos y tiempos" + acordeón "Especificaciones del producto" con atributos reales de Woo si existen. Se mantienen cantidad/técnica/precio en vivo, CTAs y "También te puede interesar".
- **Sin tocar:** WooCommerce, queries, `.glb`, `Visor3D.jsx` legado, ruta `/api/mockup`. ESLint limpio. Paleta/fuentes globales sin cambios (se usó `font-titulo` ya existente).
- **3D primero:** la galería abre en la vista 3D girando cuando el producto tiene modelo (imágenes a un clic en miniaturas).
- **Hero PDP → banda delgada:** se reemplazó el hero-banner (duplicaba imagen + nombre del producto y generaba doble `<h1>`) por **`src/components/layout/BandaMarcaProducto.js`**: banda navy fina con regla dorada + `EYEBROW` + wordmark "INNVOLO". Decisión del usuario. El eyebrow se quitó de la columna derecha (la banda lo lleva). `HeroPagina` legado intacto (lo usan las páginas de categoría).
- **Rollback:** `git checkout` de `DetalleProductoCliente.js`, `cotizacion.js` y `page.jsx`; borrar `GaleriaProducto.js`, `VisorProducto3D.jsx` y `BandaMarcaProducto.js`.
- **Pendiente:** valores de ficha/colores siguen quemados → migran en Fase 2 junto con precios/técnicas.

### 2026-06-12 — Rediseño Product Page · FASE 1 (valores quemados) 🟡
- **Plan:** `PLAN_PRODUCT_PAGE.md` (raíz). Norte visual: `Downloads/innvolo_pagina_producto_polo.html`. Skill de diseño instalada: `.claude/skills/frontend-design/` (oficial Anthropic).
- **Nuevo** `src/lib/config/cotizacion.js`: TODO lo quemado centralizado (WhatsApp `573112424872`, eyebrow, `TRAMOS_PRECIO` placeholder [12=$39.900 · 25=$34.900 · 50=$31.900 · 100+=$28.900], `TECNICAS`, `BADGES`, `formatoCOP`). En Fase 2 esto sale de WooCommerce.
- **Reescrito** `src/components/productos/DetalleProductoCliente.js`: columna derecha estilo mockup — eyebrow, título, descripción, selector CANTIDAD (cambia el precio en vivo, `useState`), selector TÉCNICA, caja de precio crema, CTA dorado "Cotizar por WhatsApp" (`wa.me` con mensaje armado: producto+cantidad+técnica+precio), CTA outline "Solicitar muestra física" (→ `/contactanos?...&asunto=muestra-fisica`), 3 badges, acordeones (Ficha técnica con atributos reales de WP + 2 bloques de copy quemado). Se mantiene Visor3D y "También te puede interesar". NO se agregó sección de reseñas.
- **Editado** `src/components/home/FormularioCotizacion.js`: lee `asunto=muestra-fisica` → mensaje por defecto específico de muestra.
- Iconos: `react-icons` (ya dependencia). ESLint limpio. **Sin tocar WooCommerce ni el visor.** Rollback: `git checkout` de los 3 archivos + borrar `cotizacion.js`.
- **Pendiente FASE 2 (🔴, otra sesión):** crear campos en WP (precio_tramos/tecnicas) y reemplazar lo quemado. Ver plan.

### 2026-05-31 — IA Fase 3: mockup realista con OpenAI 🟡
- **Ruta** `src/app/api/mockup/route.js` (server-side): recibe la captura PNG del visor → `client.images.edit` con `gpt-image-1` (calidad media, 1024x1024) → devuelve la imagen como dataURL. La key vive solo en el servidor.
- **Visor:** botón "Ver mockup realista (IA)" → captura el canvas → llama la ruta → muestra el resultado + descarga. Bajo demanda (no auto), botón deshabilitado mientras genera.
- **Costo:** ~$0.04–0.07 por mockup. Requiere `openai` (npm) instalado y cuenta OpenAI con billing.
- ⚠️ `gpt-image-1` puede requerir verificación de organización en OpenAI (Settings → Organization).
- **Productos irregulares** (`TIPOS_IRREGULARES = accesorio, mascota`): se ocultan los controles de colocación en vivo (clic/zonas/sliders); el usuario solo sube logo/texto y la IA lo integra en el mockup (el logo se manda como 2ª imagen a `images.edit`). El prompt es type-aware y prohíbe transformar el objeto en otra cosa.

### 2026-05-31 — IA Fase 1: clasificación de productos → zonas dinámicas 🔴/🟡
- **Clasificación IA:** `clasificar_productos.py` usa OpenAI (`gpt-4.1-mini`) para clasificar los 32 productos por nombre en un tipo, guardado en meta **`tipo_3d`** en Woo. Tipos: `torso`, `gorra`, `recipiente`, `bolso`, `accesorio`, `mascota`. Override manual: Cofia (210) → `gorra`. Backup en `tipo_3d_backup.json`. Modo dry-run por defecto; `--write` para escribir.
- **Visor:** `ZONAS_POR_TIPO` en `Visor3D.jsx` — cada tipo muestra solo sus zonas (ej. gorra: Frente/Lateral/Trasera; recipiente: Frente/Atrás) y las coloca con raycast direccional por bounding box. `tipo3d` se lee en `queries/productos.js` y baja por `page.jsx` → `DetalleProductoCliente` → `Visor3D`.
- **Colores:** `coloresVariantes` ahora SÍ llega al visor (antes no se pasaba) — muestra los colores reales del producto.
- **Key OpenAI:** en `.env` (raíz, para scripts Python) y `my-app/.env.local` (para runtime Next). Ambos en `.gitignore`.

### 2026-05-31 — Tela mate + experiencia de personalización (sin IA) 🟡
Todo en `FrontEnd/my-app/src/components/visor3d/Visor3D.jsx`:
- **Tela mate (#3):** materiales convertidos a `MeshPhysicalMaterial` con `roughness 0.95`, `envMapIntensity 0.25` (mata el brillo en colores oscuros) y `sheen 1.0` / `sheenRoughness 0.8` (efecto microfibra).
- **Descargar mockup (E):** botón "Descargar mi diseño (PNG)" — captura el canvas (`preserveDrawingBuffer: true`).
- **Texto personalizado (D):** input de texto + color → genera imagen y la coloca como decal (reusa el flujo del logo; logo *o* texto, un decal a la vez).
- **Zonas rápidas (C1):** botones Pecho / Espalda / Manga izq-der → colocación automática aproximada por bounding box (raycast desde frente/espalda/lados).
- Pendiente real: C2 (zonas precisas por producto usando `customization_zones`), y mejoras CON IA (quedaron descartadas por ahora).

### 2026-05-31 — Optimización de modelos `.glb` (carga lenta) 🟡
- **Problema:** los 28 `.glb` pesaban 26–30 MB → el visor tardaba mucho en cargar. Causa: geometría de alto poligonaje (~25 MB de vértices), no la textura.
- **Solución:** `gltf-transform simplify --ratio 0.06 --error 0.01` + `webp --quality 85` sobre las copias en `public/modelos/` (sobrescritas en sitio, mismos nombres → URLs intactas). Mismo enfoque que el Polo (`CAMISA-v1.glb`).
- **Resultado:** cada modelo 26–30 MB → **2–5 MB**. Carpeta `public/modelos/` de ~780 MB → **69 MB**.
- **Originales intactos:** `C:\...\Downloads\INNVOLO\3D` no se tocó (regla #2). Regenerable con `optimizar_glb.sh`.
- **Page de prueba:** `src/app/test-visor/page.jsx` ahora acepta `?model=/modelos/<archivo>.glb` para previsualizar.

### 2026-05-31 — Poblado de `model_3d_url` (28 productos) 🔴
- **Qué:** se copiaron 28 `.glb` de `Downloads\INNVOLO\3D` a `FrontEnd/my-app/public/modelos/` (nombre sin espacios) y se escribió `model_3d_url = http://localhost:3000/modelos/<archivo>.glb` en sus productos de WooCommerce.
- **Convención:** calcada del Polo (id 13, ACF field `field_6a13719b38132`). URL absoluta a `localhost:3000`, modelo servido por Next desde `public/modelos/`.
- **Estado final:** 29 productos CON modelo (28 + Polo). **Sin asignar (pendientes del usuario):** Mochila (280), Vaso (245), Delantal (193).
- **Backup:** `woo_3d_backup.json` (estado previo de los 28, todos vacíos). Script: `woo_poblar_3d.py` (idempotente, salta los que ya tienen valor).
- **Git:** `.gitignore` de `my-app` ahora excluye `/public/modelos/*.glb` (~28MB c/u) para no inflar el repo.
- **Rollback:** volver a poner `model_3d_url=''` en los 28 ids del backup; opcionalmente borrar los `.glb` de `public/modelos/`.

---

## ❓ Preguntas abiertas

- [ ] ¿Cuál es el nombre exacto del campo/meta en WooCommerce que referencia el modelo `.glb` por producto? (buscar en WP Admin → editar producto)
- [ ] ¿Los nombres de los `.glb` en `C:\...\3D` siguen alguna convención? (SKU, nombre de producto, código interno)
- [ ] ¿El tema WordPress es completamente custom o está basado en un starter/theme comercial?
- [ ] ¿Hay `envMap` / HDRI configurado actualmente en el visor Three.js?
- [ ] Para los logos: ¿prefiere aplicarlos en runtime (DecalGeometry) o como pipeline de imagen pre-generada?
