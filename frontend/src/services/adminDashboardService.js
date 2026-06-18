import adminApi from "./adminApi";

export const getDashboardStats = () => adminApi("/admin-dashboard/stats");
