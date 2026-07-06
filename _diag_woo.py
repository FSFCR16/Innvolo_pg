# -*- coding: utf-8 -*-
import os, json, sys
sys.stdout.reconfigure(encoding="utf-8")
from dotenv import load_dotenv
import requests
from requests.auth import HTTPBasicAuth
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
load_dotenv()
BASE = os.getenv("WC_BASE_URL") + "/wp-json/wc/v3"
AUTH = HTTPBasicAuth(os.getenv("WC_KEY"), os.getenv("WC_SECRET"))
print("BASE:", BASE)
try:
    r = requests.get(f"{BASE}/products", params={"per_page": 1}, auth=AUTH, verify=False, timeout=20)
    print("conectividad products:", r.status_code)
except Exception as e:
    print("ERROR conexion:", e); sys.exit(1)

r = requests.get(f"{BASE}/products/13", auth=AUTH, verify=False, timeout=20)
p = r.json()
print("\n=== PRODUCTO 13 ===")
print("name:", p.get("name"), "| slug:", p.get("slug"), "| type:", p.get("type"), "| sku:", p.get("sku"))
print("regular_price:", p.get("regular_price"), "| price:", p.get("price"))
print("categories:", [(c['id'], c['name']) for c in p.get("categories", [])])
print("images count:", len(p.get("images", [])))
for img in p.get("images", []):
    print("   IMG:", img.get("id"), img.get("src"))
print("meta keys (no _):", [m['key'] for m in p.get("meta_data", []) if not m['key'].startswith('_')])
print("meta keys (con _):", [m['key'] for m in p.get("meta_data", []) if m['key'].startswith('_')][:15])
print("attributes:", [(a['name'], a.get('variation'), a.get('options')) for a in p.get("attributes", [])])
rv = requests.get(f"{BASE}/products/13/variations", params={"per_page": 2}, auth=AUTH, verify=False, timeout=20)
vs = rv.json()
print("\nvariations page1:", len(vs))
if vs:
    print("var0: id", vs[0]['id'], "sku", vs[0].get('sku'), "price", vs[0].get('regular_price'), "attrs", vs[0].get('attributes'))

# Test media endpoint (wp/v2) con WC keys
WPBASE = os.getenv("WC_BASE_URL") + "/wp-json/wp/v2"
try:
    rm = requests.get(f"{WPBASE}/media", params={"per_page": 1}, auth=AUTH, verify=False, timeout=20)
    print("\nwp/v2/media GET status:", rm.status_code)
    # probar POST vacio para ver si autoriza (deberia dar 400 por falta de archivo si autoriza, 401 si no)
    rp = requests.post(f"{WPBASE}/media", auth=AUTH, verify=False, timeout=20,
                       headers={"Content-Disposition": 'attachment; filename="test.png"'})
    print("wp/v2/media POST (sin archivo) status:", rp.status_code, "->", str(rp.json().get('code') if rp.headers.get('content-type','').startswith('application/json') else rp.text[:80]))
except Exception as e:
    print("media test error:", e)
