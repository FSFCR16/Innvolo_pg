import { z } from "zod"

export const cotizacionSchema = z.object({
  nombre: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre es muy largo"),
  
  correo: z.string()
    .email("El correo no es válido"),
  
  celular: z.string()
    .min(7, "El celular debe tener al menos 7 dígitos")
    .max(15, "El celular es muy largo")
    .regex(/^[0-9+\s-]+$/, "Solo se permiten números"),
  
  empresa: z.string()
    .min(2, "El nombre de la empresa debe tener al menos 2 caracteres"),
  
  producto: z.string()
    .min(10, "Por favor describe el producto que buscas"),
})