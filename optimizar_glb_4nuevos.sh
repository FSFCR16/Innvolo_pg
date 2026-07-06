#!/usr/bin/env bash
# Optimiza 4 .glb nuevos (Camisa/Camiseta/Overol/Bolso) para previsualizar.
# Copia desde Downloads\INNVOLO\3D (originales NO se tocan) a public/modelos.
set -e
SRC="C:/Users/Netapplicatiosn/Downloads/INNVOLO/3D"
DST="C:/Users/Netapplicatiosn/Desktop/Proyecto_Nicolas/FrontEnd/my-app/public/modelos"
RATIO=0.06
ERROR=0.01
GT="npx -y @gltf-transform/cli@4.3.0"

# origen -> destino
declare -A MAP=(
  ["CAMISA.glb"]="CAMISA.glb"
  ["CAMISETA.glb"]="CAMISETA.glb"
  ["OVEROL.glb"]="OVEROL.glb"
  ["BOLSO.glb"]="BOLSO.glb"
)

cd "$DST"
for src in "${!MAP[@]}"; do
  out="${MAP[$src]}"
  cp -f "$SRC/$src" "$DST/$out"
  before=$(du -m "$out" | cut -f1)
  $GT simplify "$out" _tmp_s.glb --ratio $RATIO --error $ERROR >/dev/null 2>&1
  $GT webp _tmp_s.glb _tmp_w.glb --quality 85 >/dev/null 2>&1
  mv -f _tmp_w.glb "$out"
  rm -f _tmp_s.glb
  after=$(du -m "$out" | cut -f1)
  echo "  OK $out : ${before}MB -> ${after}MB"
done
echo "LISTO"
