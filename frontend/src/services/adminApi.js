const adminApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem("adminToken");
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`/api${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/admin-login";
    }
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export default adminApi;
