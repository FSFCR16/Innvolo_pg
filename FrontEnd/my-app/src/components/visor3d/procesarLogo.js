/**
 * Aplica chroma key: convierte píxeles cercanos al color objetivo en transparentes.
 *
 * @param {HTMLImageElement} img - Imagen original
 * @param {Object} options - { tolerancia: 0-255, colorObjetivo: 'auto' | [r,g,b] }
 * @returns {Promise<HTMLImageElement>} - Nueva imagen con transparencia
 */
/**
 * Aplica chroma key: convierte píxeles cercanos al color objetivo en transparentes.
 */
export async function aplicarChromaKey(img, options = {}) {
  const { tolerancia = 30, colorObjetivo = "auto" } = options

  const canvas = document.createElement("canvas")
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext("2d")
  ctx.drawImage(img, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  let [r0, g0, b0] = colorObjetivo === "auto"
    ? detectarColorFondo(data, canvas.width, canvas.height)
    : colorObjetivo

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const distancia = Math.sqrt(
      (r - r0) ** 2 + (g - g0) ** 2 + (b - b0) ** 2
    )

    if (distancia < tolerancia) {
      data[i + 3] = 0
    } else if (distancia < tolerancia * 1.5) {
      const t = (distancia - tolerancia) / (tolerancia * 0.5)
      data[i + 3] = Math.round(t * 255)
    }
  }

  ctx.putImageData(imageData, 0, 0)

  return new Promise((resolve) => {
    const nuevaImg = new Image()
    nuevaImg.crossOrigin = "anonymous"
    nuevaImg.onload = () => resolve(nuevaImg)
    nuevaImg.src = canvas.toDataURL("image/png")
  })
}

function detectarColorFondo(data, w, h) {
  const esquinas = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ]

  let r = 0, g = 0, b = 0
  for (const [x, y] of esquinas) {
    const i = (y * w + x) * 4
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
  }

  return [r / 4, g / 4, b / 4]
}
