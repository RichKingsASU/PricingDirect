import React, { useMemo } from 'react';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import usAtlas from 'us-atlas/states-10m.json';
import { Region } from '../types';

interface USAMapSVGProps {
  selectedRegion: Region;
}

// FIPS Code to State Code & Regions Mapping
const STATE_REGIONS: Record<string, { code: string; regions: Region[] }> = {
  '01': { code: 'AL', regions: ['SE'] },
  '02': { code: 'AK', regions: ['NW'] },
  '04': { code: 'AZ', regions: ['SW'] },
  '05': { code: 'AR', regions: ['SE'] },
  '06': { code: 'CA', regions: ['NW', 'SW'] }, // Oakland (NW), LA/LB (SW)
  '08': { code: 'CO', regions: ['NW'] },
  '09': { code: 'CT', regions: ['NE'] },
  '10': { code: 'DE', regions: ['NE'] },
  '11': { code: 'DC', regions: ['NE'] },
  '12': { code: 'FL', regions: ['SE'] },
  '13': { code: 'GA', regions: ['SE'] },
  '15': { code: 'HI', regions: ['SW'] },
  '16': { code: 'ID', regions: ['NW'] },
  '17': { code: 'IL', regions: ['NE'] },
  '18': { code: 'IN', regions: ['NE'] },
  '19': { code: 'IA', regions: ['NE'] },
  '20': { code: 'KS', regions: ['NE'] },
  '21': { code: 'KY', regions: ['NE'] },
  '22': { code: 'LA', regions: ['SE'] },
  '23': { code: 'ME', regions: ['NE'] },
  '24': { code: 'MD', regions: ['NE'] },
  '25': { code: 'MA', regions: ['NE'] },
  '26': { code: 'MI', regions: ['NE'] },
  '27': { code: 'MN', regions: ['NE'] },
  '28': { code: 'MS', regions: ['SE'] },
  '29': { code: 'MO', regions: ['NE'] },
  '30': { code: 'MT', regions: ['NW'] },
  '31': { code: 'NE', regions: ['NE'] },
  '32': { code: 'NV', regions: ['NW', 'SW'] }, // Reno (NW), Las Vegas (SW)
  '33': { code: 'NH', regions: ['NE'] },
  '34': { code: 'NJ', regions: ['NE'] },
  '35': { code: 'NM', regions: ['SW'] },
  '36': { code: 'NY', regions: ['NE'] },
  '37': { code: 'NC', regions: ['SE'] },
  '38': { code: 'ND', regions: ['NE'] },
  '39': { code: 'OH', regions: ['NE'] },
  '40': { code: 'OK', regions: ['SE'] },
  '41': { code: 'OR', regions: ['NW'] },
  '42': { code: 'PA', regions: ['NE'] },
  '44': { code: 'RI', regions: ['NE'] },
  '45': { code: 'SC', regions: ['SE'] },
  '46': { code: 'SD', regions: ['NE'] },
  '47': { code: 'TN', regions: ['SE'] },
  '48': { code: 'TX', regions: ['SE'] },
  '49': { code: 'UT', regions: ['NW'] },
  '50': { code: 'VT', regions: ['NE'] },
  '51': { code: 'VA', regions: ['NE'] },
  '53': { code: 'WA', regions: ['NW'] },
  '54': { code: 'WV', regions: ['NE'] },
  '55': { code: 'WI', regions: ['NE'] },
  '56': { code: 'WY', regions: ['NW'] }
};

// City coordinates (Longitude, Latitude) for exact geoAlbersUsa projection
export const CITY_COORDINATES: Record<string, [number, number]> = {
  'mkt-seattle': [-122.3321, 47.6062],
  'mkt-portland': [-122.6784, 45.5152],
  'mkt-boise': [-116.2023, 43.6150],
  'mkt-oakland': [-122.2712, 37.8044],
  'mkt-reno': [-119.8138, 39.5296],
  'mkt-saltlake': [-111.8910, 40.7608],
  'mkt-denver': [-104.9903, 39.7392],
  'mkt-losangeles': [-118.2437, 34.0522],
  'mkt-lasvegas': [-115.1398, 36.1699],
  'mkt-phoenix': [-112.0740, 33.4484],
  'mkt-chicago': [-87.6298, 41.8781],
  'mkt-newyork': [-74.0060, 40.7128],
  'mkt-baltimore': [-76.6122, 39.2904],
  'mkt-norfolk': [-76.2859, 36.8508],
  'mkt-dallas': [-96.7970, 32.7767],
  'mkt-houston': [-95.3698, 29.7604],
  'mkt-charleston': [-79.9311, 32.7765],
  'mkt-savannah': [-81.0998, 32.0809],
  'mkt-atlanta': [-84.3880, 33.7490],
  'mkt-miami': [-80.1918, 25.7617]
};

// Create standard projection matching 960x600 viewBox
export const getAlbersProjection = () => {
  return geoAlbersUsa()
    .scale(1080)
    .translate([480, 270]);
};

export const USAMapSVG: React.FC<USAMapSVGProps> = ({ selectedRegion }) => {
  const projection = useMemo(() => getAlbersProjection(), []);
  const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

  // Convert TopoJSON to GeoJSON features
  const stateFeatures = useMemo(() => {
    // @ts-expect-error topojson features type helper
    const geoData = feature(usAtlas, usAtlas.objects.states);
    // @ts-expect-error features list
    return geoData.features || [];
  }, []);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      viewBox="0 0 960 560"
      preserveAspectRatio="xMidYMid meet"
    >
      <g>
        {stateFeatures.map((feat: { id: string }) => {
          const pathD = pathGenerator(feat as unknown as Parameters<typeof pathGenerator>[0]);
          if (!pathD) return null;

          const fips = String(feat.id).padStart(2, '0');
          const meta = STATE_REGIONS[fips];
          const isSelectedRegion =
            selectedRegion === 'USA' || (meta ? meta.regions.includes(selectedRegion) : false);

          return (
            <path
              key={feat.id}
              d={pathD}
              fill={isSelectedRegion ? '#CBD5E1' : '#E2E8F0'}
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinejoin="round"
              opacity={isSelectedRegion ? 1 : 0.45}
              className="transition-colors duration-200"
            />
          );
        })}

        {/* Alaska and Hawaii inset border divider lines (standard Albers USA layout) */}
        <path
          d="M 220 440 L 220 540 M 220 490 L 320 490 M 320 490 L 320 540"
          stroke="#CBD5E1"
          strokeWidth="1"
          fill="none"
          opacity="0.8"
        />
      </g>
    </svg>
  );
};
