// Master City Consolidation Mapping and System Target Rates from Forrest Logistics System Data

export interface CityMapping {
  rawCity: string;
  consolidatedCity: string;
}

export const CITY_CONSOLIDATION_MAP: Record<string, string> = {
  'san pedro': 'LA/LB',
  'wilmington': 'LA/LB',
  'los angeles': 'LA/LB',
  'long beach': 'LA/LB',
  'terminal island': 'LA/LB',
  'seabrook': 'Houston',
  'houston': 'Houston',
  'morgans point': 'Houston',
  'pasadena': 'Houston',
  'la porte': 'Houston',
  'haslet': 'Dallas',
  'dallas': 'Dallas',
  'wilmer': 'Dallas',
  'wylie': 'Dallas',
  'fort worth': 'Dallas',
  'hutchins': 'Dallas',
  'mesquite': 'Dallas',
  'elizabeth': 'NY/NJ',
  'jersey city': 'NY/NJ',
  'newark': 'NY/NJ',
  'bayonne': 'NY/NJ',
  'staten island': 'NY/NJ',
  'chicago': 'Chicago',
  'elwood': 'Chicago',
  'franklin park': 'Chicago',
  'harvey': 'Chicago',
  'joliet': 'Chicago',
  'north chicago': 'Chicago',
  'schiller park': 'Chicago',
  'garden city': 'Savannah',
  'savannah': 'Savannah',
  'norfolk': 'Norfolk',
  'portsmouth': 'Norfolk',
  'van ormy': 'San Antonio',
  'san antonio': 'San Antonio',
  'mount pleasant': 'Charleston',
  'north charleston': 'Charleston',
  'port everglades': 'Miami',
  'fort lauderdale': 'Miami',
  'austell': 'Atlanta',
  'fairburn': 'Atlanta'
};

export function consolidateCity(city: string): string {
  if (!city) return city;
  const clean = city.trim().toLowerCase();
  return CITY_CONSOLIDATION_MAP[clean] || city.trim();
}

export interface TargetRateItem {
  laneName: string;
  pickupCity: string;
  deliveryCity: string;
  pickupState: string;
  pickupRegion: string;
  deliveryState: string;
  dropRegion: string;
  targetCarrierPay: number;
}

