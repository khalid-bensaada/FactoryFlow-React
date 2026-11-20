import api from "./api";

export const getOperators = async () => {
  const response = await api.get("/users", { params: { role: "Operator" } });
  return response.data;
};
