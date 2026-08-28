import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import usAtlas from 'us-atlas/states-10m.json';
import { Region, MarketSummary, LaneException } from '../types';
import {
  Search,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Navigation,
  Compass,
  MapPin,
  X,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';

export interface MarketLocation {
  id: string;
  name: string;
  shortName: string;
  region: Region;
  coords: [number, number]; // [Longitude, Latitude]
  state: string;
  hubType: 'Port & Rail' | 'Inland Rail Hub' | 'Border & Intermodal' | 'Metro Distribution';
  artery: string;
}

export const MARKET_LOCATIONS: Record<string, MarketLocation> = {
  // Northwest Region (NW)
  'mkt-oakland': { id: 'mkt-oakland', name: 'Oakland Market', shortName: 'Oakland', region: 'NW', coords: [-122.2712, 37.8044], state: 'CA', hubType: 'Port & Rail', artery: 'I-80 / I-880' },
  'mkt-seattle': { id: 'mkt-seattle', name: 'Seattle Market', shortName: 'Seattle', region: 'NW', coords: [-122.3321, 47.6062], state: 'WA', hubType: 'Port & Rail', artery: 'I-5 / I-90' },
  'mkt-portland': { id: 'mkt-portland', name: 'Portland Market', shortName: 'Portland', region: 'NW', coords: [-122.6784, 45.5152], state: 'OR', hubType: 'Port & Rail', artery: 'I-5 / I-84' },
  'mkt-boise': { id: 'mkt-boise', name: 'Boise Hub', shortName: 'Boise', region: 'NW', coords: [-116.2023, 43.6150], state: 'ID', hubType: 'Inland Rail Hub', artery: 'I-84' },
  'mkt-saltlake': { id: 'mkt-saltlake', name: 'Salt Lake City', shortName: 'Salt Lake City', region: 'NW', coords: [-111.8910, 40.7608], state: 'UT', hubType: 'Inland Rail Hub', artery: 'I-15 / I-80' },
  'mkt-reno': { id: 'mkt-reno', name: 'Reno Market', shortName: 'Reno', region: 'NW', coords: [-119.8138, 39.5296], state: 'NV', hubType: 'Metro Distribution', artery: 'I-80' },
  'mkt-denver': { id: 'mkt-denver', name: 'Denver Market', shortName: 'Denver', region: 'NW', coords: [-104.9903, 39.7392], state: 'CO', hubType: 'Inland Rail Hub', artery: 'I-25 / I-70' },

  // Southwest Region (SW)
  'mkt-losangeles': { id: 'mkt-losangeles', name: 'Los Angeles Market', shortName: 'LA/LB', region: 'SW', coords: [-118.2437, 34.0522], state: 'CA', hubType: 'Port & Rail', artery: 'I-710 / I-10' },
  'mkt-phoenix': { id: 'mkt-phoenix', name: 'Phoenix Hub', shortName: 'Phoenix', region: 'SW', coords: [-112.0740, 33.4484], state: 'AZ', hubType: 'Inland Rail Hub', artery: 'I-10 / I-17' },
  'mkt-lasvegas': { id: 'mkt-lasvegas', name: 'Las Vegas Market', shortName: 'Las Vegas', region: 'SW', coords: [-115.1398, 36.1699], state: 'NV', hubType: 'Metro Distribution', artery: 'I-15' },

  // Northeast Region (NE)
  'mkt-chicago': { id: 'mkt-chicago', name: 'Chicago Market', shortName: 'Chicago', region: 'NE', coords: [-87.6298, 41.8781], state: 'IL', hubType: 'Inland Rail Hub', artery: 'I-90 / I-55 / I-80' },
  'mkt-newyork': { id: 'mkt-newyork', name: 'New York Market', shortName: 'NY/NJ', region: 'NE', coords: [-74.0060, 40.7128], state: 'NY', hubType: 'Port & Rail', artery: 'I-95 / NJ Turnpike' },
  'mkt-baltimore': { id: 'mkt-baltimore', name: 'Baltimore Port', shortName: 'Baltimore', region: 'NE', coords: [-76.6122, 39.2904], state: 'MD', hubType: 'Port & Rail', artery: 'I-95 / I-695' },
  'mkt-norfolk': { id: 'mkt-norfolk', name: 'Norfolk Terminal', shortName: 'Norfolk', region: 'NE', coords: [-76.2859, 36.8508], state: 'VA', hubType: 'Port & Rail', artery: 'I-64' },

  // Southeast Region (SE)
  'mkt-atlanta': { id: 'mkt-atlanta', name: 'Atlanta Market', shortName: 'Atlanta', region: 'SE', coords: [-84.3880, 33.7490], state: 'GA', hubType: 'Inland Rail Hub', artery: 'I-75 / I-85 / I-20' },
  'mkt-savannah': { id: 'mkt-savannah', name: 'Savannah Terminal', shortName: 'Savannah', region: 'SE', coords: [-81.0998, 32.0809], state: 'GA', hubType: 'Port & Rail', artery: 'I-16 / I-95' },
  'mkt-charleston': { id: 'mkt-charleston', name: 'Charleston Port', shortName: 'Charleston', region: 'SE', coords: [-79.9311, 32.7765], state: 'SC', hubType: 'Port & Rail', artery: 'I-26 / I-526' },
  'mkt-dallas': { id: 'mkt-dallas', name: 'Dallas Market', shortName: 'Dallas', region: 'SE', coords: [-96.7970, 32.7767], state: 'TX', hubType: 'Inland Rail Hub', artery: 'I-35 / I-30 / I-20' },
  'mkt-houston': { id: 'mkt-houston', name: 'Houston Hub', shortName: 'Houston', region: 'SE', coords: [-95.3698, 29.7604], state: 'TX', hubType: 'Port & Rail', artery: 'I-45 / I-10 / I-610' },
  'mkt-memphis': { id: 'mkt-memphis', name: 'Memphis Terminal', shortName: 'Memphis', region: 'SE', coords: [-90.0490, 35.1495], state: 'TN', hubType: 'Inland Rail Hub', artery: 'I-40 / I-55' },
  'mkt-miami': { id: 'mkt-miami', name: 'Miami Hub', shortName: 'Miami', region: 'SE', coords: [-80.1918, 25.7617], state: 'FL', hubType: 'Port & Rail', artery: 'I-95 / Florida Tpk' }
};

// Region presets for camera viewport
const REGION_VIEWPORTS: Record<Region, { x: number; y: number; zoom: number }> = {
  USA: { x: 0, y: 0, zoom: 1 },
  NW: { x: 220, y: 140, zoom: 1.75 },
  SW: { x: 260, y: -60, zoom: 1.85 },
  NE: { x: -220, y: 110, zoom: 1.75 },
  SE: { x: -140, y: -90, zoom: 1.65 }
};

interface GoogleLogisticsMapProps {
  markets: MarketSummary[];
  selectedRegion: Region;
  selectedMarketId: string;
  filterToSelectedMarket: boolean;
  onSelectMarket: (marketId: string) => void;
  onRegionChange: (region: Region) => void;
  laneExceptions: LaneException[];
  kpiFilter: string;
  matchesKpiFilter: (lane: LaneException, filter: string) => boolean;
}

export const GoogleLogisticsMap: React.FC<GoogleLogisticsMapProps> = ({
  markets,
  selectedRegion,
  selectedMarketId,
  filterToSelectedMarket,
  onSelectMarket,
  onRegionChange,
  laneExceptions,
  kpiFilter,
  matchesKpiFilter
}) => {
  const [mapLayer, setMapLayer] = useState<'default' | 'satellite' | 'terrain'>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlaceSheet, setShowPlaceSheet] = useState(true);
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [showTrafficLayer, setShowTrafficLayer] = useState(true);

  // Pan & Zoom interactive transformation state
  const [transform, setTransform] = useState<{ x: number; y: number; zoom: number }>({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Sync camera when region changes
  useEffect(() => {
    const preset = REGION_VIEWPORTS[selectedRegion] || REGION_VIEWPORTS.USA;
    setTransform(preset);
  }, [selectedRegion]);

  // Market stats lookup
  const marketMap = useMemo(() => {
    const map = new Map<string, MarketSummary>();
    markets.forEach((m) => map.set(m.id, m));
    return map;
  }, [markets]);

  const activeMarket = useMemo(() => {
    return markets.find((m) => m.id === selectedMarketId) || markets[0];
  }, [markets, selectedMarketId]);

  const activeLocation = useMemo(() => {
    return MARKET_LOCATIONS[selectedMarketId] || MARKET_LOCATIONS['mkt-oakland'];
  }, [selectedMarketId]);

  // D3 Projection for accurate USA Geography matching Google Maps
  const projection = useMemo(() => {
    return geoAlbersUsa().scale(1100).translate([480, 275]);
  }, []);

  const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

  // State features from usAtlas TopoJSON
  const stateFeatures = useMemo(() => {
    // @ts-expect-error topojson features type helper
    const geoData = feature(usAtlas, usAtlas.objects.states);
    // @ts-expect-error features list
    return geoData.features || [];
  }, []);

  // Zoom handlers
  const handleZoomIn = () => {
    setTransform((prev) => ({ ...prev, zoom: Math.min(prev.zoom + 0.35, 3.5) }));
  };

  const handleZoomOut = () => {
    setTransform((prev) => ({ ...prev, zoom: Math.max(prev.zoom - 0.35, 0.85) }));
  };

  const handleResetCamera = () => {
    onRegionChange('USA');
    setTransform({ x: 0, y: 0, zoom: 1 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking buttons or overlays
    if ((e.target as HTMLElement).closest('.interactive-control')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setTransform((prev) => ({
      ...prev,
      zoom: Math.min(Math.max(prev.zoom + delta, 0.85), 3.5)
    }));
  };

  // Filtered market list for search
  const filteredMarketList = useMemo(() => {
    if (!searchQuery.trim()) return Object.values(MARKET_LOCATIONS);
    const q = searchQuery.toLowerCase();
    return Object.values(MARKET_LOCATIONS).filter(
      (m) => m.name.toLowerCase().includes(q) || m.shortName.toLowerCase().includes(q) || m.state.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Marker Color matching Google Maps and Target variance logic
  const getMarkerPinColor = (mkt?: MarketSummary) => {
    if (!mkt) return '#34A853'; // Google Green
    if (mkt.variancePercent <= 0) return '#34A853'; // Google Green: At / Under Target
    if (mkt.variancePercent <= 5.0) return '#FBBC05'; // Google Amber: 0-5% Over
    return '#EA4335'; // Google Red: >5% Over Target
  };

  // Calculated Market Lanes
  const activeMarketLanes = useMemo(() => {
    return laneExceptions.filter((l) =>
      l.origin.toUpperCase().includes(activeLocation?.shortName.toUpperCase()) ||
      l.destination.toUpperCase().includes(activeLocation?.shortName.toUpperCase())
    );
  }, [laneExceptions, activeLocation]);

  return (
    <div
      ref={mapContainerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className={`w-full h-full min-h-[520px] relative rounded-xl overflow-hidden select-none border border-[#CBD5E1] shadow-sm flex flex-col font-sans transition-all ${
        mapLayer === 'satellite'
          ? 'bg-[#0B1426]'
          : mapLayer === 'terrain'
          ? 'bg-[#E3EFE6]'
          : 'bg-[#AAD3DF]' /* Signature Google Maps Water Blue */
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* 1. Google Maps Search & Filter Card (Top Left) */}
      <div className="absolute top-3 left-3 z-30 flex flex-col gap-2 max-w-[calc(100%-90px)] sm:max-w-2xl pointer-events-none">
        {/* Floating Google Search Box */}
        <div className="interactive-control bg-white rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-black/5 flex items-center px-3 py-2 gap-2 pointer-events-auto transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.18)] w-full max-w-xs sm:max-w-sm">
          {/* Google 4-Color Pin Icon */}
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle fill="#FFFFFF" cx="12" cy="9" r="2.5" />
            </svg>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search US markets, ports, hubs..."
            className="flex-1 text-[13px] text-[#202124] placeholder-[#70757A] outline-none font-medium bg-transparent"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#70757A] hover:text-[#202124] p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="h-4 w-px bg-[#DADCE0]"></div>

          <button
            type="button"
            className="text-[#1A73E8] hover:text-[#174EA6] p-1 rounded-full hover:bg-[#F1F3F4] transition-colors cursor-pointer"
            title="Search Market"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Google Quick Filter Chips Bar - Shows all regions cleanly without cutting off SE */}
        <div className="interactive-control flex items-center flex-wrap gap-1.5 pb-1 pointer-events-auto">
          {(['USA', 'NW', 'SW', 'NE', 'SE'] as Region[]).map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => onRegionChange(reg)}
              className={`px-3 py-1 rounded-full text-xs font-medium shadow-xs border transition-all cursor-pointer whitespace-nowrap ${
                selectedRegion === reg
                  ? 'bg-[#1A73E8] text-white border-[#1A73E8] shadow-sm font-semibold'
                  : 'bg-white text-[#3C4043] border-[#DADCE0] hover:bg-[#F8F9FA] hover:text-[#202124]'
              }`}
            >
              {reg === 'USA' ? 'All US' : `${reg} Region`}
            </button>
          ))}

          {/* Traffic Toggle Chip */}
          <button
            type="button"
            onClick={() => setShowTrafficLayer(!showTrafficLayer)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-xs border transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              showTrafficLayer
                ? 'bg-[#E8F0FE] text-[#1A73E8] border-[#AECBFA]'
                : 'bg-white text-[#5F6368] border-[#DADCE0] hover:bg-[#F8F9FA]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showTrafficLayer ? 'bg-[#34A853]' : 'bg-[#9AA0A6]'}`}></span>
            <span>Interstates</span>
          </button>
        </div>
      </div>

      {/* 2. Google Maps Layers Switcher Button (Top Right) */}
      <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-2 pointer-events-none">
        <div className="relative interactive-control pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowLayersMenu(!showLayersMenu)}
            className="bg-white hover:bg-[#F8F9FA] text-[#3C4043] hover:text-[#202124] p-2 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-black/5 flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer"
            title="Layers & Map Style"
          >
            <Layers className="w-4 h-4 text-[#1A73E8]" />
            <span className="hidden sm:inline capitalize">{mapLayer}</span>
          </button>

          {/* Dropdown Menu for Layers */}
          {showLayersMenu && (
            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.2)] border border-[#DADCE0] p-2 min-w-[170px] flex flex-col gap-1 z-40">
              <span className="text-[11px] font-bold text-[#70757A] px-2 py-1 uppercase tracking-wider">Map Type</span>
              {[
                { id: 'default', label: 'Default (Google)', desc: 'Clean vector map' },
                { id: 'terrain', label: 'Terrain & Green', desc: 'Elevation & parks' },
                { id: 'satellite', label: 'Satellite Night', desc: 'Dark operational' }
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => {
                    setMapLayer(style.id as 'default' | 'satellite' | 'terrain');
                    setShowLayersMenu(false);
                  }}
                  className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex flex-col ${
                    mapLayer === style.id ? 'bg-[#E8F0FE] text-[#1A73E8] font-bold' : 'hover:bg-[#F1F3F4] text-[#3C4043]'
                  }`}
                >
                  <span>{style.label}</span>
                  <span className="text-[10px] text-[#70757A] font-normal">{style.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. SVG Map Surface (Styled with Signature Google Maps Aesthetic) */}
      <div className="w-full h-full flex-1 relative overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 960 560"
          className="w-full h-full max-h-[580px] object-contain transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
            transformOrigin: 'center center'
          }}
        >
          <defs>
            {/* Google Pin Drop Shadow Filter */}
            <filter id="googlePinShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#202124" floodOpacity="0.35" />
            </filter>
            {/* Google Maps Interstate Highway Line Pattern */}
            <filter id="roadGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0.5" stdDeviation="0.5" floodColor="#D97706" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Ocean Water Background */}
          <rect
            width="960"
            height="560"
            fill={
              mapLayer === 'satellite' ? '#0B1426' : mapLayer === 'terrain' ? '#D6EBF4' : '#AAD3DF'
            }
          />

          {/* National Parks & Green Spaces Layer (Google Maps Green #DCEDD7) */}
          <g id="google-parks-layer" opacity={mapLayer === 'satellite' ? 0.15 : 0.75}>
            {/* Pacific NW Green Forest Belt */}
            <path
              d="M 60 40 Q 90 70 85 140 Q 95 180 80 230 Q 120 200 130 140 Q 125 70 80 40 Z"
              fill={mapLayer === 'terrain' ? '#C2E5C5' : '#DCEDD7'}
            />
            {/* Sierra Nevada / Northern CA */}
            <path
              d="M 95 190 Q 120 220 115 290 Q 135 270 125 210 Z"
              fill={mapLayer === 'terrain' ? '#C2E5C5' : '#DCEDD7'}
            />
            {/* Rocky Mountain Range Green Reserve */}
            <path
              d="M 230 60 Q 280 120 270 240 Q 320 200 310 100 Q 270 70 230 60 Z"
              fill={mapLayer === 'terrain' ? '#C8E6C9' : '#E2EEDC'}
            />
            {/* Great Smoky Mountains / Appalachian Trail */}
            <path
              d="M 720 240 Q 770 180 820 140 Q 805 135 765 170 Q 710 230 720 240 Z"
              fill={mapLayer === 'terrain' ? '#C2E5C5' : '#DCEDD7'}
            />
          </g>

          {/* USA State Polygons (Google Maps Warm Land #F5F5F2 & State Lines #D6D6D6) */}
          <g id="google-land-layer">
            {stateFeatures.map((feat: { id: string }) => {
              const pathD = pathGenerator(feat as unknown as Parameters<typeof pathGenerator>[0]);
              if (!pathD) return null;

              const isSatellite = mapLayer === 'satellite';
              const isTerrain = mapLayer === 'terrain';

              return (
                <path
                  key={feat.id}
                  d={pathD}
                  fill={
                    isSatellite
                      ? '#1E293B'
                      : isTerrain
                      ? '#F0F4EC'
                      : '#F5F5F2' /* Authentic Google Maps Land Canvas */
                  }
                  stroke={
                    isSatellite
                      ? '#334155'
                      : isTerrain
                      ? '#CBD5E1'
                      : '#FFFFFF' /* Crisp Google State Dividers */
                  }
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* Inner State Border Lines */}
            {stateFeatures.map((feat: { id: string }) => {
              const pathD = pathGenerator(feat as unknown as Parameters<typeof pathGenerator>[0]);
              if (!pathD) return null;
              return (
                <path
                  key={`border-${feat.id}`}
                  d={pathD}
                  fill="none"
                  stroke={mapLayer === 'satellite' ? '#475569' : '#DADCE0'}
                  strokeWidth="0.75"
                  strokeOpacity="0.8"
                />
              );
            })}

            {/* Great Lakes Water Bodies (Signature Google Maps Lake Fill) */}
            <g fill={mapLayer === 'satellite' ? '#0B1426' : mapLayer === 'terrain' ? '#D6EBF4' : '#AAD3DF'}>
              {/* Lake Superior, Michigan, Huron, Erie, Ontario */}
              <ellipse cx="610" cy="115" rx="35" ry="15" />
              <ellipse cx="645" cy="175" rx="14" ry="32" />
              <ellipse cx="685" cy="155" rx="20" ry="24" />
              <ellipse cx="735" cy="180" rx="28" ry="10" />
              <ellipse cx="775" cy="165" rx="22" ry="9" />
            </g>
          </g>

          {/* 4. Google Maps Major Interstate Highways Network (Orange #FFC570 & White #FFFFFF) */}
          {showTrafficLayer && (
            <g id="google-interstate-highways" opacity={mapLayer === 'satellite' ? 0.5 : 0.85}>
              {/* Major Transcontinental Highways Underlying White Casings */}
              <g stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
                {/* I-90 / I-94 Northern Tier: Seattle -> Chicago -> NY/NJ */}
                <path d="M 85 65 L 140 75 L 250 85 L 430 115 L 635 180 L 740 165 L 840 160" />
                {/* I-80 Transcontinental: Oakland -> Salt Lake -> Denver -> Chicago -> NY/NJ */}
                <path d="M 90 220 L 140 215 L 225 210 L 335 220 L 440 230 L 635 180 L 840 160" />
                {/* I-70 Central Corridor: Denver -> Kansas City -> Columbus -> Baltimore */}
                <path d="M 440 230 L 530 250 L 675 225 L 810 205" />
                {/* I-40 Transcontinental: LA -> Phoenix/Flagstaff -> Dallas -> Memphis -> Atlanta */}
                <path d="M 120 315 L 245 320 L 450 340 L 530 350 L 630 315 L 720 330" />
                {/* I-10 Southern Corridor: LA -> Phoenix -> Houston -> Atlanta -> Florida */}
                <path d="M 120 315 L 220 345 L 400 400 L 545 425 L 720 375 L 800 405" />
                {/* I-5 West Coast: Seattle -> Portland -> Oakland -> LA */}
                <path d="M 85 65 L 85 105 L 90 220 L 120 315" />
                {/* I-95 East Coast: NY/NJ -> Baltimore -> Norfolk -> Charleston -> Savannah -> Miami */}
                <path d="M 840 160 L 810 205 L 815 245 L 785 345 L 765 375 L 795 495" />
                {/* I-35 Central Artery: Dallas -> Kansas City -> Minneapolis */}
                <path d="M 530 350 L 530 250 L 575 140" />
              </g>

              {/* Highway Core: Google Maps Interstate Orange (#FFC570) */}
              <g stroke="#FFC570" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M 85 65 L 140 75 L 250 85 L 430 115 L 635 180 L 740 165 L 840 160" />
                <path d="M 90 220 L 140 215 L 225 210 L 335 220 L 440 230 L 635 180 L 840 160" />
                <path d="M 440 230 L 530 250 L 675 225 L 810 205" />
                <path d="M 120 315 L 245 320 L 450 340 L 530 350 L 630 315 L 720 330" />
                <path d="M 120 315 L 220 345 L 400 400 L 545 425 L 720 375 L 800 405" />
                <path d="M 85 65 L 85 105 L 90 220 L 120 315" />
                <path d="M 840 160 L 810 205 L 815 245 L 785 345 L 765 375 L 795 495" />
                <path d="M 530 350 L 530 250 L 575 140" />
              </g>

              {/* Highway Route Shields (Google Style Mini Blue/Red Shield Icons) */}
              {[
                { label: '80', x: 280, y: 215 },
                { label: '90', x: 340, y: 100 },
                { label: '10', x: 310, y: 375 },
                { label: '5', x: 86, y: 160 },
                { label: '95', x: 805, y: 275 },
                { label: '35', x: 532, y: 300 }
              ].map((shield, sIdx) => (
                <g key={sIdx} className="pointer-events-none select-none">
                  <rect
                    x={shield.x - 7}
                    y={shield.y - 5.5}
                    width="14"
                    height="11"
                    rx="3"
                    fill="#1A73E8"
                    stroke="#FFFFFF"
                    strokeWidth="0.8"
                  />
                  <text
                    x={shield.x}
                    y={shield.y + 3}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="7"
                    fontWeight="bold"
                    fontFamily="Roboto, -apple-system, sans-serif"
                  >
                    {shield.label}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* 5. Iconic Google Maps Teardrop Markers */}
          <g id="google-map-pins">
            {filteredMarketList.map((loc) => {
              const point = projection(loc.coords);
              if (!point) return null;

              const mkt = marketMap.get(loc.id);
              const isSelected = filterToSelectedMarket && selectedMarketId === loc.id;
              const isRegionMatched = selectedRegion === 'USA' || loc.region === selectedRegion;

              const matchingMarketLanes = laneExceptions.filter(
                (l) => l.origin.toUpperCase().includes(loc.shortName.toUpperCase()) && matchesKpiFilter(l, kpiFilter)
              );
              const matchesKpiFilterActive = kpiFilter === 'all' || matchingMarketLanes.length > 0;

              const pinColor = isSelected ? '#1A73E8' : getMarkerPinColor(mkt);

              return (
                <g
                  key={loc.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMarket(loc.id);
                    setShowPlaceSheet(true);
                  }}
                  className={`interactive-control cursor-pointer transition-all duration-200 group ${
                    !isRegionMatched || !matchesKpiFilterActive ? 'opacity-30' : 'opacity-100'
                  }`}
                  transform={`translate(${point[0]}, ${point[1]})`}
                >
                  {/* Selected Marker Animated Radar Ring */}
                  {isSelected && (
                    <circle
                      cx="0"
                      cy="0"
                      r="18"
                      fill="#1A73E8"
                      fillOpacity="0.2"
                      stroke="#1A73E8"
                      strokeWidth="1.5"
                      className="animate-ping"
                    />
                  )}

                  {/* Marker Drop Shadow on Map Floor */}
                  <ellipse
                    cx="0"
                    cy="0.5"
                    rx={isSelected ? '7' : '5.5'}
                    ry={isSelected ? '3' : '2.2'}
                    fill="#000000"
                    fillOpacity="0.3"
                  />

                  {/* Google Maps Signature Teardrop Pin Shape */}
                  <g transform={`translate(${isSelected ? -14 : -11}, ${isSelected ? -34 : -28}) scale(${isSelected ? 1.18 : 0.95})`}>
                    {/* Outer Drop Shadow */}
                    <path
                      d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 14 8 14s8-8.75 8-14c0-4.42-3.58-8-8-8z"
                      fill="#000000"
                      fillOpacity="0.25"
                      transform="translate(0, 1.5)"
                    />
                    {/* Pin Body */}
                    <path
                      d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 14 8 14s8-8.75 8-14c0-4.42-3.58-8-8-8z"
                      fill={pinColor}
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                    />
                    {/* Inner White Center Dot */}
                    <circle cx="12" cy="10" r="3.6" fill="#FFFFFF" />
                  </g>

                  {/* City Label Badge (Google Maps Floating Style) */}
                  <g transform={`translate(0, ${isSelected ? -38 : -32})`}>
                    {/* Label Box Background */}
                    <rect
                      x={-(loc.shortName.length * 3.4 + 10)}
                      y="-9"
                      width={loc.shortName.length * 6.8 + 20}
                      height="18"
                      rx="9"
                      fill={isSelected ? '#1A73E8' : '#FFFFFF'}
                      stroke={isSelected ? '#FFFFFF' : '#DADCE0'}
                      strokeWidth="1"
                      filter="url(#googlePinShadow)"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : '#202124'}
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="Roboto, -apple-system, sans-serif"
                    >
                      {loc.shortName}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* 6. Google Maps Place Card / Information Sheet (Bottom Left) */}
      {showPlaceSheet && activeMarket && (
        <div className="absolute bottom-10 left-3 z-30 max-w-sm w-[calc(100%-24px)] sm:w-84 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.22)] border border-[#DADCE0] overflow-hidden pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-2">
          {/* Card Header with Google Styled Blue Accent Banner */}
          <div className="bg-[#1A73E8] px-3.5 py-2.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                <Truck className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold leading-tight">{activeMarket.name}</h4>
                <span className="text-[10px] text-white/80 font-medium">
                  {activeLocation?.state} • {activeLocation?.hubType} ({activeMarket.region})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPlaceSheet(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Key Rates & Variance Breakdown */}
          <div className="p-3 bg-white space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#F1F3F4]">
              <div className="bg-[#F8F9FA] p-2 rounded-lg border border-[#E8EAED]">
                <span className="text-[10px] text-[#70757A] font-semibold uppercase tracking-wider block">Target Rate</span>
                <span className="text-base font-extrabold text-[#202124] font-mono">${activeMarket.avgTarget.toLocaleString()}</span>
              </div>
              <div className="bg-[#F8F9FA] p-2 rounded-lg border border-[#E8EAED]">
                <span className="text-[10px] text-[#70757A] font-semibold uppercase tracking-wider block">Actual Avg</span>
                <span className="text-base font-extrabold text-[#202124] font-mono">${activeMarket.avgActual.toLocaleString()}</span>
              </div>
            </div>

            {/* Variance Status Row */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#70757A] font-medium">Target Variance:</span>
              <span
                className={`font-bold font-mono px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  activeMarket.varianceDollars <= 0
                    ? 'bg-[#E6F4EA] text-[#137333]'
                    : activeMarket.variancePercent <= 5
                    ? 'bg-[#FEF7E0] text-[#B06000]'
                    : 'bg-[#FCE8E6] text-[#C5221F]'
                }`}
              >
                {activeMarket.varianceDollars <= 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                {activeMarket.varianceDollars >= 0 ? `+$${activeMarket.varianceDollars}` : `-$${Math.abs(activeMarket.varianceDollars)}`}{' '}
                ({activeMarket.variancePercent >= 0 ? `+${activeMarket.variancePercent}%` : `${activeMarket.variancePercent}%`})
              </span>
            </div>

            {/* Monitored Loads */}
            <div className="flex items-center justify-between text-xs text-[#5F6368]">
              <span>Active Drayage Loads:</span>
              <strong className="text-[#202124]">{activeMarket.loads} loads monitored</strong>
            </div>

            {/* Key Artery Info */}
            <div className="flex items-center justify-between text-[11px] text-[#5F6368] pt-1">
              <span>Primary Artery:</span>
              <span className="font-semibold text-[#1A73E8] bg-[#E8F0FE] px-1.5 py-0.5 rounded">{activeLocation?.artery}</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. Google Maps Floating Zoom & Nav Controls (Bottom Right) */}
      <div className="absolute bottom-8 right-3 z-30 flex flex-col items-center gap-2 pointer-events-none">
        {/* Reset / Center Map Button */}
        <button
          type="button"
          onClick={handleResetCamera}
          className="interactive-control bg-white hover:bg-[#F8F9FA] text-[#5F6368] hover:text-[#202124] p-2 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-black/5 transition-all cursor-pointer pointer-events-auto"
          title="Reset USA View"
        >
          <RotateCcw className="w-4 h-4 text-[#1A73E8]" />
        </button>

        {/* Stacked Zoom In / Zoom Out Controls */}
        <div className="interactive-control bg-white rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-black/5 flex flex-col overflow-hidden pointer-events-auto">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4] transition-colors cursor-pointer border-b border-[#DADCE0]"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Street View Pegman Figurine */}
        <div className="interactive-control bg-white p-2 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-black/5 pointer-events-auto flex items-center justify-center hover:bg-[#F8F9FA] cursor-pointer" title="Google Street View Pegman">
          <div className="w-4 h-4 rounded-full bg-[#FBBC04] flex items-center justify-center text-[10px] font-black text-[#202124]">
            웃
          </div>
        </div>
      </div>

      {/* 8. Signature Google Logo & Map Attribution Footer (Bottom Bar) */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-white/80 backdrop-blur-xs border-t border-black/5 px-3 flex items-center justify-between text-[10px] text-[#70757A] z-20 pointer-events-none">
        {/* Google Multi-Color Text Logo */}
        <div className="flex items-center gap-1.5 font-bold tracking-tight">
          <span className="text-[13px] font-sans font-semibold">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </span>
          <span className="text-[#5F6368] font-normal hidden sm:inline">Logistics Maps</span>
        </div>

        {/* Legend Scale & Attribution */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#34A853]"></span> At/Under
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FBBC05]"></span> 0-5% Over
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#EA4335]"></span> &gt;5% Over
            </span>
          </div>

          <div className="h-3 w-px bg-[#DADCE0] hidden sm:block"></div>

          <span>Map data ©2026 Google</span>
        </div>
      </div>
    </div>
  );
};
