import axios from "axios";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
};

export const workoutsService = {
  getWorkouts: () => api.get("/workouts/"),
  getWorkout: (id: number) => api.get(`/workouts/${id}`),
  createWorkout: (payload: any) => api.post(`/workouts/`, payload),
  updateWorkout: (id: number, payload: any) => api.put(`/workouts/${id}`, payload),
  deleteWorkout: (id: number) => api.delete(`/workouts/${id}`),
};

export const mealsService = {
  getMeals: () => api.get(`/meals/`),
  createMeal: (payload: any) => api.post(`/meals/`, payload),
};

export const routinesService = {
  getRoutines: () => api.get(`/routines/`),
  createRoutine: (payload: any) => api.post(`/routines/`, payload),
};

export default api;
