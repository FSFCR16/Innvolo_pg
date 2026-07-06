"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, useGLTF, Environment, Center } from "@react-three/drei"
import { Suspense, useEffect, useState, useMemo, useRef } from "react"
import * as THREE from "three"
import LogoDecal from "./LogoDecal"
import { aplicarChromaKey } from "./procesarLogo"

const COLORES_HEX = {
  "Negro":        "#1a1a1a",
  "Blanco":       "#FFFFFF",
  "Rojo":         "#e53935",
  "Azul":         "#1e88e5",
  "Verde":        "#43a047",
  "Gris":         "#9e9e9e",
  "Amarillo":     "#fdd835",
  "Naranja":      "#fb8c00",
  "Azul marino":  "#283593",
  "Beige":        "#d7c4a3",
  "Vinotinto":    "#8e1d2d",
}

const COLORES_RAPIDOS = ["#e53935", "#1e88e5", "#43a047", "#fdd835", "#000000", "#ffffff"]

// Zonas de colocación por tipo de producto (clasificado con IA en Woo: meta `tipo_3d`).
// from = desde dónde se lanza el rayo; yFactor = altura relativa (0 = centro).
const ZONAS_POR_TIPO = {
  torso: [
    { id: "pecho",      label: "Pecho",      from: "front", yFactor: 0.2 },
    { id: "espalda",    label: "Espalda",    from: "back",  yFactor: 0.2 },
    { id: "manga-izq",  label: "Manga izq",  from: "left",  yFactor: 0.3 },
    { id: "manga-der",  label: "Manga der",  from: "right", yFactor: 0.3 },
  ],
  gorra: [
    { id: "frente",      label: "Frente",      from: "front", yFactor: 0.3 },
    { id: "lateral-izq", label: "Lateral izq", from: "left",  yFactor: 0.3 },
    { id: "lateral-der", label: "Lateral der", from: "right", yFactor: 0.3 },
    { id: "trasera",     label: "Trasera",     from: "back",  yFactor: 0.3 },
  ],
  recipiente: [
    { id: "frente", label: "Frente", from: "front", yFactor: 0.0 },
    { id: "atras",  label: "Atrás",  from: "back",  yFactor: 0.0 },
  ],
  bolso: [
    { id: "frente",  label: "Frente",  from: "front", yFactor: 0.0 },
    { id: "lateral", label: "Lateral", from: "right", yFactor: 0.0 },
  ],
  accesorio: [
    { id: "centro", label: "Centro", from: "front", yFactor: 0.0 },
  ],
  mascota: [
    { id: "frente", label: "Frente", from: "front", yFactor: 0.0 },
  ],
}

// Productos de forma irregular: no se coloca el logo en vivo (el decal se fragmenta).
// En su lugar se sube el logo y la IA lo integra en el mockup.
const TIPOS_IRREGULARES = new Set(["accesorio", "mascota"])

