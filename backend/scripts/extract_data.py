import re
import os

with open('src/data/targetMasterData.ts', 'r') as f:
    content = f.read()

system_targets = re.findall(r'\{.*targetCarrierPay: \d+ \}', content)

with open('pricing/services/target_master_data.py', 'w') as f:
    f.write('CITY_CONSOLIDATION_MAP = {\n')
    map_items = re.findall(r'\'(.*?)\': \'(.*?)\',?', content)
    for k, v in map_items:
        if k and v:
            f.write(f'    \"{k}\": \"{v}\",\n')
    f.write('}\n\n')
    f.write('def consolidate_city(city):\n')
    f.write('    if not city: return city\n')
    f.write('    clean = city.strip().lower()\n')
    f.write('    return CITY_CONSOLIDATION_MAP.get(clean, city.strip())\n\n')
    
    f.write('SYSTEM_TARGET_RATES = [\n')
    for t in system_targets:
        d = t.replace('laneName:', '\"laneName\":').replace('pickupCity:', '\"pickupCity\":').replace('deliveryCity:', '\"deliveryCity\":').replace('pickupState:', '\"pickupState\":').replace('pickupRegion:', '\"pickupRegion\":').replace('deliveryState:', '\"deliveryState\":').replace('dropRegion:', '\"dropRegion\":').replace('targetCarrierPay:', '\"targetCarrierPay\":')
        # Replace single quotes with double quotes
        d = d.replace("'", '"')
        f.write(f'    {d},\n')
    f.write(']\n\n')
    
    f.write('def get_system_target_pay(pickup_city, delivery_city):\n')
    f.write('    if not pickup_city or not delivery_city: return None\n')
    f.write('    cons_pickup = consolidate_city(pickup_city).lower()\n')
    f.write('    cons_drop = consolidate_city(delivery_city).lower()\n')
    f.write('    for t in SYSTEM_TARGET_RATES:\n')
    f.write('        if (t[\"pickupCity\"].lower() == cons_pickup or t[\"pickupCity\"].lower() == pickup_city.lower()) and \\\n')
    f.write('           (t[\"deliveryCity\"].lower() == cons_drop or t[\"deliveryCity\"].lower() == delivery_city.lower()):\n')
    f.write('            return t[\"targetCarrierPay\"]\n')
    f.write('    return None\n')
