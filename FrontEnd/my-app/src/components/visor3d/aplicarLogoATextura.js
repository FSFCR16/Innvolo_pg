import * as THREE from "three"

/**
 * Compone una nueva textura combinando la textura base + un logo en una zona UV.
 *
 * @param {THREE.Texture} texturaBase - La textura original del modelo
 * @param {HTMLImageElement} logoImg - La imagen del logo cargada
 * @param {Object} zona - { uvX, uvY, uvWidth, uvHeight } en rango 0-1
 * @param {String} color - Color de fondo de la prenda (hex)
 * @returns {THREE.CanvasTexture} - Nueva textura lista para asignar al material
 */


export function componerTextura(texturaBase, logoImg, zona, color = "#FFFFFF") {
  const w = texturaBase?.image?.width || 1024
  const h = texturaBase?.image?.height || 1024

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")

  // Fondo del color
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)

  // Textura base en multiply
  if (texturaBase?.image) {
    ctx.globalCompositeOperation = "multiply"
    ctx.drawImage(texturaBase.image, 0, 0, w, h)
    ctx.globalCompositeOperation = "source-over"
  }

  // === MODO DEBUG: grilla UV ===
  // Dibuja una grilla 10x10 con colores y números para saber qué zona UV corresponde a cada parte del modelo
  ctx.globalAlpha = 0.7
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      // Color único por celda
      const hue = (i * 10 + j) * 3.6
      ctx.fillStyle = `hsl(${hue}, 80%, 50%)`
      ctx.fillRect(i * w / 10, j * h / 10, w / 10, h / 10)

      // Texto con coordenadas UV
      ctx.globalAlpha = 1
      ctx.fillStyle = "#000"
      ctx.font = "bold 24px Arial"
      ctx.fillText(
        `${(i / 10).toFixed(1)},${(j / 10).toFixed(1)}`,
        i * w / 10 + 10,
        j * h / 10 + 40
      )
      ctx.globalAlpha = 0.7
    }
  }
  ctx.globalAlpha = 1

  // (omitimos el logo durante debug)

  const textura = new THREE.CanvasTexture(canvas)
  textura.flipY = false
  textura.colorSpace = THREE.SRGBColorSpace
  textura.needsUpdate = true

  return textura
}

export function cargarImagen(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    if (src instanceof File) {
      img.src = URL.createObjectURL(src)
    } else {
      img.src = src
    }
  })
}

