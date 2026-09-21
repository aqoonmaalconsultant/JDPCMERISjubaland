import api from "./api";

export async function getGISProjects(params = {}) {
  const response = await api.get("/projects/gis", {
    params,
  });

  return response.data;
}

export async function getGISFilterOptions() {
  const [
    regionsResponse,
    districtsResponse,
    ministriesResponse,
    donorsResponse,
  ] = await Promise.all([
    api.get("/regions"),
    api.get("/districts"),
    api.get("/ministries"),
    api.get("/donors"),
  ]);

  return {
    regions:
      regionsResponse.data?.data ||
      regionsResponse.data ||
      [],

    districts:
      districtsResponse.data?.data ||
      districtsResponse.data ||
      [],

    ministries:
      ministriesResponse.data?.data ||
      ministriesResponse.data ||
      [],

    donors:
      donorsResponse.data?.data ||
      donorsResponse.data ||
      [],
  };
}