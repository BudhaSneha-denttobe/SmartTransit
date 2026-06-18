import adminApi from "./adminApi";

export const addBus = (data) =>
  adminApi("/admin-buses/add", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getBuses = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return adminApi(`/admin-buses${query ? `?${query}` : ""}`);
};

export const getBusById = (id) => adminApi(`/admin-buses/${id}`);

export const getBusByNumber = (busNumber) =>
  adminApi(`/admin-buses/number/${busNumber}`);

export const updateBus = (id, data) =>
  adminApi(`/admin-buses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteBus = (id) =>
  adminApi(`/admin-buses/${id}`, { method: "DELETE" });
