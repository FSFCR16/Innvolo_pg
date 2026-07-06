import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { nombre, correo, celular, empresa, producto } = await request.json()

    // ── Correo a INNVOLO ──────────────────────────────────────
    await resend.emails.send({
      from: "onboarding@resend.dev", // cambiar por tu dominio cuando lo tengas
      to: "fajarfsabo161@gmail.com",  // correo de INNVOLO
      subject: `Nueva cotización de ${nombre} - ${empresa}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0D1B2A;">Nueva solicitud de cotización</h2>
          <hr style="border-color: #C9A84C;" />
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #0D1B2A;">Nombre:</td>
              <td style="padding: 8px;">${nombre}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold; color: #0D1B2A;">Empresa:</td>
              <td style="padding: 8px;">${empresa}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #0D1B2A;">Correo:</td>
              <td style="padding: 8px;">${correo}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold; color: #0D1B2A;">Celular:</td>
              <td style="padding: 8px;">${celular}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #0D1B2A;">Solicitud:</td>
              <td style="padding: 8px;">${producto}</td>
            </tr>
          </table>
        </div>
      `
    })

    // ── Correo de confirmación al cliente ─────────────────────
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: correo,
      subject: "Recibimos tu cotización — INNVOLO",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0D1B2A; padding: 24px; text-align: center;">
            <h1 style="color: #C9A84C; margin: 0;">INNVOLO</h1>
          </div>
          
          <div style="padding: 32px;">
            <h2 style="color: #0D1B2A;">Hola ${nombre}, recibimos tu solicitud</h2>
            <p style="color: #4A4A4A;">
              Gracias por contactarnos. Tu solicitud de cotización está en revisión 
              y te responderemos en menos de 24 horas hábiles.
            </p>
            
            <div style="background: #f9f9f9; border-left: 4px solid #C9A84C; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #4A4A4A; font-style: italic;">${producto}</p>
            </div>

            <p style="color: #4A4A4A;">
              Si tienes alguna pregunta urgente puedes escribirnos por WhatsApp.
            </p>
          </div>

          <div style="background: #0D1B2A; padding: 16px; text-align: center;">
            <p style="color: #ffffff; margin: 0; font-size: 12px;">©2025 INNVOLO — Dotación e indumentaria corporativa</p>
          </div>
        </div>
      `
    })

    return Response.json({ ok: true, mensaje: "Cotización enviada correctamente" })

  } catch (error) {
    console.error(error)
    return Response.json(
      { ok: false, mensaje: "Error al enviar la cotización" },
      { status: 500 }
    )
  }
}
