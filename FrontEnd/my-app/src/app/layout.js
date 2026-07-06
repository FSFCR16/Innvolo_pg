import { Inter, Playfair_Display, Dancing_Script } from "next/font/google"
import "./globals.css"
import Navbar from "../components/layout/Navbar.js"
import Footer from "../components/layout/Footer.js"
import { getCategorias } from "@/lib/woocommerce/queries/categorias"
import ProgressBar from "@/components/ui/progressBar.js"
import { Toaster } from "react-hot-toast"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const playfair = Playfair_Display({
  variable: "--font-titulo",
  subsets: ["latin"],
})

const dancing = Dancing_Script({
  variable: "--font-cursiva",
  subsets: ["latin"],
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
      className={`${inter.variable} ${playfair.variable} ${dancing.variable}`}
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