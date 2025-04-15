import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

console.log("✅ AuthContext file loaded");

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Automatically check token and fetch user on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5173/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log("📦 Auto-login success:", res.data);
          setUser(res.data.user);
        })
        .catch((err) => {
          console.warn("⚠️ Token invalid or expired");
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = ({ user, token }) => {
    console.log("🔐 Logging in user:", user);
    localStorage.setItem("token", token);
    setUser(user);
  };

  const logout = () => {
    console.log("🚪 Logging out");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  console.log("🧠 useAuth() hook called:", context);
  if (!context) {
    console.error("❌ useAuth called outside of AuthProvider");
  }
  return context;
}
