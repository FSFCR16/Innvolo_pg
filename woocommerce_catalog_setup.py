"""
WooCommerce Catalog Setup Script (sin imágenes)
================================================
Crea atributos globales, categorías, productos variables y variantes.
NO sube imágenes ni modelos 3D — esas se suben manualmente desde wp-admin.

USO:
    pip install requests python-dotenv
    # Crear archivo .env (ver .env.example)
    python woocommerce_catalog_setup.py
"""

import os
import sys
import json
import time

import requests
from requests.auth import HTTPBasicAuth
import urllib3

# Ignorar warnings de SSL autofirmado (solo válido para entorno LOCAL)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


# ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
WC_BASE_URL = os.getenv("WC_BASE_URL", "").rstrip("/")
WC_KEY      = os.getenv("WC_KEY", "")
WC_SECRET   = os.getenv("WC_SECRET", "")

SLEEP = 0.25
# ──────────────────────────────────────────────────────────────────────────────

if not all([WC_BASE_URL, WC_KEY, WC_SECRET]):
    print("✗ Faltan variables. Crea un archivo .env con:")
    print("  WC_BASE_URL, WC_KEY, WC_SECRET")
    sys.exit(1)

WC_API = f"{WC_BASE_URL}/wp-json/wc/v3"
wc_auth = HTTPBasicAuth(WC_KEY, WC_SECRET)

IDS = {
    "attributes":  {},
    "categories":  {},
    "products":    {},
}


def print_step(title):
    print(f"\n{'='*64}\n  {title}\n{'='*64}")


def request(method, url, **kwargs):
    # verify=False solo para LOCAL con SSL autofirmado; en Hostinger usa SSL real, quita esta línea
    kwargs.setdefault("verify", False)
    try:
        resp = requests.request(method, url, timeout=60, **kwargs)
        if resp.status_code >= 400:
            print(f"  ✗ HTTP {resp.status_code} en {method} {url}")
            try:
                print(f"     {resp.json()}")
            except Exception:
                print(f"     {resp.text[:200]}")
            return None
        return resp.json()
    except requests.RequestException as e:
        print(f"  ✗ Error de red: {e}")
        return None


# ═══════════════════════════════════════════════════════════════
# 1. ATRIBUTOS GLOBALES + TÉRMINOS
# ═══════════════════════════════════════════════════════════════

ATTRIBUTES = [
    ("color", "Color", "select", [
        "Negro", "Blanco", "Rojo", "Azul", "Verde", "Gris",
        "Amarillo", "Naranja", "Azul marino", "Beige", "Vinotinto",
    ]),
    ("talla", "Talla", "select", ["XS", "S", "M", "L", "XL", "XXL", "Única"]),
    ("material", "Material", "select", [
        "Algodón", "Poliéster", "Algodón-Poliéster", "Nylon",
        "Drill", "Lona", "Cuero", "Jean", "Acero inoxidable", "Plástico", "Vidrio",
    ]),
    ("tecnica_impresion", "Técnica de impresión", "select", [
        "Sublimado", "Bordado", "Serigrafía", "Tampografía", "Grabado láser", "Vinilo",
    ]),
    ("capacidad", "Capacidad", "select", [
        "250ml", "350ml", "500ml", "750ml", "1000ml",
    ]),
    ("tipo_gorra", "Tipo de gorra", "select", ["Drill", "Malla", "Trucker", "Beanie"]),
    ("uso", "Uso", "select", ["Diario", "Viaje", "Laboral", "Deportivo"]),
    ("tipo_mascota", "Tipo de mascota", "select", [
        "Perro pequeño", "Perro mediano", "Perro grande", "Gato",
    ]),
]


