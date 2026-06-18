import API from "./api";

export const addBusService = (data) => API.post("/buses/add", data);

export const getBusesService = (params) => API.get("/buses", { params });

export const getBusByIdService = (id) => API.get(`/buses/${id}`);

export const getBusByNumberService = (busNumber) =>
  API.get(`/buses/number/${busNumber}`);

export const updateBusService = (id, data) => API.put(`/buses/${id}`, data);

export const deleteBusService = (id) => API.delete(`/buses/${id}`);
