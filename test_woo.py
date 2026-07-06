import os
from dotenv import load_dotenv
import requests
from requests.auth import HTTPBasicAuth
import urllib3
import json

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
load_dotenv()

base = os.getenv('WC_BASE_URL') + '/wp-json/wc/v3'
auth = HTTPBasicAuth(os.getenv('WC_KEY'), os.getenv('WC_SECRET'))

# Buscar la camiseta por SKU
r = requests.get(f"{base}/products?sku=CAM-CORP", auth=auth, verify=False)
productos = r.json()
if not productos:
    print("✗ No se encontró el producto con SKU CAM-CORP")
else:
    p = productos[0]
    print(f"Producto: {p['name']} (id {p['id']})")
    print("Meta data:")
    for m in p.get('meta_data', []):
        print(f"  - {m['key']}: {m['value']}")