def create_attributes():
    print_step("PASO 1 — Creando atributos globales y términos")
    for slug, name, attr_type, values in ATTRIBUTES:
        payload = {
            "name": name,
            "slug": f"pa_{slug}",
            "type": attr_type,
            "order_by": "menu_order",
            "has_archives": False,
        }
        data = request("POST", f"{WC_API}/products/attributes",
                       auth=wc_auth, json=payload)
        if not data:
            existing = request("GET", f"{WC_API}/products/attributes",
                               auth=wc_auth) or []
            data = next((a for a in existing if a["slug"] == f"pa_{slug}"
                         or a["slug"] == slug), None)
            if not data:
                print(f"  ✗ No pude crear ni recuperar atributo {name}")
                continue
            print(f"  ↻ {name} ya existía → id {data['id']}")
        else:
            print(f"  ✓ {name} → id {data['id']}")

        attr_id = data["id"]
        IDS["attributes"][slug] = attr_id
        time.sleep(SLEEP)

        for value in values:
            term_data = request(
                "POST", f"{WC_API}/products/attributes/{attr_id}/terms",
                auth=wc_auth, json={"name": value},
            )
            if term_data:
                print(f"     ↳ {value}")
            time.sleep(SLEEP)


# ═══════════════════════════════════════════════════════════════
# 2. CATEGORÍAS
# ═══════════════════════════════════════════════════════════════

CATEGORIES_TREE = [
    ("Ropa corporativa", [
        "Polo / Camisa / Camiseta", "Gorra drill", "Gorra malla",
        "Chaqueta acolchada", "Chaleco", "Chaqueta rompevientos",
        "Chaqueta jean", "Chaqueta cuero", "Hoodie / Sudadera", "Saco",
    ]),
    ("Indumentaria y dotación", [
        "Uniforme chef", "Uniforme servicio", "Delantal", "Cofia", "Bata / Overol",
    ]),
    ("Recipientes personalizados", [
        "Botilito bebidas frías", "Vasos personalizados", "Pocillos personalizados",
    ]),
    ("Oficina y promocionales", [
        "Esferos", "Llaveros",
    ]),
    ("Textiles promocionales", [
        "Banderas", "Bolsas en cambre", "Tote bag", "Mochila",
        "Maletín deportivo / Viaje", "Chaqueta prom", "Hoodie prom",
    ]),
    ("Productos para mascotas", [
        "Pañoletas", "Juguetes", "Portacomidas", "Termo agua", "Otros accesorios",
    ]),
]


def create_categories():
    print_step("PASO 2 — Creando categorías")
    for parent_name, children in CATEGORIES_TREE:
        data = request("POST", f"{WC_API}/products/categories",
                       auth=wc_auth, json={"name": parent_name})
        if not data:
            print(f"  ✗ {parent_name}")
            continue
        parent_id = data["id"]
        IDS["categories"][parent_name] = parent_id
        print(f"  ✓ {parent_name} → id {parent_id}")
        time.sleep(SLEEP)

        for child_name in children:
            data2 = request("POST", f"{WC_API}/products/categories",
                            auth=wc_auth,
                            json={"name": child_name, "parent": parent_id})
            if data2:
                IDS["categories"][child_name] = data2["id"]
                print(f"     ↳ {child_name} → id {data2['id']}")
            time.sleep(SLEEP)


# ═══════════════════════════════════════════════════════════════
# 3. PRODUCTOS + VARIANTES
# ═══════════════════════════════════════════════════════════════

COLORES_BASE = ["Negro", "Blanco", "Azul marino", "Gris"]
TALLAS_BASE  = ["S", "M", "L", "XL"]

def variants_ropa():
    return [{"talla": t, "color": c} for t in TALLAS_BASE for c in COLORES_BASE]

def variants_color():
    return [{"color": c} for c in COLORES_BASE]

def variants_recipiente():
    return [{"capacidad": cap, "color": col}
            for cap in ["350ml", "500ml", "750ml"]
            for col in COLORES_BASE]

def variants_cofia():
    return [{"talla": "Única", "color": c} for c in COLORES_BASE]


