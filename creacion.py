"""
Saleor Catalog Setup Script
============================
Crea atributos, product types, categorías, productos y variantes en batch.

USO:
    pip install requests
    python saleor_catalog_setup.py

CONFIG:
    Edita las variables SALEOR_URL y AUTH_TOKEN abajo.
"""

import requests
import json
import time

# ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
SALEOR_URL = "http://localhost:8000/graphql/"   # <-- cambia esto
AUTH_TOKEN  = "eyJhbGciOiJSUzI1NiIsImtpZCI6IlNiWUVmWVdPUUZzSUNEbVNBVE12UE9VU1ZmejFfZG00bVlLRjRRa3pReVEiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE3NzQwNzExODAsIm93bmVyIjoic2FsZW9yIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL2dyYXBocWwvIiwiZXhwIjoxNzc0MDcxNDgwLCJ0b2tlbiI6Ikt6c3JNRjg2OTFkNCIsImVtYWlsIjoiZmFqYXJmc2FibzE2MUBnbWFpbC5jb20iLCJ0eXBlIjoiYWNjZXNzIiwidXNlcl9pZCI6IlZYTmxjam94IiwiaXNfc3RhZmYiOnRydWV9.HLzrOPkxHfUvKyzj5r2o0JMR0q9DdsfBuabsqV6J28cLCclsSgGyGcXJFwuPmJE1XcwWVVbV8BGR9bXJvljGBm2vJ-xOz5Ii0jR6SWgmUbBMlOUuU0zealak21HvapGJ1gweUNYFSL-kqSIbTXN3bfFZ4uwTMQnoZmo3Y3-c65hovco6yaLLU6Nu1012VO3c6iT_pqbrhm1bpew9UnWsrHAc4FWL-2HKZNyzSGtys16aEMV5dU96cygadDtSeKhb1rm0Mz1HVn-QvM90CekwdtHfiEvftoJ9mPj4Pq_fOrcuv-Wi89_UhuYakYzHkvEwwukNYiJkIl5pLrTAK8tsmA"                          # <-- token con permisos MANAGE_PRODUCTS
# ──────────────────────────────────────────────────────────────────────────────

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {AUTH_TOKEN}",
}

IDS = {
    "attributes":   {},
    "productTypes": {},
    "categories":   {},
    "products":     {},
}


def gql(query: str, variables: dict = None):
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    resp = requests.post(SALEOR_URL, json=payload, headers=HEADERS)
    resp.raise_for_status()
    body = resp.json()
    if "errors" in body:
        print("  ⚠️  GraphQL errors:", json.dumps(body["errors"], indent=2))
    return body.get("data", {})


def print_step(title: str):
    print(f"\n{'='*60}\n  {title}\n{'='*60}")


# ═══════════════════════════════════════════════════════════════
# 1. ATRIBUTOS
# ═══════════════════════════════════════════════════════════════

ATTRIBUTES = [
    # (slug, nombre, tipo_input, [valores])
    ("color", "Color", "DROPDOWN", [
        "Negro", "Blanco", "Rojo", "Azul", "Verde", "Gris",
        "Amarillo", "Naranja", "Azul marino", "Beige", "Vinotinto",
    ]),
    ("talla", "Talla", "DROPDOWN", ["XS", "S", "M", "L", "XL", "XXL", "Única"]),
    ("material", "Material", "DROPDOWN", [
        "Algodón", "Poliéster", "Algodón-Poliéster", "Nylon",
        "Drill", "Lona", "Cuero", "Jean", "Acero inoxidable", "Plástico", "Vidrio",
    ]),
    ("tecnica_impresion", "Técnica de impresión", "DROPDOWN", [
        "Sublimado", "Bordado", "Serigrafía", "Tampografía", "Grabado láser", "Vinilo",
    ]),
    ("capacidad", "Capacidad", "DROPDOWN", [
        "250ml", "350ml", "500ml", "750ml", "1000ml",
    ]),
    ("tipo_gorra", "Tipo de gorra", "DROPDOWN", ["Drill", "Malla", "Trucker", "Beanie"]),
    ("uso", "Uso", "DROPDOWN", ["Diario", "Viaje", "Laboral", "Deportivo"]),
    ("tipo_mascota", "Tipo de mascota", "DROPDOWN", [
        "Perro pequeño", "Perro mediano", "Perro grande", "Gato",
    ]),
    ("cantidad_minima", "Cantidad mínima", "NUMERIC", []),
    ("area_impresion", "Área de impresión", "PLAIN_TEXT", []),
    ("personalizacion", "Descripción personalización", "PLAIN_TEXT", []),
]

