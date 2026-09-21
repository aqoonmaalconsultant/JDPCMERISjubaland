import { useMemo, useState } from "react";

import GISStatistics from '../components/dashboard/gis/GISStatistics.jsx';
import GISSearch from '../components/dashboard/gis/GISSearch.jsx';
import GISFilters from '../components/dashboard/gis/GISFilters.jsx';
import GISMap from '../components/dashboard/gis/GISMap.jsx';

const INITIAL_FILTERS = {
  ministry: "",
  donor: "",
  region: "",
  district: "",
  sector: "",
  status: "",
  year: "",
};

function normalize(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      value._id ||
        value.id ||
        value.name ||
        value.title ||
        ""
    );
  }

  return String(value);
}

function matchesReference(value, selected) {
  if (!selected) return true;

  if (Array.isArray(value)) {
    return value.some((item) =>
      matchesReference(item, selected)
    );
  }

  if (typeof value === "object" && value) {
    return (
      String(value._id || value.id || "") ===
        String(selected) ||
      String(value.name || value.title || "")
        .toLowerCase() ===
        String(selected).toLowerCase()
    );
  }

  return (
    String(value).toLowerCase() ===
    String(selected).toLowerCase()
  );
}

export default function ProjectMap({
  features = [],
  regions = [],
  districts = [],
  ministries = [],
  donors = [],
}) {
  const [search, setSearch] = useState("");

  const [filters, setFilters] =
    useState(INITIAL_FILTERS);

  const filteredFeatures = useMemo(() => {
    const query = search.trim().toLowerCase();

    return features.filter((feature) => {
      const project = feature?.properties || {};

      const searchableText = [
        project.projectName,
        project.projectCode,
        project.organization,
        normalize(project.ministry),
        normalize(project.leadMinistry),
        project.sector,
        normalize(project.region),
        normalize(project.district),
        project.village,
        normalize(project.donor),
        project.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesRegion =
        matchesReference(
          project.regionId ?? project.region,
          filters.region
        );

      const matchesDistrict =
        matchesReference(
          project.districtId ?? project.district,
          filters.district
        );

      const matchesMinistry =
        matchesReference(
          project.ministryId ??
            project.leadMinistryId ??
            project.ministry ??
            project.leadMinistry,
          filters.ministry
        );

      const matchesDonor =
        matchesReference(
          project.donorId ??
            project.donorIds ??
            project.donor ??
            project.donors,
          filters.donor
        );

      const matchesSector =
        !filters.sector ||
        normalize(project.sector).toLowerCase() ===
          filters.sector.toLowerCase();

      const matchesStatus =
        !filters.status ||
        normalize(project.status).toLowerCase() ===
          filters.status.toLowerCase();

      const projectYear =
        project.year ||
        project.startYear ||
        (project.startDate
          ? new Date(project.startDate)
              .getFullYear()
              .toString()
          : "");

      const matchesYear =
        !filters.year ||
        String(projectYear) ===
          String(filters.year);

      return (
        matchesSearch &&
        matchesRegion &&
        matchesDistrict &&
        matchesMinistry &&
        matchesDonor &&
        matchesSector &&
        matchesStatus &&
        matchesYear
      );
    });
  }, [features, search, filters]);

  return (
    <div className="space-y-5">
      <GISStatistics
        features={filteredFeatures}
      />

      <GISSearch
        value={search}
        onChange={setSearch}
      />

      <GISFilters
        filters={filters}
        setFilters={setFilters}
        regions={regions}
        districts={districts}
        ministries={ministries}
        donors={donors}
      />

      <GISMap
        features={filteredFeatures}
        height="650px"
      />

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Showing{" "}
          <strong className="text-slate-700">
            {filteredFeatures.length}
          </strong>{" "}
          project
          {filteredFeatures.length === 1
            ? ""
            : "s"}
        </span>

        <span>
          {features.length} total projects
        </span>
      </div>
    </div>
  );
}