"use client"; // 地圖

import { useEffect, useRef } from 'react';
import { MapLibreMap, Marker, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { BiMapPin } from 'react-icons/bi';

// MapLibre still needs a "style" object even for plain raster tiles --
// this points it at OpenTopoMap (terrain/elevation-shaded, no API key
// required), fitting an outdoor gear rental product much better than a
// plain street map.
const TOPO_STYLE = {
    version: 8 as const,
    sources: {
        opentopo: {
            type: 'raster' as const,
            tiles: [
                'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
                'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
                'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, <a href="https://opentopomap.org" target="_blank">OpenTopoMap</a> (CC-BY-SA)',
        },
    },
    layers: [
        { id: 'opentopo', type: 'raster' as const, source: 'opentopo' },
    ],
};

// A brand-colored pin built from inline SVG for the marker's DOM element.
const PIN_SVG = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 26 16 26s16-15 16-26C32 7.163 24.837 0 16 0Z" fill="#047857"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>
`;

interface MapProps {
    center?: readonly number[]
}

const Map: React.FC<MapProps> = ({
    center
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const markerRef = useRef<Marker | null>(null);

    // Builds the map the first time `center` becomes available, then just
    // pans/recenters it on subsequent changes -- MapLibre's Map instance
    // is imperative (unlike pigeon-maps' controlled center/zoom props),
    // so this effect is the bridge between React state and it.
    useEffect(() => {
        if (!center) {
            return;
        }

        const lngLat: [number, number] = [center[1], center[0]]; // MapLibre uses [lng, lat]

        if (!mapRef.current) {
            if (!containerRef.current) {
                return;
            }

            const map = new MapLibreMap({
                container: containerRef.current,
                style: TOPO_STYLE,
                center: lngLat,
                zoom: 10,
                scrollZoom: false,
            });
            map.addControl(new NavigationControl({ showCompass: false }), 'top-left');
            mapRef.current = map;

            const el = document.createElement('div');
            el.innerHTML = PIN_SVG;
            markerRef.current = new Marker({ element: el, anchor: 'bottom' })
                .setLngLat(lngLat)
                .addTo(map);
        } else {
            mapRef.current.flyTo({ center: lngLat, zoom: 10 });
            markerRef.current?.setLngLat(lngLat);
        }
    }, [center]);

    // Tear the map down on unmount.
    useEffect(() => {
        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    // Rather than rendering a Taiwan-wide topo map as the "nothing picked
    // yet" state -- which mostly just showed a sparse, half-loaded tile
    // grid -- show an explicit placeholder until there's an actual point
    // to center on. One clear, intentional state instead of a map that
    // looks unfinished.
    if (!center) {
        return (
            <div className="h-[35vh] rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 flex flex-col items-center justify-center gap-2 text-emerald-700">
                <BiMapPin size={32} />
                <div className="text-sm font-medium">選擇地區後這裡會顯示地圖</div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="h-[35vh] rounded-xl overflow-hidden border border-neutral-200 shadow-sm"
        />
    );
}

export default Map;
