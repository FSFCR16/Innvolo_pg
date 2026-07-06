# -*- coding: utf-8 -*-
"""
FASE 0b (paso 1) — Prepara las imagenes: recorta las 2 dobles y renombra cada
una por slug de producto para SEO. Deja todo en _staged/.
"""
import os, sys, json, unicodedata, re
sys.stdout.reconfigure(encoding="utf-8")
from PIL import Image

IMG_DIR = r"C:\Users\Netapplicatiosn\Downloads\INNVOLO\IMAGENES CATALOGO"
OUT = os.path.join(IMG_DIR, "_staged")
os.makedirs(OUT, exist_ok=True)

# #  -> (nombre_producto, token_img, crop)  crop in {None,'L','R'}
PLAN = {
    1: ("Camisa Corporativa", "090026", None),
    2: ("Camiseta Corporativa", "195649", None),
    3: ("Polo Corporativo", "194441", None),
    4: ("Gorra Malla", "231938", None),
    5: ("Gorra Dril", "232344", None),
    6: ("Chaleco Acolchado", "200231", None),
    7: ("Chaqueta Acolchada", "200530", None),
    8: ("Chaqueta Rompevientos", "201645", None),
    9: ("Chaqueta Jean", "184438", None),
    10: ("Chaqueta Cuero", "184400", None),
    11: ("Hoodie Sudadera con Capota", "200012", None),
    12: ("Saco Cuello Redondo", "200854", None),
    13: ("Uniforme Chef", "202245", None),
    14: ("Uniforme de Servicio", "202631", None),
    15: ("Delantal Medico Scrub", "230521", None),
    16: ("Cofia", "233533", None),
    17: ("Bata Institucional", "040904", None),
    18: ("Overol Industrial", "041723", None),
    19: ("Vaso Termico Botilito", "235549", "R"),   # termo negro (derecha)
    20: ("Botella Metalica", "235549", "L"),        # botella plateada (izquierda)
    21: ("Vaso de Vidrio", "235937", "L"),          # vaso pinta (izquierda)
    22: ("Pocillo Mug Ceramica", "235937", "R"),    # mug (derecha)
    23: ("Esfero Metalico", "235216", None),
    24: ("Llavero Personalizado", "003711", None),
    25: ("Bandera Publicitaria", "190802", None),
    26: ("Bolsa en Cambre", "190747", None),
    27: ("Tote Bag", "003729", None),
    28: ("Mochila", "002523", None),
    29: ("Maletin Deportivo Viaje", "002911", None),
    30: ("Chaqueta Prom", "182349", None),
    31: ("Hoodie Prom", "053510", None),
    32: ("Panoleta para Mascota", "011315", None),
    33: ("Juguete para Mascota", "010724", None),
    34: ("Termo de Agua para Mascota", "005602", None),
    35: ("Portacomidas para Mascota", "005833", None),
    36: ("Kit Accesorios Mascota", "011155", None),
}


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s


def resolver():
    idx = {}
    for f in os.listdir(IMG_DIR):
        if f.lower().endswith(".png") and "_" in f:
            idx[f.split("_")[2]] = os.path.join(IMG_DIR, f)
    return idx


def main():
    idx = resolver()
    manifest = {}
    for n, (nombre, token, crop) in PLAN.items():
        src = idx[token]
        im = Image.open(src).convert("RGB")
        W, H = im.size
        if crop == "L":
            im = im.crop((0, 0, int(W * 0.54), H))
        elif crop == "R":
            im = im.crop((int(W * 0.46), 0, W, H))
        out = os.path.join(OUT, f"{n:02d}-{slugify(nombre)}.png")
        im.save(out, "PNG")
        manifest[str(n)] = {"nombre": nombre, "file": out, "alt": nombre, "crop": crop}
        print(f"  {n:>2} {nombre:<30} crop={crop or '-'}  -> {os.path.basename(out)}")
    with open(os.path.join(os.path.dirname(__file__), "woo_fase0b_manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"\n  {len(manifest)} imagenes en {OUT}")


if __name__ == "__main__":
    main()
