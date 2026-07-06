# -*- coding: utf-8 -*-
"""
Pobla model_3d_url en los 28 productos confirmados.
- Copia cada .glb de INNVOLO/3D a public/modelos (nombre sin espacios).
- Escribe model_3d_url = http://localhost:3000/modelos/<archivo>.glb
- SOLO escribe si el campo esta vacio (salta Polo y cualquiera ya poblado).
- Guarda backup antes de escribir.
"""
import os, json, shutil, sys
from dotenv import load_dotenv
import requests
from requests.auth import HTTPBasicAuth
import urllib3

sys.stdout.reconfigure(encoding="utf-8")
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
load_dotenv()

BASE = os.getenv("WC_BASE_URL") + "/wp-json/wc/v3"
AUTH = HTTPBasicAuth(os.getenv("WC_KEY"), os.getenv("WC_SECRET"))

SRC_DIR = r"C:\Users\Netapplicatiosn\Downloads\INNVOLO\3D"
DST_DIR = r"C:\Users\Netapplicatiosn\Desktop\Proyecto_Nicolas\FrontEnd\my-app\public\modelos"
URL_BASE = "http://localhost:3000/modelos/"
ACF_FIELD_KEY = "field_6a13719b38132"

# (product_id, archivo_fuente, archivo_destino)
MAPEO = [
    (30,  "GORRA DE DRILL.glb",          "GORRA-DE-DRILL.glb"),
    (35,  "GORRA DE MALLA.glb",          "GORRA-DE-MALLA.glb"),
    (40,  "CHAQUETA ACOLCHADA.glb",      "CHAQUETA-ACOLCHADA.glb"),
    (57,  "CHALECO.glb",                 "CHALECO.glb"),
    (74,  "ROMPEVIENTOS.glb",            "ROMPEVIENTOS.glb"),
    (91,  "CHAQUETA DE JEAN.glb",        "CHAQUETA-DE-JEAN.glb"),
    (108, "CHAQUETA DE CUERO.glb",       "CHAQUETA-DE-CUERO.glb"),
    (125, "HOODIE.glb",                  "HOODIE.glb"),
    (142, "SACO CUELLO REDONDO.glb",     "SACO-CUELLO-REDONDO.glb"),
    (159, "CHEF.glb",                    "CHEF.glb"),
    (176, "UNIFORME DE SERVICIO.glb",    "UNIFORME-DE-SERVICIO.glb"),
    (210, "COFLA GORRO.glb",             "COFLA-GORRO.glb"),
    (215, "BATA.glb",                    "BATA.glb"),
    (232, "TERMO.glb",                   "TERMO.glb"),
    (250, "POCILLO.glb",                 "POCILLO.glb"),
    (255, "ESFERO.glb",                  "ESFERO.glb"),
    (260, "LLAVERO.glb",                 "LLAVERO.glb"),
    (265, "BANDERA.glb",                 "BANDERA.glb"),
    (270, "BOLSA DE CAMBRE.glb",         "BOLSA-DE-CAMBRE.glb"),
    (275, "TOTE BAG.glb",                "TOTE-BAG.glb"),
    (285, "MALETA.glb",                  "MALETA.glb"),
    (290, "CHAQUETA PROM.glb",           "CHAQUETA-PROM.glb"),
    (307, "HOODIE PROM.glb",             "HOODIE-PROM.glb"),
    (324, "PAÑOLETA.glb",                "PANOLETA.glb"),
    (329, "JUGUETES.glb",                "JUGUETES.glb"),
    (334, "PORTACOMIDAS MASCOTAS.glb",   "PORTACOMIDAS-MASCOTAS.glb"),
    (339, "TERMO PARA MASCOTA.glb",      "TERMO-PARA-MASCOTA.glb"),
    (344, "ACCESORIOS PARA MASCOTA.glb", "ACCESORIOS-PARA-MASCOTA.glb"),
]


def get_meta(p, key):
    return next((m["value"] for m in p.get("meta_data", []) if m["key"] == key), None)


def main():
    os.makedirs(DST_DIR, exist_ok=True)

    # 1) Validar que existan todos los archivos fuente ANTES de tocar nada
    faltan = [src for _, src, _ in MAPEO if not os.path.isfile(os.path.join(SRC_DIR, src))]
    if faltan:
        print("✗ No encuentro estos .glb fuente, abortando sin cambios:")
        for f in faltan:
            print("   -", f)
        sys.exit(1)

    # 2) Backup del estado actual de los 28
    backup = {}
    for pid, _, _ in MAPEO:
        r = requests.get(f"{BASE}/products/{pid}", auth=AUTH, verify=False, timeout=30)
        backup[pid] = get_meta(r.json(), "model_3d_url")
    with open("woo_3d_backup.json", "w", encoding="utf-8") as f:
        json.dump(backup, f, indent=2, ensure_ascii=False)
    print(f"💾 Backup guardado en woo_3d_backup.json ({len(backup)} productos)\n")

    copiados = escritos = saltados = 0

    for pid, src, dst in MAPEO:
        actual = backup.get(pid)
        if actual:  # ya tiene valor -> no tocar
            print(f"  ↻ id {pid}: ya tiene model_3d_url, SALTADO ({actual})")
            saltados += 1
            continue

        # Copiar archivo (idempotente)
        dst_path = os.path.join(DST_DIR, dst)
        if not os.path.isfile(dst_path):
            shutil.copy2(os.path.join(SRC_DIR, src), dst_path)
            copiados += 1
        url = URL_BASE + dst

        # Escribir meta (model_3d_url + clave ACF para que wp-admin lo reconozca)
        payload = {"meta_data": [
            {"key": "model_3d_url", "value": url},
            {"key": "_model_3d_url", "value": ACF_FIELD_KEY},
        ]}
        r = requests.put(f"{BASE}/products/{pid}", auth=AUTH, verify=False,
                         json=payload, timeout=60)
        if r.status_code < 400:
            print(f"  ✓ id {pid}: {dst}  →  {url}")
            escritos += 1
        else:
            print(f"  ✗ id {pid}: HTTP {r.status_code} — {r.text[:160]}")

    print(f"\n🎉 Hecho. Copiados: {copiados} | Escritos en Woo: {escritos} | Saltados: {saltados}")


if __name__ == "__main__":
    main()