PRODUCTS = [
    ("Polo / Camisa / Camiseta personalizada", "Polo / Camisa / Camiseta",
     "Polo, camisa o camiseta corporativa personalizable con logo. Disponible en algodón o poliéster.",
     {"material": "Algodón", "tecnica_impresion": "Sublimado"},
     "CAM-CORP", variants_ropa),

    ("Gorra drill personalizada", "Gorra drill",
     "Gorra estructurada en drill con cierre trasero ajustable. Bordado frontal a color.",
     {"material": "Drill", "tipo_gorra": "Drill", "tecnica_impresion": "Bordado"},
     "GORRA-DRILL", variants_color),

    ("Gorra malla personalizada", "Gorra malla",
     "Gorra estilo trucker con panel frontal sólido y malla trasera. Bordado o estampado.",
     {"material": "Nylon", "tipo_gorra": "Malla", "tecnica_impresion": "Bordado"},
     "GORRA-MALLA", variants_color),

    ("Chaqueta acolchada personalizada", "Chaqueta acolchada",
     "Chaqueta acolchada tipo bomber o puffer, ideal para climas fríos. Con bordado o estampado.",
     {"material": "Nylon", "tecnica_impresion": "Bordado"},
     "CHAQ-ACO", variants_ropa),

    ("Chaleco personalizado", "Chaleco",
     "Chaleco corporativo sin mangas, disponible en varios materiales. Bordado o estampado.",
     {"material": "Nylon", "tecnica_impresion": "Bordado"},
     "CHALECO", variants_ropa),

    ("Chaqueta rompevientos personalizada", "Chaqueta rompevientos",
     "Chaqueta ligera cortaviento ideal para actividades al aire libre o dotaciones.",
     {"material": "Nylon", "tecnica_impresion": "Bordado"},
     "CHAQ-ROM", variants_ropa),

    ("Chaqueta jean personalizada", "Chaqueta jean",
     "Chaqueta en jean personalizable con parches, bordado o impresión.",
     {"material": "Jean", "tecnica_impresion": "Bordado"},
     "CHAQ-JEAN", variants_ropa),

    ("Chaqueta cuero personalizada", "Chaqueta cuero",
     "Chaqueta en cuero o cuero sintético con personalización en espalda o pecho.",
     {"material": "Cuero", "tecnica_impresion": "Bordado"},
     "CHAQ-CUERO", variants_ropa),

    ("Hoodie / Sudadera personalizada", "Hoodie / Sudadera",
     "Hoodie con capota o sudadera sin capota, personalizable con logo corporativo.",
     {"material": "Algodón-Poliéster", "tecnica_impresion": "Sublimado"},
     "HOODIE", variants_ropa),

    ("Saco personalizado", "Saco",
     "Saco corporativo en tela tejida o lana, con bordado discreto de logo.",
     {"material": "Algodón", "tecnica_impresion": "Bordado"},
     "SACO", variants_ropa),

    ("Uniforme chef personalizado", "Uniforme chef",
     "Chaqueta y pantalón de chef en algodón-poliéster. Personalizable con logo bordado.",
     {"material": "Algodón-Poliéster", "uso": "Laboral", "tecnica_impresion": "Bordado"},
     "UNI-CHEF", variants_ropa),

    ("Uniforme servicio personalizado", "Uniforme servicio",
     "Uniforme completo para personal de servicio: camisa, pantalón o falda.",
     {"material": "Poliéster", "uso": "Laboral", "tecnica_impresion": "Bordado"},
     "UNI-SERV", variants_ropa),

    ("Delantal personalizado", "Delantal",
     "Delantal de cocina o servicio con bolsillo. Disponible en varios colores con logo bordado.",
     {"material": "Algodón", "uso": "Laboral", "tecnica_impresion": "Bordado"},
     "DELANTAL", variants_ropa),

    ("Cofia personalizada", "Cofia",
     "Cofia desechable o en tela para personal de cocina y salud. Con logo impreso.",
     {"material": "Poliéster", "uso": "Laboral"},
     "COFIA", variants_cofia),

    ("Bata / Overol personalizado", "Bata / Overol",
     "Bata de laboratorio, clínica o industrial / overol de trabajo personalizable.",
     {"material": "Algodón-Poliéster", "uso": "Laboral", "tecnica_impresion": "Bordado"},
     "BATA", variants_ropa),

    ("Botilito bebidas frías personalizado", "Botilito bebidas frías",
     "Botilito en plástico libre de BPA para bebidas frías. Impresión 360° full color.",
     {"material": "Plástico", "tecnica_impresion": "Sublimado"},
     "BOTILITO", variants_recipiente),

    ("Vaso personalizado", "Vasos personalizados",
     "Vaso plástico o acrílico personalizado con logo. Ideal para eventos y promociones.",
     {"material": "Plástico", "tecnica_impresion": "Serigrafía"},
     "VASO", variants_color),

    ("Pocillo personalizado", "Pocillos personalizados",
     "Pocillo cerámico o de acero con impresión de logo a todo color.",
     {"material": "Acero inoxidable", "tecnica_impresion": "Sublimado"},
     "POCILLO", variants_color),

    ("Esfero personalizado", "Esferos",
     "Esfero plástico o metálico con grabado láser o impresión de logo.",
     {"material": "Plástico", "tecnica_impresion": "Tampografía"},
     "ESFERO", variants_color),

    ("Llavero personalizado", "Llaveros",
     "Llavero en acrílico, metal o caucho con logo personalizado.",
     {"material": "Plástico", "tecnica_impresion": "Sublimado"},
     "LLAVERO", variants_color),

    ("Bandera personalizada", "Banderas",
     "Bandera publicitaria en tela poliéster, sublimado full color. Varios tamaños.",
     {"material": "Poliéster", "tecnica_impresion": "Sublimado"},
     "BANDERA", variants_color),

    ("Bolsa en cambre personalizada", "Bolsas en cambre",
     "Bolsa en tela cambre no tejida con logo impreso. Económica y ecológica.",
     {"material": "Nylon", "uso": "Diario", "tecnica_impresion": "Serigrafía"},
     "BOLSA-CAM", variants_color),

    ("Tote bag personalizada", "Tote bag",
     "Tote bag en lona natural o de color, serigrafía o sublimado. Manija larga.",
     {"material": "Lona", "uso": "Diario", "tecnica_impresion": "Serigrafía"},
     "TOTE", variants_color),

    ("Mochila personalizada", "Mochila",
     "Mochila escolar o ejecutiva con compartimiento laptop. Bordado o sublimado.",
     {"material": "Nylon", "uso": "Diario", "tecnica_impresion": "Bordado"},
     "MOCHILA", variants_color),

    ("Maletín deportivo / Viaje personalizado", "Maletín deportivo / Viaje",
     "Maletín tipo duffle o deportivo con logo bordado. Ideal para equipos y empresas.",
     {"material": "Nylon", "uso": "Viaje", "tecnica_impresion": "Bordado"},
     "MALETIN", variants_color),

    ("Chaqueta prom personalizada", "Chaqueta prom",
     "Chaqueta de grado o prom con nombre y logo bordado. Varios estilos.",
     {"material": "Nylon", "tecnica_impresion": "Bordado"},
     "CHAQ-PROM", variants_ropa),

    ("Hoodie prom personalizado", "Hoodie prom",
     "Hoodie de grado con nombre bordado y diseño personalizado de grupo.",
     {"material": "Algodón-Poliéster", "tecnica_impresion": "Bordado"},
     "HOOD-PROM", variants_ropa),

    ("Pañoleta para mascotas personalizada", "Pañoletas",
     "Pañoleta bandana para perros y gatos, sublimado full color con nombre o logo.",
     {"material": "Poliéster", "tecnica_impresion": "Sublimado"},
     "PAN-MASC", variants_color),

    ("Juguete para mascotas personalizado", "Juguetes",
     "Juguete mordible o de tela con logo impreso. Ideal para regalo corporativo pet-friendly.",
     {"material": "Algodón"},
     "JUG-MASC", variants_color),

    ("Portacomidas para mascotas personalizado", "Portacomidas",
     "Portacomidas o comedero personalizable con nombre de la mascota o logo de marca.",
     {"material": "Plástico"},
     "PORT-COM", variants_color),

    ("Termo agua para mascotas personalizado", "Termo agua",
     "Dispensador de agua portátil para mascotas con logo grabado o impreso.",
     {"material": "Plástico"},
     "TERMO-MASC", variants_color),

    ("Accesorios para mascotas personalizados", "Otros accesorios",
     "Otros accesorios personalizables para mascotas: collares, correas, ropa.",
     {"material": "Nylon"},
     "ACC-MASC", variants_color),
]


