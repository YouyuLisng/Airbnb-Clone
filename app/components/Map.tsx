"use client"; // 地圖

import { useEffect, useRef } from 'react';
import { MapLibreMap, Marker, NavigationControl, setWorkerUrl, getVersion } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { BiMapPin } from 'react-icons/bi';

// Esri's Light Gray Canvas (the previous version of this file) rendered
// reliably but came across as flat/lifeless once it was actually in the
// UI. OpenFreeMap's hosted "Liberty" style (OSM Liberty -- free, no API
// key, no rate limit) has the requested palette: cream/beige roads,
// grass-green parks, light blue water, light grayish-brown built-up
// areas, dark gray labels -- and it stacks each place name's local
// script (e.g. 臺北市) with the latin name, so Chinese place names show
// up directly rather than being an afterthought.
const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

// MapLibre loads/decodes vector tiles in a Web Worker, constructed via a
// Blob that does `import(new URL('./maplibre-gl-worker.mjs',
// import.meta.url))`. Under Turbopack that URL doesn't resolve to a
// servable path, so the worker crashes immediately (created, then closed,
// with no visible error) and zero tile requests are ever made -- the
// style/sprite requests (main thread) still succeed, so the background
// color paints but no roads/parks/water/labels ever show up. Pointing
// setWorkerUrl at the same version's worker bundle on a CDN sidesteps
// Turbopack's bundling of it entirely.
setWorkerUrl(`https://unpkg.com/maplibre-gl@${getVersion()}/dist/maplibre-gl-worker.mjs`);

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
                style: MAP_STYLE_URL,
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

            // Defensive: MapLibre doesn't watch its container for size
            // changes on its own, so if this ever ends up mounted while
            // its container is still settling into its final layout size
            // (e.g. modal transitions), this keeps the canvas in sync.
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