CREATE_ATTRIBUTE = """
mutation CreateAttribute($input: AttributeCreateInput!) {
  attributeCreate(input: $input) {
    attribute { id name slug }
    errors { field message }
  }
}
"""

def create_attributes():
    print_step("PASO 1 — Creando atributos")
    for slug, name, input_type, values in ATTRIBUTES:
        variables = {
            "input": {
                "name": name,
                "slug": slug,
                "type": "PRODUCT_TYPE",
                "inputType": input_type,
                "values": [{"name": v} for v in values],
            }
        }
        data = gql(CREATE_ATTRIBUTE, variables)
        result = data.get("attributeCreate", {})
        errors = result.get("errors", [])
        if errors:
            print(f"  ✗ {name}: {errors}")
        else:
            IDS["attributes"][slug] = result["attribute"]["id"]
            print(f"  ✓ {name} → {result['attribute']['id']}")
        time.sleep(0.2)


# ═══════════════════════════════════════════════════════════════
# 2. PRODUCT TYPES
# ═══════════════════════════════════════════════════════════════

PRODUCT_TYPES = [
    (
        "Ropa Personalizable",
        True,
        ["material", "tecnica_impresion", "cantidad_minima", "area_impresion"],
        ["talla", "color"],
    ),
    (
        "Gorras",
        True,
        ["material", "tipo_gorra", "tecnica_impresion", "cantidad_minima"],
        ["color"],
    ),
    (
        "Uniformes y dotación",
        True,
        ["material", "uso", "tecnica_impresion", "cantidad_minima"],
        ["talla", "color"],
    ),
    (
        "Recipientes",
        True,
        ["material", "tecnica_impresion", "cantidad_minima"],
        ["capacidad", "color"],
    ),
    (
        "Promocionales pequeños",
        True,
        ["material", "tecnica_impresion", "cantidad_minima"],
        ["color"],
    ),
    (
        "Bolsas y textiles",
        True,
        ["material", "uso", "tecnica_impresion", "cantidad_minima"],
        ["color"],
    ),
    (
        "Mascotas",
        True,
        ["material", "tipo_mascota", "cantidad_minima"],
        ["color"],
    ),
]

CREATE_PRODUCT_TYPE = """
mutation CreateProductType($input: ProductTypeInput!) {
  productTypeCreate(input: $input) {
    productType { id name }
    errors { field message }
  }
}
"""

def create_product_types():
    print_step("PASO 2 — Creando product types")
    for name, has_variants, prod_attrs, var_attrs in PRODUCT_TYPES:
        product_attr_ids = [IDS["attributes"][a] for a in prod_attrs if a in IDS["attributes"]]
        variant_attr_ids = [IDS["attributes"][a] for a in var_attrs  if a in IDS["attributes"]]
        variables = {
            "input": {
                "name": name,
                "hasVariants": has_variants,
                "isShippingRequired": True,
                "productAttributes": product_attr_ids,
                "variantAttributes": variant_attr_ids,
            }
        }
        data = gql(CREATE_PRODUCT_TYPE, variables)
        result = data.get("productTypeCreate", {})
        errors = result.get("errors", [])
        if errors:
            print(f"  ✗ {name}: {errors}")
        else:
            IDS["productTypes"][name] = result["productType"]["id"]
            print(f"  ✓ {name} → {result['productType']['id']}")
        time.sleep(0.2)


