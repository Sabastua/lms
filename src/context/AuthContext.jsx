import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest, getStoredToken, setStoredToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest("/api/auth/me")
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setStoredToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function login(email, password) {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    setStoredToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register({ name, email, password, role, bio }) {
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, bio })
    });
    setStoredToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function updateProfile({ name, bio }) {
    const data = await apiRequest("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name, bio })
    });
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setStoredToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
