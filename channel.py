"""
Saleor — Publicar variantes en default-channel con precio 0
============================================================
USO:
    pip install requests
    python publish_variants.py
"""

import requests
import json
import time

# ─── CONFIGURACIÓN ────────────────────────────────────────────
SALEOR_URL = "http://localhost:8000/graphql/"
AUTH_TOKEN  = "eyJhbGciOiJSUzI1NiIsImtpZCI6IlNiWUVmWVdPUUZzSUNEbVNBVE12UE9VU1ZmejFfZG00bVlLRjRRa3pReVEiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE3NzQxNTQ1MTYsIm93bmVyIjoic2FsZW9yIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL2dyYXBocWwvIiwiZXhwIjoxNzc0MTU0ODE2LCJ0b2tlbiI6Ikt6c3JNRjg2OTFkNCIsImVtYWlsIjoiZmFqYXJmc2FibzE2MUBnbWFpbC5jb20iLCJ0eXBlIjoiYWNjZXNzIiwidXNlcl9pZCI6IlZYTmxjam94IiwiaXNfc3RhZmYiOnRydWV9.i9fvK9FTR6a2j7R9F4VY2wgUnKAwvbak4WKJ1WIOi7AJpD7Nq8c8SedAknn2bA0Frfzs4KnROVRNJJLiUYJ0Jsv7uO50RW6rkG7NohyBKrFTmvbdQQnqQEXBps4YXco4li6cyPnQbFdG488hgpPBEt8VvMmr7l_jN83N3atFrA8AAQKTGOnYvZy53sn-thKnTOwE3OmvtPYZ4effh3BRLgWjGNMOasVW_XSAZE8RimBq46tcq9dIjXHb9uQnUAX5Gw4EBEkgVGHRePpwRxfXGuLnkrFNUi32VZLrQLVVYWa1pyZ7hcH_Yy99b714Moid6jSQGYMpHtwNcKjeUwOisA"
CHANNEL_SLUG = "default-channel"
# ──────────────────────────────────────────────────────────────

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {AUTH_TOKEN}",
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


# ─── 1. OBTENER ID DEL CANAL ──────────────────────────────────

GET_CHANNEL = """
query GetChannel($slug: String!) {
  channel(slug: $slug) {
    id
    name
    slug
  }
}
"""

_channel_id = None

def get_channel_id():
    global _channel_id
    if _channel_id:
        return _channel_id
    data = gql(GET_CHANNEL, {"slug": CHANNEL_SLUG})
    channel = data.get("channel")
    if not channel:
        raise Exception(f"Canal '{CHANNEL_SLUG}' no encontrado.")
    _channel_id = channel["id"]
    print(f"  ✓ Canal: {channel['name']} → {_channel_id}")
    return _channel_id


# ─── 2. OBTENER TODAS LAS VARIANTES ───────────────────────────

GET_ALL_VARIANTS = """
query GetVariants($after: String) {
  productVariants(first: 100, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        sku
        product {
          name
        }
      }
    }
  }
}
"""

def get_all_variants():
    print("📦 Obteniendo variantes...")
    variantes = []
    after = None

    while True:
        variables = {"after": after} if after else {}
        data = gql(GET_ALL_VARIANTS, variables)
        edges = data.get("productVariants", {}).get("edges", [])
        page_info = data.get("productVariants", {}).get("pageInfo", {})

        for edge in edges:
            variantes.append(edge["node"])

        if page_info.get("hasNextPage"):
            after = page_info["endCursor"]
        else:
            break

    print(f"  ✓ {len(variantes)} variantes encontradas")
    return variantes


# ─── 3. PUBLICAR VARIANTE CON PRECIO 0 ───────────────────────

PUBLISH_VARIANT = """
mutation PublishVariant($id: ID!, $input: [ProductVariantChannelListingAddInput!]!) {
  productVariantChannelListingUpdate(id: $id, input: $input) {
    variant {
      id
      sku
    }
    errors {
      field
      message
      code
    }
  }
}
"""

def publish_variant(variant_id: str, variant_sku: str, product_name: str):
    variables = {
        "id": variant_id,
        "input": [
            {
                "channelId": get_channel_id(),
                "price": 0,
            }
        ]
    }

    data = gql(PUBLISH_VARIANT, variables)
    result = data.get("productVariantChannelListingUpdate", {})
    errors = result.get("errors", [])

    if errors:
        print(f"  ✗ {product_name} / {variant_sku}: {errors}")
    else:
        print(f"  ✓ {product_name} / {variant_sku}")


# ─── MAIN ─────────────────────────────────────────────────────

if __name__ == "__main__":
    print("🚀 Publicando variantes en", CHANNEL_SLUG)
    print("="*50)

    print("\n📡 Verificando canal...")
    get_channel_id()

    print()
    variantes = get_all_variants()

    print(f"\n📢 Publicando {len(variantes)} variantes con precio 0...")
    for variante in variantes:
        publish_variant(
            variante["id"],
            variante["sku"],
            variante["product"]["name"]
        )
        time.sleep(0.1)

    print("\n🎉 Listo — todas las variantes publicadas en", CHANNEL_SLUG)