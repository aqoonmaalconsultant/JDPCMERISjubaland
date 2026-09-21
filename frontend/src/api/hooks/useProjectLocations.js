import { useQuery } from "@tanstack/react-query";

import {
  getLocations,
  getLocationStatistics,
} from "../api/projectLocation";

export function useProjectLocations(filters) {
  return useQuery({
    queryKey: ["project-locations", filters],
    queryFn: async () => {
      const { data } =
        await getLocations(filters);

      return data.data;
    },
  });
}

export function useLocationStatistics() {
  return useQuery({
    queryKey: ["location-statistics"],
    queryFn: async () => {
      const { data } =
        await getLocationStatistics();

      return data.data;
    },
  });
}