function Escena({ url, color, logoImg, tamanoLogo, rotacionLogo, onClickModelo, zonaSolicitada, onZonaColocada, colocable = true }) {
  const { scene } = useGLTF(url)
  const [meshTarget, setMeshTarget] = useState(null)
  const [decalData, setDecalData] = useState(null)
  const { raycaster } = useThree()

  // Aplicar color y guardar el mesh principal
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (!child.userData.materialCloned) {
          // Convertir a MeshPhysicalMaterial para tener sheen (efecto tela/microfibra).
          // Si ya es physical lo clonamos; si es standard copiamos SOLO las props
          // estándar (un .copy() directo sobre physical leería sheenColor/specularColor
          // inexistentes y reventaría con "reading 'x'").
          const base = child.material
          let tela
          if (base.isMeshPhysicalMaterial) {
            tela = base.clone()
          } else {
            tela = new THREE.MeshPhysicalMaterial()
            THREE.MeshStandardMaterial.prototype.copy.call(tela, base)
          }
          // Color sólido y fiel: quitamos las texturas del glb que apagan/reflejan el color
          tela.map = null              // textura base que ensucia/apaga el color elegido
          tela.metalnessMap = null     // causaba el aspecto plateado/satinado
          tela.roughnessMap = null
          tela.metalness = 0
          tela.roughness = 0.8
          tela.envMapIntensity = 0.3
          tela.sheen = 0.35            // sutil; con sheen alto los oscuros se ven grises
          tela.sheenRoughness = 0.8
          tela.sheenColor = new THREE.Color(0xffffff)
          child.material = tela
          child.userData.materialCloned = true
          setMeshTarget(child)
        }
        child.material.color = new THREE.Color(color)
        child.material.needsUpdate = true
      }
    })
  }, [color, scene])

  // Coloca el decal a partir de un hit del raycaster (compartido por clic y zonas)
  const colocarDesdeHit = (hit) => {
    const position = hit.point.clone()

    const normal = hit.face.normal.clone()
    normal.transformDirection(meshTarget.matrixWorld)

    const orientation = new THREE.Euler()
    const lookAt = new THREE.Vector3().copy(position).add(normal)
    const m = new THREE.Matrix4().lookAt(position, lookAt, new THREE.Vector3(0, 1, 0))
    orientation.setFromRotationMatrix(m)
    orientation.z += rotacionLogo

    setDecalData({ position, orientation, rotacionAplicada: rotacionLogo })
    if (onClickModelo) onClickModelo()
  }

  // Click handler para poner el decal
  const onClickEscena = () => {
    if (!colocable || !logoImg || !meshTarget) return
    const hits = raycaster.intersectObject(meshTarget, true)
    if (hits.length === 0) return
    colocarDesdeHit(hits[0])
  }

  // Colocación automática en zonas predefinidas (aproximada por bounding box)
  useEffect(() => {
    if (!zonaSolicitada || !logoImg || !meshTarget) return

    const box = new THREE.Box3().setFromObject(meshTarget)
    const size = new THREE.Vector3(); box.getSize(size)
    const center = new THREE.Vector3(); box.getCenter(center)
    const yZona = center.y + size.y * (zonaSolicitada.yFactor ?? 0)
    const lejos = Math.max(size.x, size.y, size.z) * 2

    let origin, dir
    if (zonaSolicitada.from === "front") {
      origin = new THREE.Vector3(center.x, yZona, box.max.z + lejos); dir = new THREE.Vector3(0, 0, -1)
    } else if (zonaSolicitada.from === "back") {
      origin = new THREE.Vector3(center.x, yZona, box.min.z - lejos); dir = new THREE.Vector3(0, 0, 1)
    } else if (zonaSolicitada.from === "right") {
      origin = new THREE.Vector3(box.max.x + lejos, yZona, center.z); dir = new THREE.Vector3(-1, 0, 0)
    } else if (zonaSolicitada.from === "left") {
      origin = new THREE.Vector3(box.min.x - lejos, yZona, center.z); dir = new THREE.Vector3(1, 0, 0)
    }

    if (origin) {
      const rc = new THREE.Raycaster(origin, dir.normalize())
      const hits = rc.intersectObject(meshTarget, true)
      if (hits.length > 0) colocarDesdeHit(hits[0])
    }
    if (onZonaColocada) onZonaColocada()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zonaSolicitada])

  // Actualizar rotación sin reclickear
  useEffect(() => {
    if (!decalData) return
    const baseRotation = decalData.orientation.clone()
    baseRotation.z = baseRotation.z - (decalData.rotacionAplicada || 0) + rotacionLogo
    setDecalData({
      ...decalData,
      orientation: baseRotation,
      rotacionAplicada: rotacionLogo,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotacionLogo])

  // El ancho del decal respeta la proporción de la imagen (evita que el texto/logo
  // ancho se aplaste). tamanoLogo controla la ALTURA; el ancho = altura * aspecto.
  const sizeVector = useMemo(() => {
    const w = logoImg?.width || logoImg?.naturalWidth || 1
    const h = logoImg?.height || logoImg?.naturalHeight || 1
    const aspecto = w / h
    // profundidad moderada: suficiente para envolver la curva, sin atravesar a la espalda
    return new THREE.Vector3(tamanoLogo * aspecto, tamanoLogo, tamanoLogo)
  }, [tamanoLogo, logoImg])

  return (
    <group onClick={onClickEscena}>
      <primitive object={scene} />
      {decalData && meshTarget && logoImg && (
        <LogoDecal
          targetMesh={meshTarget}
          position={decalData.position}
          orientation={decalData.orientation}
          size={sizeVector}
          logoImg={logoImg}
        />
      )}
    </group>
  )
}

function generarTextoImagen(texto, color = "#ffffff") {
  const fontSize = 220
  const padding = 40
  const m = document.createElement("canvas").getContext("2d")
  m.font = `bold ${fontSize}px Arial, sans-serif`
  const w = Math.ceil(m.measureText(texto).width) + padding * 2
  const h = fontSize + padding * 2

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  ctx.font = `bold ${fontSize}px Arial, sans-serif`
  ctx.fillStyle = color
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"
  ctx.fillText(texto, w / 2, h / 2)

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.src = canvas.toDataURL("image/png")
  })
}

