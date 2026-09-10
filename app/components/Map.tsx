"use client"; // 地圖

import { Map as PigeonMap, Marker } from 'pigeon-maps';

// OpenTopoMap tiles (terrain/elevation-shaded, no API key required) --
// fits an outdoor gear rental product much better than a plain street
// map. Round-robins across OpenTopoMap's a/b/c subdomains.
const TOPO_SUBDOMAINS = ['a', 'b', 'c'];
const topoProvider = (x: number, y: number, z: number) => {
    const subdomain = TOPO_SUBDOMAINS[(x + y) % TOPO_SUBDOMAINS.length];
    return `https://${subdomain}.tile.opentopomap.org/${z}/${x}/${y}.png`;
};

// Approximate geographic center of Taiwan -- the default view before any
// region is picked.
const TAIWAN_CENTER: [number, number] = [23.7, 121];

interface MapProps {
    center?: readonly number[]
}

const Map: React.FC<MapProps> = ({
    center
}) => {
    const position = center ? [center[0], center[1]] as [number, number] : TAIWAN_CENTER;
    const zoom = center ? 10 : 7;

    return (
        <div className="h-[35vh] rounded-lg overflow-hidden">
            {/* pigeon-maps' center/zoom are genuinely controlled props --
                unlike react-leaflet's MapContainer, it re-renders the view
                whenever they change, so picking a different region here
                actually pans the map instead of requiring a manual
                imperative workaround. */}
            <PigeonMap
                center={position}
                zoom={zoom}
                provider={topoProvider}
                attribution={
                    <span className="text-[10px] bg-white/80 px-1">
                        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors,{' '}
                        <a href="https://opentopomap.org" target="_blank" rel="noreferrer">OpenTopoMap</a> (CC-BY-SA)
                    </span>
                }
            >
                {center && (
                    <Marker anchor={position} color="#047857" width={40} />
                )}
            </PigeonMap>
        </div>
    );
}

export default Map;
