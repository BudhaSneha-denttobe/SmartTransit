import adminApi from "./adminApi";

export const loginAdmin = (officialEmail, password) =>
  adminApi("/admin-auth/login", {
    method: "POST",
    body: JSON.stringify({ officialEmail, password }),
  });

export const getAdminProfile = () => adminApi("/admin-auth/profile");
