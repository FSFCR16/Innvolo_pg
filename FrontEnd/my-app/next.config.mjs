import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
  // Las imágenes del catálogo son PNG grandes servidas por WordPress local
  // (innvolo.local / ngrok). Con force-dynamic, la optimización server-side de
  // Next descargaba y re-procesaba cada una con Sharp en cada visita → picos de
  // RAM que congelaban la máquina. unoptimized:true sirve la URL directa (sin
  // Sharp y sin exigir remotePatterns), lo que además arregla que la imagen no
  // cargue. Arreglo de fondo pendiente: reducir las PNG a ~800px WebP.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;