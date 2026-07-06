# -*- coding: utf-8 -*-
import os, sys
sys.stdout.reconfigure(encoding="utf-8")
from dotenv import load_dotenv
import requests
from requests.auth import HTTPBasicAuth
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
load_dotenv()
BASE = os.getenv("WC_BASE_URL") + "/wp-json/wc/v3"
AUTH = HTTPBasicAuth(os.getenv("WC_KEY"), os.getenv("WC_SECRET"))

def get(pid):
    p = requests.get(f"{BASE}/products/{pid}", auth=AUTH, verify=False, timeout=20).json()
    meta = {m['key']: m['value'] for m in p['meta_data'] if not m['key'].startswith('_')}
    print(f"\n[{pid}] {p['name']} | slug:{p['slug']} | type:{p['type']} | price:{p.get('price')} | imgs:{len(p['images'])}")
    print("    precios:", {k: meta.get(k) for k in ('precio_20','precio_50','precio_100','precio_500')})
    print("    tecnica:", meta.get('tecnica_recomendada'), "| materiales:", str(meta.get('materiales'))[:40])
    print("    colores:", str(meta.get('colores_disponibles'))[:55], "| tipo_3d:", meta.get('tipo_3d'), "| model_3d_url:", (meta.get('model_3d_url') or '(vacio)')[:35])

# conteo total de productos publicados
r = requests.get(f"{BASE}/products", params={"per_page":1,"status":"publish"}, auth=AUTH, verify=False, timeout=20)
print("TOTAL productos publicados (X-WP-Total):", r.headers.get("X-WP-Total"))
for pid in (13, 354, 371, 388, 405, 108):
    get(pid)
