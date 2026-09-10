"use client"; // 地圖

import { Map as PigeonMap, Marker } from 'pigeon-maps';
import { BiMapPin } from 'react-icons/bi';

// OpenTopoMap tiles (terrain/elevation-shaded, no API key required) --
// fits an outdoor gear rental product much better than a plain street
// map. Round-robins across OpenTopoMap's a/b/c subdomains.
const TOPO_SUBDOMAINS = ['a', 'b', 'c'];
const topoProvider = (x: number, y: number, z: number) => {
    const subdomain = TOPO_SUBDOMAINS[(x + y) % TOPO_SUBDOMAINS.length];
    return `https://${subdomain}.tile.opentopomap.org/${z}/${x}/${y}.png`;
};

interface MapProps {
    center?: readonly number[]
}

const Map: React.FC<MapProps> = ({
    center
}) => {
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

    const position = [center[0], center[1]] as [number, number];

    return (
        <div className="h-[35vh] rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
            {/* pigeon-maps' center/zoom are genuinely controlled props --
                unlike react-leaflet's MapContainer, it re-renders the view
                whenever they change, so picking a different region here
                actually pans the map instead of requiring a manual
                imperative workaround. */}
            <PigeonMap
                center={position}
                zoom={10}
                provider={topoProvider}
                attribution={
                    <span className="text-[10px] bg-white/80 px-1">
                        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors,{' '}
                        <a href="https://opentopomap.org" target="_blank" rel="noreferrer">OpenTopoMap</a> (CC-BY-SA)
                    </span>
                }
            >
                <Marker anchor={position} color="#047857" width={40} />
            </PigeonMap>
        </div>
    );
}

export default Map;
