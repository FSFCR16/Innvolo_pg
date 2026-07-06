"use client"

import { useMemo } from "react"
import * as THREE from "three"
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry"

/**
 * Aplica un logo como decal sobre la superficie del modelo.
 *
 * @param {THREE.Mesh} targetMesh - El mesh sobre el que se proyecta
 * @param {THREE.Vector3} position - Punto 3D donde se proyecta el decal
 * @param {THREE.Euler} orientation - Orientación del decal
 * @param {THREE.Vector3} size - Tamaño del decal (x, y, z=profundidad de proyección)
 * @param {HTMLImageElement} logoImg - Imagen del logo
 */
export default function LogoDecal({ targetMesh, position, orientation, size, logoImg }) {

  // Crear la textura desde la imagen
    const texturaLogo = useMemo(() => {
    if (!logoImg) return null
    const tex = new THREE.CanvasTexture(logoImg)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = THREE.RepeatWrapping        // ← agregar
    tex.repeat.x = -1                        // ← agregar (flip horizontal)
    tex.offset.x = 1                         // ← agregar (compensa el flip)
    tex.needsUpdate = true
    return tex
    }, [logoImg])

  // Material del decal (transparente, encima del mesh base)
  const material = useMemo(() => {
    if (!texturaLogo) return null
    return new THREE.MeshStandardMaterial({
      map: texturaLogo,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,  // evita z-fighting con el mesh base
      roughness: 0.85,
      metalness: 0,
    })
  }, [texturaLogo])

  // Geometría del decal (recalcula cuando cambia posición/tamaño/orientación)
  const decalGeometry = useMemo(() => {
    if (!targetMesh || !position) return null
    try {
      return new DecalGeometry(targetMesh, position, orientation, size)
    } catch (err) {
      console.error("Error creando decal:", err)
      return null
    }
  }, [targetMesh, position, orientation, size])

  if (!decalGeometry || !material) return null

  return <mesh geometry={decalGeometry} material={material} />
}