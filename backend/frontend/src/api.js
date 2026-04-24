// frontend/src/api.js

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// ── Interceptor: adjunta el token JWT a cada petición ──────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ───────────────────────────────────────────────────────────────────
export const login   = (credentials) => API.post("token/", credentials);
export const refresh = (data)        => API.post("token/refresh/", data);

// ── Tareas ─────────────────────────────────────────────────────────────────
/**
 * getTasks({ search, completed, page })
 *   search    : string           → busca en el título
 *   completed : "true" | "false" → filtra por estado
 *   page      : number           → número de página
 */
export const getTasks = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null)
  );
  return API.get("tasks/", { params: clean });
};

export const createTask = (task) => API.post("tasks/", task);
export const deleteTask = (id)   => API.delete(`tasks/${id}/`);
