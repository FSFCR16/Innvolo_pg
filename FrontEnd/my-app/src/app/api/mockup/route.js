import OpenAI, { toFile } from "openai"

const client = new OpenAI()

export async function POST(request) {
  try {
    const { imagen, logo, nombreProducto = "producto", tipo3d = "torso" } = await request.json()
    if (!imagen) {
      return Response.json({ ok: false, mensaje: "Falta la imagen" }, { status: 400 })
    }

    const toBuffer = (dataUrl) => Buffer.from(dataUrl.replace(/^data:image\/\w+;base64,/, ""), "base64")

    const DESC_TIPO = {
      torso: "una prenda de vestir, con tela y pliegues realistas",
      gorra: "una gorra",
      recipiente: "un recipiente o botella",
      bolso: "un bolso",
      accesorio: "un accesorio/objeto promocional",
      mascota: "un producto para mascotas",
    }
    const tipoDesc = DESC_TIPO[tipo3d] || "un producto"

    const images = [await toFile(toBuffer(imagen), "producto.png", { type: "image/png" })]
    let prompt

    if (logo) {
      // Irregular: el logo viene aparte y la IA lo integra
      images.push(await toFile(toBuffer(logo), "logo.png", { type: "image/png" }))
      prompt =
        `La PRIMERA imagen es ${tipoDesc}: "${nombreProducto}". La SEGUNDA imagen es el logo del cliente. ` +
        `Genera una fotografía de producto profesional del MISMO producto de la primera imagen (no lo ` +
        `cambies por otro), con el logo de la segunda imagen aplicado de forma realista e integrada sobre ` +
        `su superficie, respetando la forma, curvatura e iluminación. Fondo de estudio neutro y limpio. ` +
        `No agregues prendas, texto ni objetos que no estén en las imágenes.`
    } else {
      // Regular: el logo ya está en el render
      prompt =
        `Esta es una captura 3D de ${tipoDesc}: "${nombreProducto}". ` +
        `Genera una fotografía de producto profesional para catálogo e-commerce del MISMO objeto. ` +
        `NO lo conviertas en otra cosa (no lo transformes en una camiseta ni en otro producto): ` +
        `conserva su forma, su color y el logo/diseño exactamente como aparecen, integrando el logo ` +
        `de forma realista sobre su superficie. Fondo de estudio neutro y limpio, iluminación suave ` +
        `de producto. No agregues prendas, texto ni objetos que no estén en la imagen original.`
    }

    const result = await client.images.edit({
      model: "gpt-image-1",
      image: images,
      prompt,
      size: "1024x1024",
      quality: "medium",
    })

    const b64 = result.data[0].b64_json
    return Response.json({ ok: true, imagen: `data:image/png;base64,${b64}` })
  } catch (error) {
    console.error("mockup error:", error)
    return Response.json(
      { ok: false, mensaje: error?.message || "Error generando el mockup" },
      { status: 500 }
    )
  }
}
