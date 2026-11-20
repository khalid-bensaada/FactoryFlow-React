import api from "./api";

export const getAll = async (params) => {
  const response = await api.get("/orders", { params });
  return response.data;
};

export const getMyOrders = async (params) => {
  const response = await api.get("/orders/my", { params });
  return response.data;
};

export const getHistory = async (params) => {
  const response = await api.get("/orders/history", { params });
  return response.data;
};

export const getById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const create = async (data) => {
  const response = await api.post("/orders", data);
  return response.data;
};

export const update = async (id, data) => {
  const response = await api.put(`/orders/${id}`, data);
  return response.data;
};

export const cancel = async (id) => {
  const response = await api.patch(`/orders/${id}/cancel`);
  return response.data;
};

export const start = async (id) => {
  const response = await api.patch(`/orders/${id}/start`);
  return response.data;
};

export const finish = async (id) => {
  const response = await api.patch(`/orders/${id}/finish`);
  return response.data;
};
