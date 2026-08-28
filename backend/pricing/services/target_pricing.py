import math

from .target_master_data import get_system_target_pay

def calculate_target_pay(miles: float, origin_city: str = None, destination_city: str = None) -> int:
    """
    Calculate the target carrier pay based on mileage and master system target rates.
    Legacy formula: max(350, round(320 + miles * 3.8)) or lookup.
    """
    if origin_city and destination_city:
        system_pay = get_system_target_pay(origin_city, destination_city)
        if system_pay is not None:
            return int(system_pay)

    if miles is None:
        miles = 0
    try:
        miles = float(miles)
    except ValueError:
        miles = 0
    if miles < 0:
        miles = 0
    
    return max(350, round(320 + miles * 3.8))

def calculate_total_billing(base_rate: float, fuel_surcharge_percent: float) -> float:
    """
    Calculate the total billing to customer including fuel surcharge.
    Legacy formula: Math.round((target * (1 + fuelSurchargePercent / 100)) * 100) / 100
    """
    if base_rate is None or base_rate < 0:
        base_rate = 0
    if fuel_surcharge_percent is None or fuel_surcharge_percent < 0:
        fuel_surcharge_percent = 0
        
    return round(float(base_rate) * (1 + float(fuel_surcharge_percent) / 100.0), 2)
