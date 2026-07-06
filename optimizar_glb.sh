#!/usr/bin/env bash
# Optimiza los 28 .glb mapeados en public/modelos (simplify + webp).
# Sobrescribe en sitio (mismo nombre -> las URLs en Woo siguen validas).
# Los originales en Downloads\INNVOLO\3D NO se tocan.
set -e
cd "C:/Users/Netapplicatiosn/Desktop/Proyecto_Nicolas/FrontEnd/my-app/public/modelos"

RATIO=0.06
ERROR=0.01
GT="npx -y @gltf-transform/cli@4.3.0"

FILES=(
  GORRA-DE-DRILL.glb GORRA-DE-MALLA.glb CHAQUETA-ACOLCHADA.glb CHALECO.glb
  ROMPEVIENTOS.glb CHAQUETA-DE-JEAN.glb CHAQUETA-DE-CUERO.glb HOODIE.glb
  SACO-CUELLO-REDONDO.glb CHEF.glb UNIFORME-DE-SERVICIO.glb COFLA-GORRO.glb
  BATA.glb TERMO.glb POCILLO.glb ESFERO.glb LLAVERO.glb BANDERA.glb
  BOLSA-DE-CAMBRE.glb TOTE-BAG.glb MALETA.glb CHAQUETA-PROM.glb HOODIE-PROM.glb
  PANOLETA.glb JUGUETES.glb PORTACOMIDAS-MASCOTAS.glb TERMO-PARA-MASCOTA.glb
  ACCESORIOS-PARA-MASCOTA.glb
)

for f in "${FILES[@]}"; do
  before=$(du -m "$f" | cut -f1)
  $GT simplify "$f" _tmp_s.glb --ratio $RATIO --error $ERROR >/dev/null 2>&1
  $GT webp _tmp_s.glb _tmp_w.glb --quality 85 >/dev/null 2>&1
  mv -f _tmp_w.glb "$f"
  rm -f _tmp_s.glb
  after=$(du -m "$f" | cut -f1)
  echo "  OK $f : ${before}MB -> ${after}MB"
done

# limpiar archivos de prueba
rm -f HOODIE.r0.12.glb HOODIE.r0.06.glb HOODIE.test.glb _t1.glb _t2.glb _s.glb
echo "LISTO"
