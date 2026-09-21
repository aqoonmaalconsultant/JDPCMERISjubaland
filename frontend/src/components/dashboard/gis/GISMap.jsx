import { useEffect } from "react";
import {
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import ProjectMarker from "./ProjectMarker";
import ProjectPopup from "./ProjectPopup";

function AutoFitBounds({ features }) {
  const map = useMap();

  useEffect(() => {
    if (!features?.length) return;

    const validPoints = features
      .filter((feature) => {
        const coordinates =
          feature?.geometry?.coordinates;

        if (
          !Array.isArray(coordinates) ||
          coordinates.length < 2
        ) {
          return false;
        }

        const [lng, lat] = coordinates;

        return (
          Number.isFinite(Number(lng)) &&
          Number.isFinite(Number(lat)) &&
          Number(lat) >= -90 &&
          Number(lat) <= 90 &&
          Number(lng) >= -180 &&
          Number(lng) <= 180
        );
      })
      .map((feature) => {
        const [lng, lat] =
          feature.geometry.coordinates;

        return [
          Number(lat),
          Number(lng),
        ];
      });

    if (!validPoints.length) {
      return;
    }

    if (validPoints.length === 1) {
      map.setView(
        validPoints[0],
        12
      );

      return;
    }

    const bounds =
      L.latLngBounds(validPoints);

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 12,
    });
  }, [features, map]);

  return null;
}

export default function GISMap({
  features = [],
  height = "650px",
  className = "",
}) {
  /*
   * Keep only valid GeoJSON Point features.
   */

  const validFeatures =
    features.filter((feature) => {
      const coordinates =
        feature?.geometry?.coordinates;

      if (
        feature?.geometry?.type !==
          "Point" ||
        !Array.isArray(coordinates) ||
        coordinates.length < 2
      ) {
        return false;
      }

      const [lng, lat] =
        coordinates;

      return (
        Number.isFinite(Number(lng)) &&
        Number.isFinite(Number(lat)) &&
        Number(lat) >= -90 &&
        Number(lat) <= 90 &&
        Number(lng) >= -180 &&
        Number(lng) <= 180
      );
    });

  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <MapContainer
        center={[5.1521, 46.1996]}
        zoom={6}
        scrollWheelZoom
        style={{
          width: "100%",
          height,
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validFeatures.map(
          (feature, index) => {
            const [lng, lat] =
              feature.geometry.coordinates;

            const properties =
              feature.properties || {};

            /*
             * Transform GeoJSON into the
             * structure ProjectMarker expects.
             */
            const markerProject = {
              ...properties,

              latitude:
                Number(lat),

              longitude:
                Number(lng),
            };

            return (
              <ProjectMarker
                key={`${properties.projectId || properties.projectCode || index}-${lat}-${lng}`}
                project={markerProject}
              >
                <Popup maxWidth={380}>
                  <ProjectPopup
                    project={markerProject}
                  />
                </Popup>
              </ProjectMarker>
            );
          }
        )}

        <AutoFitBounds
          features={validFeatures}
        />
      </MapContainer>

      {validFeatures.length === 0 && (
        <div className="border-t border-slate-200 px-5 py-4 text-center text-sm text-slate-500">
          No projects with valid GIS coordinates found.
        </div>
      )}
    </div>
  );
}