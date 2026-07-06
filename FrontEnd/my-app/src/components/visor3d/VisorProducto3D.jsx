"use client"

// ============================================================
//  VisorProducto3D — visor 3D SOLO de exhibición.
//  El modelo gira (autoRotate + arrastre) y se puede tintar con
//  el color seleccionado. NO personaliza: sin logo, texto, decals,
//  mockup IA ni descarga. La personalización vive en otro flujo.
//  (El visor completo legado sigue en Visor3D.jsx.)
// ============================================================

import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF, Environment, Bounds, Html } from "@react-three/drei"
import { Suspense, useEffect } from "react"
import * as THREE from "three"

function Modelo({ url, color }) {
  const { scene } = useGLTF(url)

  // Tela mate + color sólido (mismo tratamiento que el visor legado).
  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh || !child.material) return
      if (!child.userData.materialCloned) {
        const base = child.material
        let tela
        if (base.isMeshPhysicalMaterial) {
          tela = base.clone()
        } else {
          tela = new THREE.MeshPhysicalMaterial()
          THREE.MeshStandardMaterial.prototype.copy.call(tela, base)
        }
        // Quitamos texturas que ensucian/apagan el color elegido
        tela.map = null
        tela.metalnessMap = null
        tela.roughnessMap = null
        tela.metalness = 0
        tela.roughness = 0.8
        tela.envMapIntensity = 0.3
        tela.sheen = 0.35
        tela.sheenRoughness = 0.8
        tela.sheenColor = new THREE.Color(0xffffff)
        child.material = tela
        child.userData.materialCloned = true
      }
      if (color) {
        child.material.color = new THREE.Color(color)
        child.material.needsUpdate = true
      }
    })
  }, [color, scene])

  return <primitive object={scene} />
}

export default function VisorProducto3D({ modelUrl, color }) {
  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F4F4F2]">
        <p className="text-gris/60 text-sm">Sin modelo 3D disponible</p>
      </div>
    )
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 45 }}
      gl={{ antialias: true }}
      style={{ cursor: "grab" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} />

      <Suspense fallback={<Html center><span className="text-gris/50 text-xs">Cargando 3D…</span></Html>}>
        {/* Bounds encuadra el modelo lo más grande posible (zoom máx. de inicio),
            adaptándose al tamaño de cada .glb. margin<1 = encuadre apretado. */}
        <Bounds fit clip observe margin={0.85}>
          <Modelo url={modelUrl} color={color} />
        </Bounds>
        <Environment preset="studio" />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.1}
        minDistance={1.2}
        maxDistance={6}
      />
    </Canvas>
  )
}