export const SYSTEM_TARGET_RATES: TargetRateItem[] = [
  { laneName: 'LA/LB to SHAFTER', pickupCity: 'LA/LB', deliveryCity: 'Shafter', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 825 },
  { laneName: 'TACOMA to BRIGHTON', pickupCity: 'Tacoma', deliveryCity: 'Brighton', pickupState: 'WA', pickupRegion: 'NW', deliveryState: 'CO', dropRegion: 'NW', targetCarrierPay: 6900 },
  { laneName: 'LA/LB to LAS VEGAS', pickupCity: 'LA/LB', deliveryCity: 'LAS VEGAS', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'NV', dropRegion: 'SW', targetCarrierPay: 1150 },
  { laneName: 'LA/LB to LA/LB', pickupCity: 'LA/LB', deliveryCity: 'LA/LB', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 250 },
  { laneName: 'LA/LB to NOGALES', pickupCity: 'LA/LB', deliveryCity: 'NOGALES', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'AZ', dropRegion: 'SW', targetCarrierPay: 2100 },
  { laneName: 'LA/LB to JURUPA VALLEY', pickupCity: 'LA/LB', deliveryCity: 'JURUPA VALLEY', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 375 },
  { laneName: 'LA/LB to SAN BERNARDINO', pickupCity: 'LA/LB', deliveryCity: 'SAN BERNARDINO', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 450 },
  { laneName: 'LA/LB to PHOENIX', pickupCity: 'LA/LB', deliveryCity: 'PHOENIX', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'AZ', dropRegion: 'SW', targetCarrierPay: 1450 },
  { laneName: 'CHARLESTON to ROCK HILL', pickupCity: 'Charleston', deliveryCity: 'Rock Hill', pickupState: 'SC', pickupRegion: 'SE', deliveryState: 'SC', dropRegion: 'SE', targetCarrierPay: 750 },
  { laneName: 'OAKLAND to STOCKTON', pickupCity: 'OAKLAND', deliveryCity: 'STOCKTON', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 545 },
  { laneName: 'LA/LB to SANTA FE SPRINGS', pickupCity: 'LA/LB', deliveryCity: 'Santa Fe Springs', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 275 },
  { laneName: 'LA/LB to HENDERSON', pickupCity: 'LA/LB', deliveryCity: 'HENDERSON', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'NV', dropRegion: 'SW', targetCarrierPay: 1150 },
  { laneName: 'LA/LB to BUCKEYE', pickupCity: 'LA/LB', deliveryCity: 'Buckeye', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'AZ', dropRegion: 'SW', targetCarrierPay: 1450 },
  { laneName: 'SEATTLE to OLYMPIA', pickupCity: 'SEATTLE', deliveryCity: 'Olympia', pickupState: 'WA', pickupRegion: 'NW', deliveryState: 'WA', dropRegion: 'NW', targetCarrierPay: 400 },
  { laneName: 'LA/LB to POMONA', pickupCity: 'LA/LB', deliveryCity: 'POMONA', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 390 },
  { laneName: 'LA/LB to PERRIS', pickupCity: 'LA/LB', deliveryCity: 'Perris', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 475 },
  { laneName: 'SAVANNAH to FAIRBURN', pickupCity: 'Savannah', deliveryCity: 'Fairburn', pickupState: 'GA', pickupRegion: 'SE', deliveryState: 'GA', dropRegion: 'SE', targetCarrierPay: 900 },
  { laneName: 'HUBBARD to PORTLAND', pickupCity: 'Hubbard', deliveryCity: 'Portland', pickupState: 'OR', pickupRegion: 'NW', deliveryState: 'OR', dropRegion: 'NW', targetCarrierPay: 1000 },
  { laneName: 'SAVANNAH to ROCK HILL', pickupCity: 'Savannah', deliveryCity: 'Rock Hill', pickupState: 'GA', pickupRegion: 'SE', deliveryState: 'SC', dropRegion: 'SE', targetCarrierPay: 825 },
  { laneName: 'LA/LB to VICTORVILLE', pickupCity: 'LA/LB', deliveryCity: 'VICTORVILLE', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 550 },
  { laneName: 'LA/LB to SURPRISE', pickupCity: 'LA/LB', deliveryCity: 'SURPRISE', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'AZ', dropRegion: 'SW', targetCarrierPay: 1450 },
  { laneName: 'BAKERSFIELD to LA/LB', pickupCity: 'BAKERSFIELD', deliveryCity: 'LA/LB', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 400 },
  { laneName: 'LA/LB to FONTANA', pickupCity: 'LA/LB', deliveryCity: 'FONTANA', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 375 },
  { laneName: 'TOLLESON to LA/LB', pickupCity: 'Tolleson', deliveryCity: 'LA/LB', pickupState: 'AZ', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 1450 },
  { laneName: 'LA/LB to TEMPE', pickupCity: 'LA/LB', deliveryCity: 'TEMPE', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'AZ', dropRegion: 'SW', targetCarrierPay: 1475 },
  { laneName: 'OAKLAND to SPARKS', pickupCity: 'Oakland', deliveryCity: 'SPARKS', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'NV', dropRegion: 'NW', targetCarrierPay: 1200 },
  { laneName: 'OAKLAND to HOLLISTER', pickupCity: 'OAKLAND', deliveryCity: 'Hollister', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 670 },
  { laneName: 'LA/LB to HESPERIA', pickupCity: 'LA/LB', deliveryCity: 'Hesperia', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 475 },
  { laneName: 'FRESNO to LA/LB', pickupCity: 'Fresno', deliveryCity: 'LA/LB', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 600 },
  { laneName: 'OAKLAND to RENO', pickupCity: 'OAKLAND', deliveryCity: 'RENO', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'NV', dropRegion: 'NW', targetCarrierPay: 1200 },
  { laneName: 'LA/LB to ONTARIO', pickupCity: 'LA/LB', deliveryCity: 'Ontario', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 365 },
  { laneName: 'LAS VEGAS to LA/LB', pickupCity: 'LAS VEGAS', deliveryCity: 'LA/LB', pickupState: 'NV', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 1150 },
  { laneName: 'LA/LB to COMMERCE', pickupCity: 'LA/LB', deliveryCity: 'COMMERCE', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 275 },
  { laneName: 'LA/LB to NORTH LAS VEGAS', pickupCity: 'LA/LB', deliveryCity: 'NORTH LAS VEGAS', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'NV', dropRegion: 'SW', targetCarrierPay: 1150 },
  { laneName: 'MESA to LA/LB', pickupCity: 'MESA', deliveryCity: 'LA/LB', pickupState: 'AZ', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 1500 },
  { laneName: 'LA/LB to RIVERSIDE', pickupCity: 'LA/LB', deliveryCity: 'RIVERSIDE', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 375 },
  { laneName: 'TACOMA to OLYMPIA', pickupCity: 'Tacoma', deliveryCity: 'Olympia', pickupState: 'WA', pickupRegion: 'NW', deliveryState: 'WA', dropRegion: 'NW', targetCarrierPay: 325 },
  { laneName: 'SAVANNAH to FORT MILL', pickupCity: 'Savannah', deliveryCity: 'Fort Mill', pickupState: 'GA', pickupRegion: 'SE', deliveryState: 'SC', dropRegion: 'SE', targetCarrierPay: 825 },
  { laneName: 'SEATTLE to LAKEWOOD', pickupCity: 'Seattle', deliveryCity: 'Lakewood', pickupState: 'WA', pickupRegion: 'NW', deliveryState: 'WA', dropRegion: 'NW', targetCarrierPay: 350 },
  { laneName: 'LA/LB to CHANDLER', pickupCity: 'LA/LB', deliveryCity: 'CHANDLER', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'AZ', dropRegion: 'SW', targetCarrierPay: 1500 },
  { laneName: 'LA/LB to CORONA', pickupCity: 'LA/LB', deliveryCity: 'CORONA', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 365 },
  { laneName: 'NY/NJ to CRANBURY', pickupCity: 'NY/NJ', deliveryCity: 'CRANBURY', pickupState: 'NJ', pickupRegion: 'NE', deliveryState: 'NJ', dropRegion: 'NE', targetCarrierPay: 545 },
  { laneName: 'LA/LB to RIALTO', pickupCity: 'LA/LB', deliveryCity: 'Rialto', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 400 },
  { laneName: 'CHARLESTON to FORT MILL', pickupCity: 'Charleston', deliveryCity: 'Fort Mill', pickupState: 'SC', pickupRegion: 'SE', deliveryState: 'SC', dropRegion: 'SE', targetCarrierPay: 750 },
  { laneName: 'OAKLAND to AMERICAN CANYON', pickupCity: 'OAKLAND', deliveryCity: 'AMERICAN CANYON', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 375 },
  { laneName: 'SAN BERNARDINO to LA/LB', pickupCity: 'SAN BERNARDINO', deliveryCity: 'LA/LB', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 450 },
  { laneName: 'SAVANNAH to WHITE', pickupCity: 'SAVANNAH', deliveryCity: 'WHITE', pickupState: 'GA', pickupRegion: 'SE', deliveryState: 'GA', dropRegion: 'SE', targetCarrierPay: 1200 },
  { laneName: 'HUTCHINS to MCKINNEY', pickupCity: 'HUTCHINS', deliveryCity: 'MCKINNEY', pickupState: 'TX', pickupRegion: 'SE', deliveryState: 'TX', dropRegion: 'SE', targetCarrierPay: 325 },
  { laneName: 'SANTA FE SPRINGS to LA/LB', pickupCity: 'SANTA FE SPRINGS', deliveryCity: 'LA/LB', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 275 },
  { laneName: 'SALT LAKE CITY to GRANTSVILLE', pickupCity: 'SALT LAKE CITY', deliveryCity: 'GRANTSVILLE', pickupState: 'UT', pickupRegion: 'NW', deliveryState: 'UT', dropRegion: 'NW', targetCarrierPay: 275 },
  { laneName: 'LA/LB to CHINO', pickupCity: 'LA/LB', deliveryCity: 'CHINO', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 365 },
  { laneName: 'LA/LB to GOODYEAR', pickupCity: 'LA/LB', deliveryCity: 'GOODYEAR', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'AZ', dropRegion: 'SW', targetCarrierPay: 1450 },
  { laneName: 'LA/LB to LAREDO', pickupCity: 'LA/LB', deliveryCity: 'Laredo', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'TX', dropRegion: 'SE', targetCarrierPay: 5900 },
  { laneName: 'LA/LB to MESA', pickupCity: 'LA/LB', deliveryCity: 'MESA', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'AZ', dropRegion: 'SW', targetCarrierPay: 1500 },
  { laneName: 'OAKLAND to WEST SACRAMENTO', pickupCity: 'Oakland', deliveryCity: 'West Sacramento', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 585 },
  { laneName: 'SEATTLE to TACOMA', pickupCity: 'SEATTLE', deliveryCity: 'Tacoma', pickupState: 'WA', pickupRegion: 'NW', deliveryState: 'WA', dropRegion: 'NW', targetCarrierPay: 375 },
  { laneName: 'TURLOCK to OAKLAND', pickupCity: 'Turlock', deliveryCity: 'Oakland', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 585 },
  { laneName: 'LA/LB to RANCHO CUCAMONGA', pickupCity: 'LA/LB', deliveryCity: 'RANCHO CUCAMONGA', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 375 },
  { laneName: 'LOUISVILLE to LEXINGTON', pickupCity: 'LOUISVILLE', deliveryCity: 'LEXINGTON', pickupState: 'KY', pickupRegion: 'NE', deliveryState: 'KY', dropRegion: 'NE', targetCarrierPay: 540 },
  { laneName: 'LA/LB to SAN DIEGO', pickupCity: 'LA/LB', deliveryCity: 'SAN DIEGO', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 575 },
  { laneName: 'PHOENIX to LA/LB', pickupCity: 'Phoenix', deliveryCity: 'LA/LB', pickupState: 'AZ', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 1450 },
  { laneName: 'LA/LB to FULLERTON', pickupCity: 'LA/LB', deliveryCity: 'FULLERTON', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 300 },
  { laneName: 'VICTORVILLE to LA/LB', pickupCity: 'VICTORVILLE', deliveryCity: 'LA/LB', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 550 },
  { laneName: 'LA/LB to MIRA LOMA', pickupCity: 'LA/LB', deliveryCity: 'MIRA LOMA', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 375 },
  { laneName: 'LOUISVILLE to LOUISVILLE', pickupCity: 'LOUISVILLE', deliveryCity: 'LOUISVILLE', pickupState: 'KY', pickupRegion: 'NE', deliveryState: 'KY', dropRegion: 'NE', targetCarrierPay: 285 },
  { laneName: 'EASTVALE to LA/LB', pickupCity: 'Eastvale', deliveryCity: 'LA/LB', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 365 },
  { laneName: 'LA/LB to FRESNO', pickupCity: 'LA/LB', deliveryCity: 'FRESNO', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 950 },
  { laneName: 'PORT OF HOUSTON to ARLINGTON', pickupCity: 'Port of Houston', deliveryCity: 'ARLINGTON', pickupState: 'TX', pickupRegion: 'SE', deliveryState: 'TX', dropRegion: 'SE', targetCarrierPay: 1000 },
  { laneName: 'LA/LB to MORENO VALLEY', pickupCity: 'LA/LB', deliveryCity: 'Moreno Valley', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 475 },
  { laneName: 'LA/LB to BEAUMONT', pickupCity: 'LA/LB', deliveryCity: 'BEAUMONT', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 465 },
  { laneName: 'LA/LB to REDLANDS', pickupCity: 'LA/LB', deliveryCity: 'Redlands', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 440 },
  { laneName: 'SEATTLE to WALLA WALLA', pickupCity: 'SEATTLE', deliveryCity: 'WALLA WALLA', pickupState: 'WA', pickupRegion: 'NW', deliveryState: 'WA', dropRegion: 'NW', targetCarrierPay: 1300 },
  { laneName: 'LA/LB to WADDELL', pickupCity: 'LA/LB', deliveryCity: 'WADDELL', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'AZ', dropRegion: 'SW', targetCarrierPay: 1450 },
  { laneName: 'FONTANA to LA/LB', pickupCity: 'Fontana', deliveryCity: 'LA/LB', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 375 },
  { laneName: 'LA/LB to SPARKS', pickupCity: 'LA/LB', deliveryCity: 'SPARKS', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'NV', dropRegion: 'NW', targetCarrierPay: 2000 },
  { laneName: 'BENICIA to OAKLAND', pickupCity: 'BENICIA', deliveryCity: 'Oakland', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 395 },
  { laneName: 'SAVANNAH to ATLANTA', pickupCity: 'SAVANNAH', deliveryCity: 'ATLANTA', pickupState: 'GA', pickupRegion: 'SE', deliveryState: 'GA', dropRegion: 'SE', targetCarrierPay: 900 },
  { laneName: 'HENDERSON to LA/LB', pickupCity: 'HENDERSON', deliveryCity: 'LA/LB', pickupState: 'NV', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 1150 },
  { laneName: 'LA/LB to TUCSON', pickupCity: 'LA/LB', deliveryCity: 'TUCSON', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'AZ', dropRegion: 'SW', targetCarrierPay: 1700 },
  { laneName: 'MODESTO to OAKLAND', pickupCity: 'MODESTO', deliveryCity: 'OAKLAND', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 550 },
  { laneName: 'SONOMA to OAKLAND', pickupCity: 'SONOMA', deliveryCity: 'OAKLAND', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 475 },
  { laneName: 'LA/LB to SANTEE', pickupCity: 'LA/LB', deliveryCity: 'SANTEE', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'CA', dropRegion: 'SW', targetCarrierPay: 585 },
  { laneName: 'LA/LB to GILBERT', pickupCity: 'LA/LB', deliveryCity: 'GILBERT', pickupState: 'CA', pickupRegion: 'SW', deliveryState: 'AZ', dropRegion: 'SW', targetCarrierPay: 1500 },
  { laneName: 'OAKLAND to SACRAMENTO', pickupCity: 'Oakland', deliveryCity: 'SACRAMENTO', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 600 },
  { laneName: 'RIPON to OAKLAND', pickupCity: 'Ripon', deliveryCity: 'OAKLAND', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 550 },
  { laneName: 'OAKLAND to SAN JOSE', pickupCity: 'Oakland', deliveryCity: 'San Jose', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 425 },
  { laneName: 'OAKLAND to SANTA ROSA', pickupCity: 'OAKLAND', deliveryCity: 'Santa Rosa', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 500 },
  { laneName: 'CERES to OAKLAND', pickupCity: 'CERES', deliveryCity: 'OAKLAND', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 550 },
  { laneName: 'HERLONG to OAKLAND', pickupCity: 'HERLONG', deliveryCity: 'OAKLAND', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 1400 },
  { laneName: 'OAKLAND to PATTERSON', pickupCity: 'OAKLAND', deliveryCity: 'Patterson', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 650 },
  { laneName: 'OAKLAND to PETALUMA', pickupCity: 'OAKLAND', deliveryCity: 'PETALUMA', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 450 },
  { laneName: 'OAKLAND to BENICIA', pickupCity: 'OAKLAND', deliveryCity: 'BENICIA', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 380 },
  { laneName: 'OAKLAND to MORGAN HILL', pickupCity: 'Oakland', deliveryCity: 'MORGAN HILL', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 550 },
  { laneName: 'OAKLAND to MODESTO', pickupCity: 'OAKLAND', deliveryCity: 'Modesto', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 585 },
  { laneName: 'OAKLAND to WINDSOR', pickupCity: 'OAKLAND', deliveryCity: 'WINDSOR', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 550 },
  { laneName: 'OAKLAND to VACAVILLE', pickupCity: 'OAKLAND', deliveryCity: 'VACAVILLE', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 455 },
  { laneName: 'OAKLAND to FAIRFIELD', pickupCity: 'OAKLAND', deliveryCity: 'FAIRFIELD', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 425 },
  { laneName: 'OAKLAND to HAYWARD', pickupCity: 'OAKLAND', deliveryCity: 'Hayward', pickupState: 'CA', pickupRegion: 'NW', deliveryState: 'CA', dropRegion: 'NW', targetCarrierPay: 350 }
];

export function getSystemTargetPay(pickupCity: string, deliveryCity: string): number | null {
  const consPickup = consolidateCity(pickupCity);
  const consDrop = consolidateCity(deliveryCity);

  const found = SYSTEM_TARGET_RATES.find(
    (t) =>
      (t.pickupCity.toLowerCase() === consPickup.toLowerCase() || t.pickupCity.toLowerCase() === pickupCity.toLowerCase()) &&
      (t.deliveryCity.toLowerCase() === consDrop.toLowerCase() || t.deliveryCity.toLowerCase() === deliveryCity.toLowerCase())
  );

  return found ? found.targetCarrierPay : null;
}
