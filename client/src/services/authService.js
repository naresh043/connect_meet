import httpClient from "./httpClient";

const authService = {
  register: async (userData) => {
    const response = await httpClient.post("/auth/register", userData);

    return response.data;
  },

  login: async (credentials) => {
    const response = await httpClient.post("/auth/login", credentials);

    return response.data;
  },

  getCurrentUser: async () => {
    const response = await httpClient.get("/auth/me");

    return response.data;
  },
};

export default authService;