# ═══════════════════════════════════════════════════════════════
# 3. CATEGORÍAS
# ═══════════════════════════════════════════════════════════════

CATEGORIES_TREE = [
    ("Ropa corporativa", [
        "Polo / Camisa / Camiseta",
        "Gorra drill",
        "Gorra malla",
        "Chaqueta acolchada",
        "Chaleco",
        "Chaqueta rompevientos",
        "Chaqueta jean",
        "Chaqueta cuero",
        "Hoodie / Sudadera",
        "Saco",
    ]),
    ("Indumentaria y dotación", [
        "Uniforme chef",
        "Uniforme servicio",
        "Delantal",
        "Cofia",
        "Bata / Overol",
    ]),
    ("Recipientes personalizados", [
        "Botilito bebidas frías",
        "Vasos personalizados",
        "Pocillos personalizados",
    ]),
    ("Oficina y promocionales", [
        "Esferos",
        "Llaveros",
    ]),
    ("Textiles promocionales", [
        "Banderas",
        "Bolsas en cambre",
        "Tote bag",
        "Mochila",
        "Maletín deportivo / Viaje",
        "Chaqueta prom",
        "Hoodie prom",
    ]),
    ("Productos para mascotas", [
        "Pañoletas",
        "Juguetes",
        "Portacomidas",
        "Termo agua",
        "Otros accesorios",
    ]),
]

CREATE_CATEGORY = """
mutation CreateCategory($input: CategoryInput!, $parent: ID) {
  categoryCreate(input: $input, parent: $parent) {
    category { id name }
    errors { field message }
  }
}
"""

def create_categories():
    print_step("PASO 3 — Creando categorías")
    for parent_name, children in CATEGORIES_TREE:
        data = gql(CREATE_CATEGORY, {"input": {"name": parent_name}, "parent": None})
        result = data.get("categoryCreate", {})
        if result.get("errors"):
            print(f"  ✗ {parent_name}: {result['errors']}")
            continue
        parent_id = result["category"]["id"]
        IDS["categories"][parent_name] = parent_id
        print(f"  ✓ {parent_name} → {parent_id}")
        time.sleep(0.2)

        for child_name in children:
            data2 = gql(CREATE_CATEGORY, {"input": {"name": child_name}, "parent": parent_id})
            result2 = data2.get("categoryCreate", {})
            if result2.get("errors"):
                print(f"    ✗ {child_name}: {result2['errors']}")
            else:
                IDS["categories"][child_name] = result2["category"]["id"]
                print(f"    ↳ {child_name} → {result2['category']['id']}")
            time.sleep(0.2)


# ═══════════════════════════════════════════════════════════════
# 4. PRODUCTOS  (todos los del catálogo)
# ═══════════════════════════════════════════════════════════════

