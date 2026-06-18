import API from "./api";

export const loginService = (officialEmail, password) =>
  API.post("/admin/login", { officialEmail, password });

export const getProfile = () =>
  API.get("/admin/profile");
