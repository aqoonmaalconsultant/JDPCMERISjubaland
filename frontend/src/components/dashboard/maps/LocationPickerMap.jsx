import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "../../../utils/leaflet";

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

function FlyToLocation({ position }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (position) {
      map.flyTo(position, 12);
    }
  }, [position, map]);

  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onChange,
}) {
  const position =
    latitude && longitude
      ? [Number(latitude), Number(longitude)]
      : [0, 42.5454]; // Somalia

  return (
    <MapContainer
      center={position}
      zoom={6}
      style={{
        height: "350px",
        width: "100%",
        borderRadius: "10px",
      }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToLocation position={position} />

      <ClickHandler
        onSelect={(lat, lng) => onChange(lat, lng)}
      />

      <Marker
        position={position}
        draggable
        eventHandlers={{
          dragend(event) {
            const marker = event.target.getLatLng();

            onChange(marker.lat, marker.lng);
          },
        }}
      />
    </MapContainer>
  );
}