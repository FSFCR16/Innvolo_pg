#!/usr/bin/env bash
# Escribe model_3d_url en Woo para los 4 productos sin modelo (match por nombre).
# Backup previo -> woo_3d_backup_4nuevos.json. Rollback = volver a "".
set -e
cd "C:/Users/Netapplicatiosn/Desktop/Proyecto_Nicolas/FrontEnd/my-app"
K=$(grep -E "^WC_KEY=" .env.local | cut -d= -f2- | tr -d '\r')
S=$(grep -E "^WC_SECRET=" .env.local | cut -d= -f2- | tr -d '\r')
BASE="https://innvolo.local/wp-json/wc/v3"
BK="C:/Users/Netapplicatiosn/Desktop/Proyecto_Nicolas/woo_3d_backup_4nuevos.json"

# id -> archivo
declare -A MAP=( [354]="CAMISA.glb" [371]="CAMISETA.glb" [388]="OVEROL.glb" [280]="BOLSO.glb" )

echo "{" > "$BK"; first=1
for id in "${!MAP[@]}"; do
  prev=$(curl -sk -u "$K:$S" "$BASE/products/$id" | grep -o '"key":"model_3d_url","value":"[^"]*"' | sed 's/.*value":"//;s/"$//')
  [ $first -eq 0 ] && echo "," >> "$BK"; first=0
  printf '  "%s": "%s"' "$id" "$prev" >> "$BK"
done
echo "" >> "$BK"; echo "}" >> "$BK"
echo "Backup previo guardado en $BK:"; cat "$BK"; echo

for id in "${!MAP[@]}"; do
  url="http://localhost:3000/modelos/${MAP[$id]}"
  body="{\"meta_data\":[{\"key\":\"model_3d_url\",\"value\":\"$url\"}]}"
  res=$(curl -sk -u "$K:$S" -X PUT "$BASE/products/$id" -H "Content-Type: application/json" -d "$body")
  written=$(echo "$res" | grep -o '"key":"model_3d_url","value":"[^"]*"' | sed 's/.*value":"//;s/"$//')
  echo "id $id -> ${MAP[$id]} | escrito: $written"
done
echo "LISTO"
