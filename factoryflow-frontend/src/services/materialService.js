import api from "./api";

export const getAll = async () => {
  const response = await api.get("/materials");
  return response.data;
};

export const create = async (data) => {
  const response = await api.post("/materials", data);
  return response.data;
};

export const update = async (id, data) => {
  const response = await api.put(`/materials/${id}`, data);
  return response.data;
};

export const addStock = async (id, quantity) => {
  const response = await api.post(`/materials/${id}/stock`, { quantity });
  return response.data;
};

export const getMovements = async (id) => {
  const response = await api.get(`/materials/${id}/movements`);
  return response.data;
};