PRODUCTS = [

    # ── ROPA CORPORATIVA ──────────────────────────────────────
    (
        "Polo / Camisa / Camiseta personalizada",
        "Ropa Personalizable",
        "Polo / Camisa / Camiseta",
        "Polo, camisa o camiseta corporativa personalizable con logo. Disponible en algodón o poliéster.",
        {"material": "Algodón", "tecnica_impresion": "Sublimado"},
    ),
    (
        "Gorra drill personalizada",
        "Gorras",
        "Gorra drill",
        "Gorra estructurada en drill con cierre trasero ajustable. Bordado frontal a color.",
        {"material": "Drill", "tipo_gorra": "Drill", "tecnica_impresion": "Bordado"},
    ),
    (
        "Gorra malla personalizada",
        "Gorras",
        "Gorra malla",
        "Gorra estilo trucker con panel frontal sólido y malla trasera. Bordado o estampado.",
        {"material": "Nylon", "tipo_gorra": "Malla", "tecnica_impresion": "Bordado"},
    ),
    (
        "Chaqueta acolchada personalizada",
        "Ropa Personalizable",
        "Chaqueta acolchada",
        "Chaqueta acolchada tipo bomber o puffer, ideal para climas fríos. Con bordado o estampado.",
        {"material": "Nylon", "tecnica_impresion": "Bordado"},
    ),
    (
        "Chaleco personalizado",
        "Ropa Personalizable",
        "Chaleco",
        "Chaleco corporativo sin mangas, disponible en varios materiales. Bordado o estampado.",
        {"material": "Nylon", "tecnica_impresion": "Bordado"},
    ),
    (
        "Chaqueta rompevientos personalizada",
        "Ropa Personalizable",
        "Chaqueta rompevientos",
        "Chaqueta ligera cortaviento ideal para actividades al aire libre o dotaciones.",
        {"material": "Nylon", "tecnica_impresion": "Bordado"},
    ),
    (
        "Chaqueta jean personalizada",
        "Ropa Personalizable",
        "Chaqueta jean",
        "Chaqueta en jean personalizable con parches, bordado o impresión.",
        {"material": "Jean", "tecnica_impresion": "Bordado"},
    ),
    (
        "Chaqueta cuero personalizada",
        "Ropa Personalizable",
        "Chaqueta cuero",
        "Chaqueta en cuero o cuero sintético con personalización en espalda o pecho.",
        {"material": "Cuero", "tecnica_impresion": "Bordado"},
    ),
    (
        "Hoodie / Sudadera personalizada",
        "Ropa Personalizable",
        "Hoodie / Sudadera",
        "Hoodie con capota o sudadera sin capota, personalizable con logo corporativo.",
        {"material": "Algodón-Poliéster", "tecnica_impresion": "Sublimado"},
    ),
    (
        "Saco personalizado",
        "Ropa Personalizable",
        "Saco",
        "Saco corporativo en tela tejida o lana, con bordado discreto de logo.",
        {"material": "Algodón", "tecnica_impresion": "Bordado"},
    ),

    # ── INDUMENTARIA Y DOTACIÓN ───────────────────────────────
    (
        "Uniforme chef personalizado",
        "Uniformes y dotación",
        "Uniforme chef",
        "Chaqueta y pantalón de chef en algodón-poliéster. Personalizable con logo bordado.",
        {"material": "Algodón-Poliéster", "uso": "Laboral", "tecnica_impresion": "Bordado"},
    ),
    (
        "Uniforme servicio personalizado",
        "Uniformes y dotación",
        "Uniforme servicio",
        "Uniforme completo para personal de servicio: camisa, pantalón o falda.",
        {"material": "Poliéster", "uso": "Laboral", "tecnica_impresion": "Bordado"},
    ),
    (
        "Delantal personalizado",
        "Uniformes y dotación",
        "Delantal",
        "Delantal de cocina o servicio con bolsillo. Disponible en varios colores con logo bordado.",
        {"material": "Algodón", "uso": "Laboral", "tecnica_impresion": "Bordado"},
    ),
    (
        "Cofia personalizada",
        "Uniformes y dotación",
        "Cofia",
        "Cofia desechable o en tela para personal de cocina y salud. Con logo impreso.",
        {"material": "Poliéster", "uso": "Laboral"},
    ),
    (
        "Bata / Overol personalizado",
        "Uniformes y dotación",
        "Bata / Overol",
        "Bata de laboratorio, clínica o industrial / overol de trabajo personalizable.",
        {"material": "Algodón-Poliéster", "uso": "Laboral", "tecnica_impresion": "Bordado"},
    ),

    # ── RECIPIENTES PERSONALIZADOS ────────────────────────────
    (
        "Botilito bebidas frías personalizado",
        "Recipientes",
        "Botilito bebidas frías",
        "Botilito en plástico libre de BPA para bebidas frías. Impresión 360° full color.",
        {"material": "Plástico", "tecnica_impresion": "Sublimado"},
    ),
    (
        "Vaso personalizado",
        "Recipientes",
        "Vasos personalizados",
        "Vaso plástico o acrílico personalizado con logo. Ideal para eventos y promociones.",
        {"material": "Plástico", "tecnica_impresion": "Serigrafía"},
    ),
    (
        "Pocillo personalizado",
        "Recipientes",
        "Pocillos personalizados",
        "Pocillo cerámico o de acero con impresión de logo a todo color.",
        {"material": "Acero inoxidable", "tecnica_impresion": "Sublimado"},
    ),

    # ── OFICINA Y PROMOCIONALES ───────────────────────────────
    (
        "Esfero personalizado",
        "Promocionales pequeños",
        "Esferos",
        "Esfero plástico o metálico con grabado láser o impresión de logo.",
        {"material": "Plástico", "tecnica_impresion": "Tampografía"},
    ),
    (
        "Llavero personalizado",
        "Promocionales pequeños",
        "Llaveros",
        "Llavero en acrílico, metal o caucho con logo personalizado.",
        {"material": "Plástico", "tecnica_impresion": "Sublimado"},
    ),

    # ── TEXTILES PROMOCIONALES ────────────────────────────────
    (
        "Bandera personalizada",
        "Bolsas y textiles",
        "Banderas",
        "Bandera publicitaria en tela poliéster, sublimado full color. Varios tamaños.",
        {"material": "Poliéster", "tecnica_impresion": "Sublimado"},
    ),
    (
        "Bolsa en cambre personalizada",
        "Bolsas y textiles",
        "Bolsas en cambre",
        "Bolsa en tela cambre no tejida con logo impreso. Económica y ecológica.",
        {"material": "Nylon", "uso": "Diario", "tecnica_impresion": "Serigrafía"},
    ),
    (
        "Tote bag personalizada",
        "Bolsas y textiles",
        "Tote bag",
        "Tote bag en lona natural o de color, serigrafía o sublimado. Manija larga.",
        {"material": "Lona", "uso": "Diario", "tecnica_impresion": "Serigrafía"},
    ),
    (
        "Mochila personalizada",
        "Bolsas y textiles",
        "Mochila",
        "Mochila escolar o ejecutiva con compartimiento laptop. Bordado o sublimado.",
        {"material": "Nylon", "uso": "Diario", "tecnica_impresion": "Bordado"},
    ),
    (
        "Maletín deportivo / Viaje personalizado",
        "Bolsas y textiles",
        "Maletín deportivo / Viaje",
        "Maletín tipo duffle o deportivo con logo bordado. Ideal para equipos y empresas.",
        {"material": "Nylon", "uso": "Viaje", "tecnica_impresion": "Bordado"},
    ),
    (
        "Chaqueta prom personalizada",
        "Ropa Personalizable",
        "Chaqueta prom",
        "Chaqueta de grado o prom con nombre y logo bordado. Varios estilos.",
        {"material": "Nylon", "tecnica_impresion": "Bordado"},
    ),
    (
        "Hoodie prom personalizado",
        "Ropa Personalizable",
        "Hoodie prom",
        "Hoodie de grado con nombre bordado y diseño personalizado de grupo.",
        {"material": "Algodón-Poliéster", "tecnica_impresion": "Bordado"},
    ),

    # ── PRODUCTOS PARA MASCOTAS ───────────────────────────────
    (
        "Pañoleta para mascotas personalizada",
        "Mascotas",
        "Pañoletas",
        "Pañoleta bandana para perros y gatos, sublimado full color con nombre o logo.",
        {"material": "Poliéster", "tecnica_impresion": "Sublimado"},
    ),
    (
        "Juguete para mascotas personalizado",
        "Mascotas",
        "Juguetes",
        "Juguete mordible o de tela con logo impreso. Ideal para regalo corporativo pet-friendly.",
        {"material": "Algodón"},
    ),
    (
        "Portacomidas para mascotas personalizado",
        "Mascotas",
        "Portacomidas",
        "Portacomidas o comedero personalizable con nombre de la mascota o logo de marca.",
        {"material": "Plástico"},
    ),
    (
        "Termo agua para mascotas personalizado",
        "Mascotas",
        "Termo agua",
        "Dispensador de agua portátil para mascotas con logo grabado o impreso.",
        {"material": "Plástico"},
    ),
    (
        "Accesorios para mascotas personalizados",
        "Mascotas",
        "Otros accesorios",
        "Otros accesorios personalizables para mascotas: collares, correas, ropa.",
        {"material": "Nylon"},
    ),
]

