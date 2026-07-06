# -*- coding: utf-8 -*-
"""
Clasifica los productos de WooCommerce en un TIPO 3D usando OpenAI,
para mostrar las zonas de personalización correctas por forma.

USO:
    python clasificar_productos.py            # DRY-RUN: solo muestra la tabla propuesta
    python clasificar_productos.py --write     # escribe meta `tipo_3d` en Woo (con backup)
"""
import os, sys, json
from dotenv import load_dotenv
import requests
from requests.auth import HTTPBasicAuth
import urllib3
from openai import OpenAI

sys.stdout.reconfigure(encoding="utf-8")
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
load_dotenv()

BASE = os.getenv("WC_BASE_URL") + "/wp-json/wc/v3"
AUTH = HTTPBasicAuth(os.getenv("WC_KEY"), os.getenv("WC_SECRET"))
client = OpenAI()

TIPOS = {
    "torso": "Prendas que se usan en el torso: camisa, polo, camiseta, hoodie, sudadera, chaleco, chaqueta, saco, bata, overol, uniforme, delantal, chef.",
    "gorra": "Gorras y sombreros.",
    "recipiente": "Recipientes cilíndricos para bebida: vaso, botilito, termo, pocillo.",
    "bolso": "Bolsos planos: bolsa, tote bag, mochila, maletín.",
    "accesorio": "Objetos pequeños: esfero, llavero.",
    "mascota": "Productos para mascotas: pañoleta, juguete, portacomidas, termo de mascota, accesorios de mascota.",
}


def fetch_products():
    prods, page = [], 1
    while True:
        r = requests.get(f"{BASE}/products", auth=AUTH, verify=False, timeout=30,
                         params={"per_page": 100, "page": page, "status": "any"})
        d = r.json()
        if not d:
            break
        prods += d
        page += 1
        if len(d) < 100:
            break
    return [{"id": p["id"], "name": p["name"], "sku": p.get("sku", "")} for p in sorted(prods, key=lambda x: x["id"])]


def clasificar(prods):
    lista = "\n".join(f'{p["id"]}: {p["name"]}' for p in prods)
    tipos_desc = "\n".join(f"- {k}: {v}" for k, v in TIPOS.items())
    prompt = (
        "Clasifica cada producto en UNO de estos tipos (usa el nombre; ojo: 'Termo agua para mascotas' es mascota, no recipiente):\n"
        f"{tipos_desc}\n\n"
        f"Productos (id: nombre):\n{lista}\n\n"
        'Responde SOLO un JSON: {"NN": "tipo", ...} con el id como clave y el tipo como valor.'
    )
    r = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0,
    )
    return json.loads(r.choices[0].message.content)


def main():
    write = "--write" in sys.argv
    prods = fetch_products()
    print(f"Productos: {len(prods)} — clasificando con OpenAI...\n")
    mapa = clasificar(prods)

    # Overrides manuales (criterio: la zona resultante encaja mejor)
    OVERRIDES = {"210": "gorra"}  # Cofia: es para la cabeza, no torso
    mapa.update(OVERRIDES)

    print(f"{'id':>4} | {'tipo':<11} | producto")
    print("-" * 60)
    invalidos = []
    for p in prods:
        tipo = mapa.get(str(p["id"]), "?")
        marca = "" if tipo in TIPOS else "  <-- TIPO INVALIDO"
        if tipo not in TIPOS:
            invalidos.append(p["id"])
        print(f'{p["id"]:>4} | {tipo:<11} | {p["name"][:40]}{marca}')

    if invalidos:
        print(f"\n⚠ Hay tipos inválidos en {invalidos}. Revisa antes de escribir.")
        return

    if not write:
        print("\n(DRY-RUN) No se escribió nada. Si la tabla está bien, corre:")
        print("    python clasificar_productos.py --write")
        return

    # Backup + escritura
    backup = {}
    for p in prods:
        r = requests.get(f'{BASE}/products/{p["id"]}', auth=AUTH, verify=False, timeout=30)
        backup[p["id"]] = next((m["value"] for m in r.json().get("meta_data", []) if m["key"] == "tipo_3d"), None)
    with open("tipo_3d_backup.json", "w", encoding="utf-8") as f:
        json.dump(backup, f, indent=2, ensure_ascii=False)
    print("\n💾 Backup en tipo_3d_backup.json\n")

    for p in prods:
        tipo = mapa[str(p["id"])]
        r = requests.put(f'{BASE}/products/{p["id"]}', auth=AUTH, verify=False, timeout=60,
                         json={"meta_data": [{"key": "tipo_3d", "value": tipo}]})
        ok = "OK" if r.status_code < 400 else f"ERR {r.status_code}"
        print(f'  {ok} id {p["id"]}: {tipo}')
    print("\n🎉 tipo_3d escrito en todos los productos.")


if __name__ == "__main__":
    main()
