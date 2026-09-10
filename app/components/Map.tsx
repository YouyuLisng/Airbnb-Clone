"use client"; // 地圖

import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';

import "leaflet/dist/leaflet.css";

// A brand-colored pin built from inline SVG instead of an image file --
// side-steps the bundler asset-resolution issues below entirely (no
// `import x from '*.png'` to go wrong) and lets it match GearShare's
// emerald palette instead of Leaflet's default blue teardrop.
const gearMarkerIcon = L.divIcon({
    className: '',
    html: `
        <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 26 16 26s16-15 16-26C32 7.163 24.837 0 16 0Z" fill="#047857"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
});

// Approximate geographic center of Taiwan -- the sensible default view
// before any region is picked, instead of the world-country-picker's old
// London-ish default.
const TAIWAN_CENTER: L.LatLngExpression = [23.7, 121];

interface MapProps {
    center?: readonly number[]
}

// MapContainer's `center` prop only sets the *initial* view on mount --
// react-leaflet doesn't react to it changing afterwards, so picking a
// different region did nothing visually. This listens for `center`
// changes and pans the already-mounted map instead.
const RecenterOnChange: React.FC<{ center: L.LatLngExpression; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();

    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);

    return null;
}

const Map: React.FC<MapProps> = ({
    center
}) => {
    const position = (center as L.LatLngExpression) || TAIWAN_CENTER;
    const zoom = center ? 10 : 7;

    return (
        <MapContainer
            center={position}
            zoom={zoom}
            scrollWheelZoom={false}
            className=' h-[35vh] rounded-lg'
        >
            <RecenterOnChange center={position} zoom={zoom} />
            <TileLayer
                attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
            {center &&(
                <Marker
                    position={center as L.LatLngExpression}
                    icon={gearMarkerIcon}
                />
            )}
        </MapContainer>
    );
}

export default Map;
