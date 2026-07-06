import { Poppins, Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import Navbar from "../components/layout/Navbar.js"
import Footer from "../components/layout/Footer.js"
import { getCategorias } from "@/lib/woocommerce/queries/categorias"
import ProgressBar from "@/components/ui/progressBar.js"
import { Toaster } from "react-hot-toast"

// Tipografía alineada al Manual de Marca INNVOLO (sustitutas open-source, licencia SIL):
// Cormorant Garamond ≈ Garalda (serif primaria), Poppins ≈ Now (sans secundaria).
const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const cormorant = Cormorant_Garamond({
  variable: "--font-titulo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
})

export const metadata = {
  title: "INNVOLO | Dotación e indumentaria corporativa",
  description: "Diseñamos y producimos prendas personalizadas para empresas que quieren proyectar identidad, estilo e innovación.",
}

export default async function RootLayout({ children }) {
  const categorias = await getCategorias()

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${cormorant.variable}`}
    >
      <body>
        <Navbar categorias={categorias} />
        <ProgressBar />
        {children}
        <Toaster position="top-right" />
        <Footer />
      </body>
    </html>
  )
}