CREATE_PRODUCT = """
mutation CreateProduct($input: ProductCreateInput!) {
  productCreate(input: $input) {
    product { id name }
    errors { field message }
  }
}
"""

def resolve_attribute_values(attrs_dict: dict) -> list:
    result = []
    for slug, value in attrs_dict.items():
        attr_id = IDS["attributes"].get(slug)
        if not attr_id:
            continue
        result.append({"id": attr_id, "values": [value]})
    return result


def create_products():
    print_step("PASO 4 — Creando productos")
    for name, pt_name, cat_name, description, attrs in PRODUCTS:
        pt_id  = IDS["productTypes"].get(pt_name)
        cat_id = IDS["categories"].get(cat_name)

        if not pt_id:
            print(f"  ✗ {name}: ProductType '{pt_name}' no encontrado, saltando.")
            continue
        if not cat_id:
            print(f"  ⚠ {name}: Categoría '{cat_name}' no encontrada.")

        variables = {
            "input": {
                "name": name,
                "productType": pt_id,
                "category": cat_id,
                "description": json.dumps({
                    "blocks": [{"type": "paragraph", "data": {"text": description}}]
                }),
                "attributes": resolve_attribute_values(attrs),
            }
        }
        data = gql(CREATE_PRODUCT, variables)
        result = data.get("productCreate", {})
        errors = result.get("errors", [])
        if errors:
            print(f"  ✗ {name}: {errors}")
        else:
            IDS["products"][name] = result["product"]["id"]
            print(f"  ✓ {name} → {result['product']['id']}")
        time.sleep(0.2)


