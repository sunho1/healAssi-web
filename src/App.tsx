import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// 페이지 컴포넌트
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import FindIdPage from "@/pages/FindIdPage";
import FindPasswordPage from "@/pages/FindPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import HomeTab from "@/pages/HomeTab";
import WorkoutTab from "@/pages/WorkoutTab";
import DietTab from "@/pages/DietTab";
import ReportTab from "@/pages/ReportTab";
import MyPageTab from "@/pages/MyPageTab";

/**
 * ProtectedRoute: 인증이 필요한 라우트를 보호하는 컴포넌트
 * - 토큰이 없으면 로그인 페이지로 리다이렉트
 */
function ProtectedRoute({
  Component,
}: {
  Component: React.ComponentType<any>;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  return isAuthenticated ? <Component /> : <Navigate to="/login" replace />;
}

/**
 * 메인 앱 컴포넌트
 * React Router를 사용한 SPA 라우팅
 */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* 인증 관련 라우트 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/find-id" element={<FindIdPage />} />
        <Route path="/find-password" element={<FindPasswordPage />} />

        {/* 보호된 라우트 - 인증 필요 */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute Component={DashboardPage} />}
        />
        <Route path="/home" element={<ProtectedRoute Component={HomeTab} />} />
        <Route path="/workout" element={<ProtectedRoute Component={WorkoutTab} />} />
        <Route path="/diet" element={<ProtectedRoute Component={DietTab} />} />
        <Route path="/report" element={<ProtectedRoute Component={ReportTab} />} />
        <Route
          path="/mypage"
          element={<ProtectedRoute Component={MyPageTab} />}
        />

        {/* 기본 리다이렉트 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 페이지 */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">
                  404
                </h1>
                <p className="text-slate-600 mb-6">페이지를 찾을 수 없습니다.</p>
                <a
                  href="/dashboard"
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                >
                  대시보드로 돌아가기
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}