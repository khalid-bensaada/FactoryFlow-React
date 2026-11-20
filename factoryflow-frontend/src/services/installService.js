import api from "./api";

export const checkInstallationStatus = async () => {
  const response = await api.get("/installation/status");
  return response.data;
};

export const setupSystem = async (adminData) => {
  const response = await api.post("/installation/setup", adminData);
  return response.data;
};