# ═══════════════════════════════════════════════════════════════
# 5. VARIANTES
# ═══════════════════════════════════════════════════════════════

COLORES_BASE = ["Negro", "Blanco", "Azul marino", "Gris"]
TALLAS_BASE  = ["S", "M", "L", "XL"]

def build_ropa_variants():
    return [[("talla", t), ("color", c)] for t in TALLAS_BASE for c in COLORES_BASE]

def build_color_variants():
    return [[("color", c)] for c in COLORES_BASE]

def build_recipiente_variants():
    return [
        [("capacidad", cap), ("color", col)]
        for cap in ["350ml", "500ml", "750ml"]
        for col in COLORES_BASE
    ]

VARIANTS = [
    # Ropa — talla + color
    ("Polo / Camisa / Camiseta personalizada",       "CAM-CORP",    build_ropa_variants()),
    ("Chaqueta acolchada personalizada",              "CHAQ-ACO",    build_ropa_variants()),
    ("Chaleco personalizado",                         "CHALECO",     build_ropa_variants()),
    ("Chaqueta rompevientos personalizada",           "CHAQ-ROM",    build_ropa_variants()),
    ("Chaqueta jean personalizada",                   "CHAQ-JEAN",   build_ropa_variants()),
    ("Chaqueta cuero personalizada",                  "CHAQ-CUERO",  build_ropa_variants()),
    ("Hoodie / Sudadera personalizada",               "HOODIE",      build_ropa_variants()),
    ("Saco personalizado",                            "SACO",        build_ropa_variants()),
    ("Chaqueta prom personalizada",                   "CHAQ-PROM",   build_ropa_variants()),
    ("Hoodie prom personalizado",                     "HOOD-PROM",   build_ropa_variants()),
    # Gorras — solo color
    ("Gorra drill personalizada",                     "GORRA-DRILL", build_color_variants()),
    ("Gorra malla personalizada",                     "GORRA-MALLA", build_color_variants()),
    # Uniformes — talla + color
    ("Uniforme chef personalizado",                   "UNI-CHEF",    build_ropa_variants()),
    ("Uniforme servicio personalizado",               "UNI-SERV",    build_ropa_variants()),
    ("Delantal personalizado",                        "DELANTAL",    build_ropa_variants()),
    ("Cofia personalizada",                           "COFIA",       [[("talla", "Única"), ("color", c)] for c in COLORES_BASE]),
    ("Bata / Overol personalizado",                   "BATA",        build_ropa_variants()),
    # Recipientes — capacidad + color
    ("Botilito bebidas frías personalizado",          "BOTILITO",    build_recipiente_variants()),
    ("Vaso personalizado",                            "VASO",        build_color_variants()),
    ("Pocillo personalizado",                         "POCILLO",     build_color_variants()),
    # Promocionales — solo color
    ("Esfero personalizado",                          "ESFERO",      build_color_variants()),
    ("Llavero personalizado",                         "LLAVERO",     build_color_variants()),
    # Textiles — solo color
    ("Bandera personalizada",                         "BANDERA",     build_color_variants()),
    ("Bolsa en cambre personalizada",                 "BOLSA-CAM",   build_color_variants()),
    ("Tote bag personalizada",                        "TOTE",        build_color_variants()),
    ("Mochila personalizada",                         "MOCHILA",     build_color_variants()),
    ("Maletín deportivo / Viaje personalizado",       "MALETIN",     build_color_variants()),
    # Mascotas — solo color
    ("Pañoleta para mascotas personalizada",          "PAN-MASC",    build_color_variants()),
    ("Juguete para mascotas personalizado",           "JUG-MASC",    build_color_variants()),
    ("Portacomidas para mascotas personalizado",      "PORT-COM",    build_color_variants()),
    ("Termo agua para mascotas personalizado",        "TERMO-MASC",  build_color_variants()),
    ("Accesorios para mascotas personalizados",       "ACC-MASC",    build_color_variants()),
]

