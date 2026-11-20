import api from "./api";

export const getAll = async () => {
  const response = await api.get("/products");
  return response.data;
};

export const create = async (data) => {
  const response = await api.post("/products", data);
  return response.data;
};

export const update = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};
