import { createContext, useContext, useState, useEffect } from "react";
import { loginService, getProfile } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getProfile()
        .then((res) => {
          setAdmin(res.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (officialEmail, password) => {
    const res = await loginService(officialEmail, password);
    localStorage.setItem("token", res.data.token);
    setAdmin(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