function imgToDataURL(img) {
  const c = document.createElement("canvas")
  c.width = img.naturalWidth || img.width
  c.height = img.naturalHeight || img.height
  c.getContext("2d").drawImage(img, 0, 0)
  return c.toDataURL("image/png")
}

function cargarImagen(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export default function Visor3D({ modelUrl, coloresVariantes = [], tipo3d = "torso", nombreProducto = "prenda" }) {
  const zonas = ZONAS_POR_TIPO[tipo3d] || ZONAS_POR_TIPO.torso
  const esIrregular = TIPOS_IRREGULARES.has(tipo3d)
  const colorInicial = coloresVariantes.length > 0
    ? COLORES_HEX[coloresVariantes[0]] || "#FFFFFF"
    : "#FFFFFF"

  const [color, setColor] = useState(colorInicial)
  const [logoImg, setLogoImg] = useState(null)
  const [logoOriginal, setLogoOriginal] = useState(null)
  const [nombreArchivo, setNombreArchivo] = useState("")
  const [tamanoLogo, setTamanoLogo] = useState(0.15)
  const [rotacionLogo, setRotacionLogo] = useState(0)
  const [modoColocar, setModoColocar] = useState(false)
  const [texto, setTexto] = useState("")
  const [colorTexto, setColorTexto] = useState("#ffffff")
  const [zona, setZona] = useState(null)
  const [mockupImg, setMockupImg] = useState(null)
  const [generandoMockup, setGenerandoMockup] = useState(false)
  const [mockupError, setMockupError] = useState(null)
  const glRef = useRef(null)

  const generarMockup = async () => {
    const gl = glRef.current
    if (!gl) return
    setGenerandoMockup(true)
    setMockupError(null)
    setMockupImg(null)
    try {
      const imagen = gl.domElement.toDataURL("image/png")
      const body = { imagen, nombreProducto, tipo3d }
      // En productos irregulares el logo no está en el render → se manda aparte
      // para que la IA lo integre sobre la superficie.
      if (esIrregular && logoImg) body.logo = imgToDataURL(logoImg)
      const res = await fetch("/api/mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.ok) setMockupImg(data.imagen)
      else setMockupError(data.mensaje || "No se pudo generar el mockup")
    } catch {
      setMockupError("Error de conexión con el servidor")
    } finally {
      setGenerandoMockup(false)
    }
  }

  const aplicarTexto = async () => {
    if (!texto.trim()) return
    const img = await generarTextoImagen(texto, colorTexto)
    setLogoOriginal(img)
    setLogoImg(img)
    setNombreArchivo(`Texto: ${texto}`)
    setModoColocar(true)
  }

  const descargarDiseno = () => {
    const gl = glRef.current
    if (!gl) return
    const link = document.createElement("a")
    link.download = "mi-diseno.png"
    link.href = gl.domElement.toDataURL("image/png")
    link.click()
  }

  const onCambiarLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imgOriginal = await cargarImagen(file)
      setLogoOriginal(imgOriginal)

      // Aplicar chroma key automáticamente
      const imgSinFondo = await aplicarChromaKey(imgOriginal)
      setLogoImg(imgSinFondo)

      setNombreArchivo(file.name)
      setModoColocar(true)
    } catch (err) {
      console.error(err)
      alert("No se pudo cargar la imagen")
    }
  }

  const quitarLogo = () => {
    setLogoImg(null)
    setLogoOriginal(null)
    setNombreArchivo("")
    setModoColocar(false)
    setRotacionLogo(0)
    setTamanoLogo(0.15)
  }

  const restaurarOriginal = () => {
    if (logoOriginal) setLogoImg(logoOriginal)
  }

  if (!modelUrl) {
    return (
      <div className="w-full h-[500px] bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Este producto no tiene visor 3D disponible</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas */}
      <div className="relative w-full h-[500px] bg-gray-50 rounded-lg overflow-hidden">
        <Canvas
          camera={{ position: [0, 0, 3], fov: 45 }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
          onCreated={({ gl }) => (glRef.current = gl)}
          style={{ cursor: modoColocar && logoImg ? "crosshair" : "grab" }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.0} />
          <directionalLight position={[-5, 3, -5]} intensity={0.4} />

          <Suspense fallback={null}>
            <Center>
              <Escena
                url={modelUrl}
                color={color}
                logoImg={logoImg}
                tamanoLogo={tamanoLogo}
                rotacionLogo={rotacionLogo}
                onClickModelo={() => setModoColocar(false)}
                zonaSolicitada={zona}
                onZonaColocada={() => setZona(null)}
                colocable={!esIrregular}
              />
            </Center>
            <Environment preset="studio" />
          </Suspense>

          <OrbitControls enablePan={false} minDistance={1.5} maxDistance={5} />
        </Canvas>

        {/* Banner indicando modo colocar */}
        {modoColocar && logoImg && !esIrregular && (
          <div className="absolute top-3 left-3 right-3 bg-primary text-white text-xs px-4 py-2 rounded-lg text-center font-medium">
            Haz clic sobre la prenda donde quieras colocar el logo
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex flex-col gap-4">

        {/* === Subir logo === */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Tu logo
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="px-4 py-2 bg-primary text-white text-xs uppercase tracking-wider rounded-lg cursor-pointer hover:bg-dorado transition-colors">
              {logoImg ? "Cambiar logo" : "Subir logo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onCambiarLogo}
                className="hidden"
              />
            </label>
            {logoImg && (
              <>
                {!esIrregular && (
                  <button
                    onClick={() => setModoColocar(true)}
                    className="px-4 py-2 border border-primary text-primary text-xs uppercase tracking-wider rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    Mover logo
                  </button>
                )}
                <span className="text-xs text-gris truncate max-w-[150px]">
                  {nombreArchivo}
                </span>
              </>
            )}
          </div>

          {/* Aviso para productos irregulares */}
          {esIrregular && (
            <p className="text-xs text-gris/70 mt-1 bg-dorado/10 border border-dorado/30 rounded-lg px-3 py-2">
              ✨ Este producto tiene forma irregular. Sube tu logo o escribe un texto y dale a
              <strong> “Ver mockup realista (IA)” </strong> — la IA lo ubicará de forma realista sobre el producto.
            </p>
          )}

          {/* Nota informativa cuando no hay logo */}
          {!logoImg && (
            <p className="text-xs text-gris/70 mt-1">
              Recomendado: PNG con fondo transparente. Si tu logo tiene fondo blanco, lo quitamos automáticamente.{" "}
              <a
                href="https://www.remove.bg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Quitar fondo de mi logo →
              </a>
            </p>
          )}

          {logoImg && !esIrregular && (
            <>
              {/* Slider de tamaño */}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-gris min-w-[60px]">Tamaño:</span>
                <input
                  type="range"
                  min="0.05"
                  max="0.4"
                  step="0.01"
                  value={tamanoLogo}
                  onChange={(e) => setTamanoLogo(Number(e.target.value))}
                  className="flex-1 max-w-[200px]"
                />
                <span className="text-xs text-gris">{Math.round(tamanoLogo * 100)}%</span>
              </div>

              {/* Slider de rotación */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gris min-w-[60px]">Rotación:</span>
                <input
                  type="range"
                  min={-Math.PI}
                  max={Math.PI}
                  step="0.05"
                  value={rotacionLogo}
                  onChange={(e) => setRotacionLogo(Number(e.target.value))}
                  className="flex-1 max-w-[200px]"
                />
                <span className="text-xs text-gris">
                  {Math.round((rotacionLogo * 180) / Math.PI)}°
                </span>
              </div>

              {/* Zonas rápidas (según el tipo de producto, colocación automática) */}
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className="text-xs text-gris min-w-[60px]">Colocar en:</span>
                {zonas.map((z) => (
                  <button
                    key={z.id}
                    onClick={() => setZona(z)}
                    className="px-3 py-1 border border-primary text-primary text-xs rounded-full hover:bg-primary hover:text-white transition-colors"
                  >
                    {z.label}
                  </button>
                ))}
              </div>

            </>
          )}

          {/* Acciones sobre el logo (siempre que haya logo) */}
          {logoImg && (
            <div className="flex flex-wrap items-center gap-4 mt-1">
              {logoOriginal && (
                <button
                  onClick={restaurarOriginal}
                  className="text-xs text-gris hover:text-primary hover:underline"
                >
                  Restaurar original
                </button>
              )}

              <button
                onClick={quitarLogo}
                className="text-xs text-red-600 hover:underline"
              >
                Quitar logo
              </button>
            </div>
          )}
        </div>

        {/* === Texto personalizado === */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Texto personalizado
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Nombre, número..."
              className="px-3 py-2 border border-gris/30 rounded-lg text-sm flex-1 min-w-[140px] max-w-[220px]"
            />
            <input
              type="color"
              value={colorTexto}
              onChange={(e) => setColorTexto(e.target.value)}
              className="w-9 h-9 rounded cursor-pointer border border-gris/30"
              title="Color del texto"
            />
            <button
              onClick={aplicarTexto}
              className="px-4 py-2 bg-primary text-white text-xs uppercase tracking-wider rounded-lg hover:bg-dorado transition-colors"
            >
              Aplicar texto
            </button>
          </div>
          <p className="text-xs text-gris/70">
            {esIrregular
              ? "El texto se integrará en el mockup con IA. Reemplaza el logo actual."
              : "Se coloca sobre la prenda igual que un logo (clic para ubicarlo). Reemplaza el logo actual."}
          </p>
        </div>

        {/* === Colores de variantes === */}
        {coloresVariantes.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Color del producto
            </span>
            <div className="flex flex-wrap gap-3">
              {coloresVariantes.map((nombre) => {
                const hex = COLORES_HEX[nombre] || "#cccccc"
                const isSelected = color === hex
                return (
                  <button
                    key={nombre}
                    onClick={() => setColor(hex)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-gris/20 hover:border-gris/40"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-gris/30"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-xs font-medium text-primary">{nombre}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* === Colores rápidos + picker === */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gris">
            {coloresVariantes.length > 0 ? "¿Quieres probar otro color?" : "Color personalizado"}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {COLORES_RAPIDOS.map((hex) => (
              <button
                key={hex}
                onClick={() => setColor(hex)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  color === hex ? "border-primary scale-110" : "border-gris/30 hover:scale-105"
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
            <label className="w-10 h-10 rounded-full border-2 border-gris/30 cursor-pointer relative overflow-hidden hover:scale-105 transition-transform">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-full h-full bg-gradient-to-br from-red-400 via-yellow-300 to-blue-400" />
            </label>
            <span className="text-xs text-gris ml-1">o escoge cualquier color</span>
          </div>
        </div>

        {/* === Acciones finales === */}
        <div className="flex flex-wrap gap-3 mt-2">
          <button
            onClick={descargarDiseno}
            className="px-6 py-3 bg-dorado text-white text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-primary transition-colors"
          >
            Descargar mi diseño (PNG)
          </button>
          <button
            onClick={generarMockup}
            disabled={generandoMockup}
            className="px-6 py-3 bg-primary text-white text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-dorado transition-colors disabled:opacity-60"
          >
            {generandoMockup ? "Generando mockup…" : "Ver mockup realista (IA) ✨"}
          </button>
        </div>

        {/* === Resultado del mockup IA === */}
        {(generandoMockup || mockupImg || mockupError) && (
          <div className="mt-2 flex flex-col gap-2">
            {generandoMockup && (
              <p className="text-xs text-gris">Generando tu mockup realista con IA, esto toma unos segundos…</p>
            )}
            {mockupError && (
              <p className="text-xs text-red-600">⚠ {mockupError}</p>
            )}
            {mockupImg && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mockupImg} alt="Mockup realista" className="w-full max-w-md rounded-lg border border-gris/20" />
                <a
                  href={mockupImg}
                  download="mockup-realista.png"
                  className="text-xs text-primary hover:underline w-fit"
                >
                  Descargar mockup →
                </a>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}