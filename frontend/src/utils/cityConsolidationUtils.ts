/**
 * City Mapping & Consolidation Utility
 * Maps regional terminals, satellite rail yards, and container sub-points to consolidated market hubs.
 * Always applied when new load data and lanes are ingested or uploaded.
 */

export const CITY_CONSOLIDATION_MAPPING: Record<string, string> = {
  // Los Angeles / Long Beach (LA/LB) Hub
  'san pedro': 'LA/LB',
  'wilmington': 'LA/LB',
  'los angeles': 'LA/LB',
  'long beach': 'LA/LB',
  'terminal island': 'LA/LB',
  'la/lb': 'LA/LB',
  'la / lb': 'LA/LB',
  'lalb': 'LA/LB',
  'la': 'LA/LB',
  'lb': 'LA/LB',

  // Houston Hub
  'seabrook': 'Houston',
  'houston': 'Houston',
  'morgans point': 'Houston',
  'morgan point': 'Houston',
  'morgans pt': 'Houston',
  'pasadena': 'Houston',
  'la porte': 'Houston',
  'laporte': 'Houston',

  // Dallas Hub
  'haslet': 'Dallas',
  'dallas': 'Dallas',
  'wilmer': 'Dallas',
  'wylie': 'Dallas',
  'fort worth': 'Dallas',
  'ft worth': 'Dallas',
  'ft. worth': 'Dallas',
  'hutchins': 'Dallas',
  'mesquite': 'Dallas',

  // New York / New Jersey (NY/NJ) Hub
  'elizabeth': 'NY/NJ',
  'jersey city': 'NY/NJ',
  'newark': 'NY/NJ',
  'bayonne': 'NY/NJ',
  'staten island': 'NY/NJ',
  'ny/nj': 'NY/NJ',
  'ny / nj': 'NY/NJ',
  'nynj': 'NY/NJ',

  // Chicago Hub
  'chicago': 'Chicago',
  'elwood': 'Chicago',
  'franklin park': 'Chicago',
  'harvey': 'Chicago',
  'joliet': 'Chicago',
  'north chicago': 'Chicago',
  'n chicago': 'Chicago',
  'schiller park': 'Chicago',

  // Savannah Hub
  'garden city': 'Savannah',
  'savannah': 'Savannah',

  // Norfolk Hub
  'norfolk': 'Norfolk',
  'portsmouth': 'Norfolk',

  // San Antonio Hub
  'van ormy': 'San Antonio',
  'van ormy tx': 'San Antonio',
  'san antonio': 'San Antonio',

  // Charleston Hub
  'mount pleasant': 'Charleston',
  'mt pleasant': 'Charleston',
  'mt. pleasant': 'Charleston',
  'north charleston': 'Charleston',
  'n charleston': 'Charleston',
  'charleston': 'Charleston',

  // Miami Hub
  'port everglades': 'Miami',
  'fort lauderdale': 'Miami',
  'ft lauderdale': 'Miami',
  'ft. lauderdale': 'Miami',
  'miami': 'Miami',

  // Atlanta Hub
  'austell': 'Atlanta',
  'fairburn': 'Atlanta',
  'atlanta': 'Atlanta'
};

/**
 * Returns consolidated city name if mapped, or clean title-cased city if not mapped.
 */
export function getConsolidatedCity(cityRaw: string): string {
  if (!cityRaw) return '';
  const clean = cityRaw.trim().replace(/[^\w\s/]/g, '').toLowerCase();
  
  if (CITY_CONSOLIDATION_MAPPING[clean]) {
    return CITY_CONSOLIDATION_MAPPING[clean];
  }

  // Check without trailing punctuation or state abbreviation
  for (const [key, consolidated] of Object.entries(CITY_CONSOLIDATION_MAPPING)) {
    if (clean === key || clean.startsWith(`${key} `) || clean.endsWith(` ${key}`)) {
      return consolidated;
    }
  }

  return cityRaw.trim();
}

/**
 * Consolidates a location string (e.g., "SAN PEDRO, CA" -> "LA/LB, CA", "Haslet, TX" -> "Dallas, TX").
 * Preserves the state code if present.
 */
export function consolidateLocationString(locationRaw: string, stateOverride?: string): string {
  if (!locationRaw) return '';
  const trimmed = locationRaw.trim();

  let cityPart = trimmed;
  let statePart = stateOverride ? stateOverride.trim().toUpperCase() : '';

  if (trimmed.includes(',')) {
    const parts = trimmed.split(',');
    cityPart = parts[0].trim();
    if (!statePart && parts.length > 1) {
      statePart = parts[1].trim().toUpperCase();
    }
  } else if (trimmed.includes('/')) {
    // Check if it's already "LA/LB" or "NY/NJ"
    const lower = trimmed.toLowerCase();
    if (lower === 'la/lb' || lower === 'ny/nj') {
      return statePart ? `${trimmed.toUpperCase()}, ${statePart}` : trimmed.toUpperCase();
    }
  }

  const lookupKey = cityPart.toLowerCase().replace(/[^\w\s/]/g, '').trim();
  const consolidated = CITY_CONSOLIDATION_MAPPING[lookupKey] || cityPart;

  if (statePart) {
    return `${consolidated}, ${statePart}`;
  }
  return consolidated;
}