CREATE_VARIANT = """
mutation CreateVariant($input: ProductVariantCreateInput!) {
  productVariantCreate(input: $input) {
    productVariant { id sku }
    errors { field message }
  }
}
"""

def create_variants():
    print_step("PASO 5 — Creando variantes")
    for product_name, sku_base, variants_list in VARIANTS:
        product_id = IDS["products"].get(product_name)
        if not product_id:
            print(f"  ✗ '{product_name}' no encontrado, saltando variantes.")
            continue

        print(f"  → {product_name} ({len(variants_list)} variantes)")
        for i, attr_pairs in enumerate(variants_list, start=1):
            sku = f"{sku_base}-{i:03d}"
            attr_values = [
                {"id": IDS["attributes"][slug], "values": [value]}
                for slug, value in attr_pairs
                if slug in IDS["attributes"]
            ]
            data = gql(CREATE_VARIANT, {
                "input": {
                    "product": product_id,
                    "sku": sku,
                    "attributes": attr_values,
                }
            })
            result = data.get("productVariantCreate", {})
            if result.get("errors"):
                print(f"    ✗ {sku}: {result['errors']}")
            else:
                print(f"    ✓ {sku}")
            time.sleep(0.15)


# ═══════════════════════════════════════════════════════════════
# GUARDAR IDS
# ═══════════════════════════════════════════════════════════════

def save_ids():
    with open("catalog_ids.json", "w", encoding="utf-8") as f:
        json.dump(IDS, f, indent=2, ensure_ascii=False)
    print("\n✅ IDs guardados en catalog_ids.json")


# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("🚀 Iniciando setup del catálogo en Saleor...")
    print(f"   URL: {SALEOR_URL}\n")

    create_attributes()
    create_product_types()
    create_categories()
    create_products()
    create_variants()
    save_ids()

    print("\n🎉 Catálogo creado exitosamente.")