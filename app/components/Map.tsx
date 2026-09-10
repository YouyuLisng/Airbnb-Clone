"use client"; // 地圖

import { useEffect, useRef } from 'react';
import { MapLibreMap, Marker, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { BiMapPin } from 'react-icons/bi';

// OpenTopoMap's elevation-shaded terrain tiles read as too busy/"realistic"
// against the rest of GearShare's flat, minimal UI. Esri's "Light Gray
// Canvas" basemap (light gray, thin roads, minimal labels, genuinely
// keyless) is a much cleaner fit. Two things were tried and ruled out
// first: an OpenFreeMap vector build of CARTO's Positron style rendered
// as a blank canvas under headless Chromium's software WebGL fallback
// (loaded fine, just never visibly painted, so it couldn't be verified);
// CARTO's own basemaps.cartocdn.com raster tiles now silently serve an
// "API KEY REQUIRED" watermark instead of actually erring on
// unauthenticated requests. Esri's tiles are plain raster (same proven
// rendering path as the earlier OpenTopoMap version) and need no key.
const esriTileUrl = (service: string) =>
    // Esri's tile REST API addresses tiles as z/y/x, not the usual z/x/y.
    `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/${service}/MapServer/tile/{z}/{y}/{x}`;

const lightGrayStyle = {
    version: 8 as const,
    sources: {
        base: {
            type: 'raster' as const,
            tiles: [esriTileUrl('World_Light_Gray_Base')],
            tileSize: 256,
            attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        },
        // Place-name labels, roads, and borders as a separate transparent
        // overlay -- this is how Esri's Light Gray Canvas is meant to be
        // composited (base + reference).
        reference: {
            type: 'raster' as const,
            tiles: [esriTileUrl('World_Light_Gray_Reference')],
            tileSize: 256,
        },
    },
    layers: [
        { id: 'base', type: 'raster' as const, source: 'base' },
        { id: 'reference', type: 'raster' as const, source: 'reference' },
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
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

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
                style: lightGrayStyle,
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

            // The map is created while it's inside an animating modal
            // (Modal.tsx scales/translates in over ~300ms), so the
            // container's on-screen size when the WebGL canvas is first
            // sized can be stale -- MapLibre doesn't watch for that on its
            // own. Without this it renders as a blank canvas until
            // something else happens to trigger a resize.
            const resizeObserver = new ResizeObserver(() => map.resize());
            resizeObserver.observe(containerRef.current);
            resizeObserverRef.current = resizeObserver;
        } else {
            mapRef.current.flyTo({ center: lngLat, zoom: 10 });
            markerRef.current?.setLngLat(lngLat);
        }
    }, [center]);

    // Tear the map down on unmount.
    useEffect(() => {
        return () => {
            resizeObserverRef.current?.disconnect();
            resizeObserverRef.current = null;
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