def build_product_attributes(product_attrs: dict, variation_keys: list):
    attrs = []
    position = 0

    for slug, value in product_attrs.items():
        attr_id = IDS["attributes"].get(slug)
        if not attr_id:
            continue
        attrs.append({
            "id": attr_id,
            "position": position,
            "visible": True,
            "variation": False,
            "options": [value],
        })
        position += 1

    valores_por_atributo = {}
    for var_combo in variation_keys:
        for slug, value in var_combo.items():
            valores_por_atributo.setdefault(slug, set()).add(value)

    for slug, valores in valores_por_atributo.items():
        attr_id = IDS["attributes"].get(slug)
        if not attr_id:
            continue
        attrs.append({
            "id": attr_id,
            "position": position,
            "visible": True,
            "variation": True,
            "options": sorted(valores),
        })
        position += 1

    return attrs


def create_products_and_variants():
    print_step("PASO 3 — Creando productos y variantes")

    for name, cat_name, description, prod_attrs, sku_base, var_builder in PRODUCTS:
        print(f"\n  ── {name} [{sku_base}] ──")

        cat_id = IDS["categories"].get(cat_name)
        if not cat_id:
            print(f"     ⚠ Categoría '{cat_name}' no encontrada, saltando.")
            continue

        variation_combos = var_builder()

        payload = {
            "name": name,
            "type": "variable",
            "status": "publish",
            "catalog_visibility": "visible",
            "description": f"<p>{description}</p>",
            "short_description": description,
            "sku": sku_base,
            "categories": [{"id": cat_id}],
            "attributes": build_product_attributes(prod_attrs, variation_combos),
            "meta_data": [
                {"key": "model_3d_url", "value": ""},
                {"key": "customization_zones", "value": "[]"},
            ],
        }

        data = request("POST", f"{WC_API}/products",
                       auth=wc_auth, json=payload)
        if not data:
            print(f"     ✗ Producto no creado, saltando variantes")
            continue

        product_id = data["id"]
        IDS["products"][name] = product_id
        print(f"     ✓ Producto creado → id {product_id}")
        time.sleep(SLEEP)

        for i, combo in enumerate(variation_combos, start=1):
            variant_sku = f"{sku_base}-{i:03d}"
            variant_attrs = []
            for slug, value in combo.items():
                attr_id = IDS["attributes"].get(slug)
                if not attr_id:
                    continue
                attr_info = next((a for a in ATTRIBUTES if a[0] == slug), None)
                if not attr_info:
                    continue
                variant_attrs.append({
                    "id": attr_id,
                    "name": attr_info[1],
                    "option": value,
                })

            v_payload = {
                "sku": variant_sku,
                "regular_price": "0",
                "attributes": variant_attrs,
                "manage_stock": False,
            }

            v_data = request(
                "POST",
                f"{WC_API}/products/{product_id}/variations",
                auth=wc_auth, json=v_payload,
            )
            if v_data:
                print(f"        ↳ {variant_sku}")
            time.sleep(SLEEP)


def save_state():
    with open("woo_catalog_state.json", "w", encoding="utf-8") as f:
        json.dump(IDS, f, indent=2, ensure_ascii=False)
    print("\n✅ Estado guardado en woo_catalog_state.json")


if __name__ == "__main__":
    print("🚀 Setup del catálogo INNVOLO en WooCommerce")
    print(f"   Sitio: {WC_BASE_URL}\n")

    create_attributes()
    create_categories()
    create_products_and_variants()
    save_state()

    print("\n🎉 Catálogo creado.")
    print("   Siguiente paso: subir imágenes y .glb manualmente desde wp-admin.")