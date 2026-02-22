import type { AxiosInstance } from "axios";
import axios from "axios";

// 기본 API URL 설정 (환경변수 사용)
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

// API 인스턴스 생성
const api: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 액세스 토큰을 Authorization 헤더에 자동으로 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 액세스 토큰 만료 시 로그아웃 처리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============ 인증 관련 API ============

export const authService = {
  /**
   * 회원가입
   */
  signup: (email: string, username: string, password: string) =>
    api.post("/auth/signup", { email, username, password }),

  /**
   * 로그인
   */
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  /**
   * 토큰 갱신
   */
  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh", { refresh_token: refreshToken }),

  /**
   * 아이디 찾기
   */
  findId: (username: string, email: string) =>
    api.post("/auth/find-id", { username, email }),

  /**
   * 비밀번호 찾기
   */
  findPassword: (email: string) =>
    api.post("/auth/find-password", { email }),

  /**
   * 비밀번호 재설정
   */
  resetPassword: (token: string, newPassword: string) =>
    api.post("/auth/reset-password", { token, new_password: newPassword }),

  /**
   * 현재 로그인한 사용자 정보 조회
   */
  getCurrentUser: (token: string) =>
    api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  /**
   * 로그아웃 (클라이언트 사이드)
   */
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
};

// ============ 운동 관련 API ============

export const workoutsService = {
  getWorkouts: () => api.get("/workouts/"),
  getWorkout: (id: number) => api.get(`/workouts/${id}`),
  createWorkout: (payload: any) => api.post(`/workouts/`, payload),
  updateWorkout: (id: number, payload: any) => api.put(`/workouts/${id}`, payload),
  deleteWorkout: (id: number) => api.delete(`/workouts/${id}`),
};

// ============ 식단 관련 API ============

export const mealsService = {
  getMeals: () => api.get(`/meals/`),
  createMeal: (payload: any) => api.post(`/meals/`, payload),
};

// ============ 루틴 관련 API ============

export const routinesService = {
  getRoutines: () => api.get(`/routines/`),
  createRoutine: (payload: any) => api.post(`/routines/`, payload),
};

export default api;

