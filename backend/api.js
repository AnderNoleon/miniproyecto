// frontend/src/api.js

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// Interceptor: adjunta el token JWT a cada petición
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getTasks   = ()     => API.get("tasks/");
export const createTask = (task) => API.post("tasks/", task);
export const deleteTask = (id)   => API.delete(`tasks/${id}/`);
