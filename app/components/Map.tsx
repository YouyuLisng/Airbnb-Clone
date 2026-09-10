"use client"; // 地圖

import L from 'leaflet';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

import "leaflet/dist/leaflet.css";

// Turbopack (Next.js's default bundler as of Next 16) doesn't resolve
// `import x from 'leaflet/dist/images/*.png'` to the { src } object shape
// webpack's asset loader produced, so `markerIcon.src` ends up undefined
// and Leaflet throws "iconUrl not set in Icon options". Pointing at the
// CDN copy (pinned to the installed leaflet version) sidesteps bundler
// asset-resolution behavior entirely.
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapProps {
    center?: readonly number[]
}

const Map: React.FC<MapProps> = ({
    center
}) => {
    return (
        <MapContainer
            center={center as L.LatLngExpression || [51, -0.09]}
            zoom={center ? 4 : 2}
            scrollWheelZoom={false}
            className=' h-[35vh] rounded-lg'
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {center &&(
                <Marker 
                    position={center as L.LatLngExpression}
                />
            )}
        </MapContainer>
    );
}

export default Map;