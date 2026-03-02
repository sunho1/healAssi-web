import type { AxiosInstance } from "axios";
import axios from "axios";

// 기본 API URL 설정 (환경변수 사용)
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

/**
 * 비밀번호 SHA-256 해싱 (Web Crypto API - 외부 라이브러리 불필요)
 * 평문 비밀번호가 네트워크에 전송되지 않도록 클라이언트에서 해싱 후 전송
 * 백엔드에서 bcrypt로 재해싱하여 저장
 */
async function hashPassword(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/signup");

    // 로그인/회원가입 중 401은 자격증명 오류이므로 리다이렉트 하지 않음
    if (error.response?.status === 401 && !isAuthEndpoint) {
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
   * 회원가입 - 비밀번호 SHA-256 해싱 후 전송
   */
  signup: async (email: string, username: string, password: string) => {
    const hashedPassword = await hashPassword(password);
    return api.post("/auth/signup", { email, username, password: hashedPassword });
  },

  /**
   * 로그인 - 비밀번호 SHA-256 해싱 후 전송
   */
  login: async (email: string, password: string) => {
    const hashedPassword = await hashPassword(password);
    return api.post("/auth/login", { email, password: hashedPassword });
  },

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
  updateRoutine: (id: number, payload: any) => api.put(`/routines/${id}`, payload),
  deleteRoutine: (id: number) => api.delete(`/routines/${id}`),
};

// ============ 날짜별 운동 로그 API ============
// PUT /workout-logs/{date} - upsert (날짜별 완료 여부 + 운동 내용 저장)
// payload: { is_done?: boolean, body_parts?: BodyPartLog[] }

export const workoutLogsService = {
  getLogs: () => api.get(`/workout-logs/`),
  upsertLog: (date: string, payload: { is_done?: boolean; body_parts?: any[] }) =>
    api.put(`/workout-logs/${date}`, payload),
};

export default api;

