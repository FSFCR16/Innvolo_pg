#!/usr/bin/env bash
# Re-optimiza TODOS los .glb de public/modelos desde los originales a ratio 0.15
# (antes 0.06 => se veian low-poly). Sobrescribe con el MISMO nombre => model_3d_url
# en Woo sigue valido. Originales en Downloads\INNVOLO\3D NO se tocan.
set -e
PUB="C:/Users/Netapplicatiosn/Desktop/Proyecto_Nicolas/FrontEnd/my-app/public/modelos"
SRC="C:/Users/Netapplicatiosn/Downloads/INNVOLO/3D"
TMP="C:/Users/NETAPP~1/AppData/Local/Temp/claude/C--Users-Netapplicatiosn-Desktop-Proyecto-Nicolas/5dba4bb0-a260-434b-82d1-596be1a10b0b/scratchpad/reopt"
GT="npx -y @gltf-transform/cli@4.3.0"
RATIO=0.15
ERROR=0.005
mkdir -p "$TMP"

# mapeo public -> original (via python: normaliza nombres; CAMISA-v1 -> POLO)
python - "$PUB" "$SRC" <<'PY' > "$TMP/map.txt"
import os,sys,glob,unicodedata
PUB,SRC=sys.argv[1],sys.argv[2]
def norm(s):
    s=os.path.splitext(os.path.basename(s))[0]
    s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode()
    return s.upper().replace(' ','').replace('-','').replace('_','')
orig={norm(f):f for f in glob.glob(SRC+"/*.glb")}
for p in sorted(glob.glob(PUB+"/*.glb")):
    n=norm(p)
    src=orig.get(n)
    if p.upper().endswith("CAMISA-V1.GLB"): src=os.path.join(SRC,"POLO.glb")
    if src: print(os.path.basename(p)+"\t"+src)
PY

total=$(wc -l < "$TMP/map.txt"); i=0
while IFS=$'\t' read -r name src; do
  i=$((i+1))
  before=$(du -k "$PUB/$name" | cut -f1)
  $GT simplify "$src" "$TMP/_s.glb" --ratio $RATIO --error $ERROR >/dev/null 2>&1
  $GT webp "$TMP/_s.glb" "$TMP/_w.glb" --quality 85 >/dev/null 2>&1
  mv -f "$TMP/_w.glb" "$PUB/$name"
  rm -f "$TMP/_s.glb"
  after=$(du -k "$PUB/$name" | cut -f1)
  echo "[$i/$total] $name : ${before}KB -> ${after}KB"
done < "$TMP/map.txt"
echo "TOTAL public/modelos: $(du -sm "$PUB" | cut -f1) MB"
echo "LISTO"
