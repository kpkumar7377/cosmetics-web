import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // sends the refreshToken httpOnly cookie
});

// Attach the access token (kept in localStorage) to every request.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Endpoints that should never trigger token refresh attempts
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/forgot-password") ||
      originalRequest.url?.includes("/auth/reset-password") ||
      originalRequest.url?.includes("/auth/refresh");

    // If auth failed or refresh endpoint itself failed with 401, reject immediately
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // If 401 Unauthorized and request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If there's no token in localStorage, the user is just a guest. Don't try to refresh.
      if (typeof window !== "undefined" && !localStorage.getItem("token")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        if (data?.token) {
          localStorage.setItem("token", data.token);
          queue.forEach(({ resolve }) => resolve(data.token));
          queue = [];
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        } else {
          throw new Error("No token returned from refresh endpoint");
        }
      } catch (refreshError) {
        queue.forEach(({ reject }) => reject(refreshError));
        queue = [];
        localStorage.removeItem("token");

        // ❌ REMOVED: window.location.href = '/login'
        // Letting React router handle redirects prevents random navigation kicks.

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
