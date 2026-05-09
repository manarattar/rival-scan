import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

export const getCompetitors = () => api.get("/competitors");
export const createCompetitor = (data) => api.post("/competitors", data);
export const deleteCompetitor = (id) => api.delete(`/competitors/${id}`);
export const refreshCompetitor = (id) => api.post(`/competitors/${id}/refresh`);

export const getUpdates = (params) => api.get("/updates", { params });

export const runGapAnalysis = (data) => api.post("/analysis/gaps", data);
