import L from "leaflet";
import { Marker } from "react-leaflet";

const colors = {
  Planning: "#2563EB",
  Active: "#F59E0B",
  "On Hold": "#9333EA",
  Completed: "#16A34A",
  Cancelled: "#DC2626",
};

function createIcon(color) {
  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width:18px;
          height:18px;
          border-radius:50%;
          background:${color};
          border:3px solid white;
          box-shadow:0 0 8px rgba(0,0,0,.35);
        ">
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function ProjectMarker({
  project,
  children,
}) {
  const color =
    colors[project?.status] ||
    "#64748B";

  return (
    <Marker
      position={[
        project.latitude,
        project.longitude,
      ]}
      icon={createIcon(color)}
    >
      {children}
    </Marker>
  );
}