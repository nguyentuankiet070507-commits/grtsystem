'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Cafe } from '@/lib/model';
import { availabilityState } from '@/lib/discovery';

const styleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty';
type Props = { cafes: Cafe[]; selectedId: string; onSelect: (id: string) => void };

export function CafeMap({ cafes, selectedId, onSelect }: Props) {
  const host = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!host.current || map.current) return;
    const instance = new maplibregl.Map({ container: host.current, style: styleUrl, center: [106.803, 10.881], zoom: 14, attributionControl: false });
    instance.addControl(new maplibregl.NavigationControl(), 'top-right');
    instance.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: '© OpenFreeMap · © OpenMapTiles · © OpenStreetMap contributors' }));
    instance.on('error', () => setError(true));
    map.current = instance;
    return () => { instance.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    if (!map.current) return;
    markers.current.forEach(marker => marker.remove());
    markers.current = cafes.map(cafe => {
      const state = availabilityState(cafe);
      const markerText = state === 'unknown' ? '!' : state === 'full' || state === 'unavailable' || state === 'closed' ? '×' : String(cafe.tables.flatMap((table) => table.seats).filter((seat) => seat.status === 'available').length);
      const pin = document.createElement('button');
      pin.className = `map-marker map-marker--${state}${selectedId === cafe.id ? ' is-selected' : ''}`;
      pin.textContent = markerText;
      pin.setAttribute('aria-label', `${cafe.name}: ${state === 'unknown' ? 'availability needs update' : markerText === '×' ? state : `${markerText} seats available`}`);
      pin.onclick = () => onSelect(cafe.id);
      return new maplibregl.Marker({ element: pin }).setLngLat([cafe.longitude, cafe.latitude]).addTo(map.current!);
    });
  }, [cafes, onSelect, selectedId]);
  useEffect(() => { const cafe = cafes.find(item => item.id === selectedId); if (cafe && map.current) map.current.easeTo({ center: [cafe.longitude, cafe.latitude], zoom: 15, duration: 500 }); }, [cafes, selectedId]);
  if (error) return <div className="map-fallback" role="status"><strong>Map unavailable</strong><span>Continue exploring with the café list. The basemap did not load.</span></div>;
  return <div className="map-shell"><div className="demo-ribbon">Demo locations · manual updates</div><div className="map-canvas" ref={host}/></div>;
}
