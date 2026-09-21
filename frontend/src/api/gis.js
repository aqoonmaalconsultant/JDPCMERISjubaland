import { useQuery } from '@tanstack/react-query';
import { api } from './client.js';

export function useGisProjects(filters = {}) {
  return useQuery({
    queryKey: ['gis-projects', filters],
    queryFn: async () => {
      const { data } = await api.get('/gis/projects.geojson', { params: filters });
      return data;
    }
  });
}

export function useGisHeatmap(filters = {}) {
  return useQuery({
    queryKey: ['gis-heatmap', filters],
    queryFn: async () => {
      const { data } = await api.get('/gis/heatmap', { params: filters });
      return data.data;
    }
  });
}
