import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LogOut,
  User,
  Calendar,
  TrendingUp,
  Clock,
  Shield,
} from "lucide-react";

interface UserInfo {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
}

/**
 * 대시보드 페이지
 * - 로그인 후 메인 화면
 * - 사용자 정보 및 통계 표시
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로그인한 사용자 정보 로드
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
    setLoading(false);
  }, []);

  /**
   * 로그아웃 처리
   */
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <p className="text-slate-600 font-medium mb-6">
            사용자 정보를 찾을 수 없습니다.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-slate-200 sticky top-0 z-50"
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">HealAssi</h1>
            <p className="text-sm text-slate-500 font-medium">
              AI와 함께하는 건강한 습관
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition"
          >
            <LogOut size={18} />
            <span>로그아웃</span>
          </button>
        </div>
      </motion.div>

      {/* 메인 콘텐츠 */}
      <motion.div
        className="max-w-4xl mx-auto px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 환영 인사 */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            안녕하세요, {user.username}님! 👋
          </h2>
          <p className="text-slate-600 mt-2">
            오늘 하루도 건강하게 시작하세요.
          </p>
        </motion.div>

        {/* 사용자 정보 카드 */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 개인 정보 */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <User size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">개인 정보</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">
                  이메일
                </p>
                <p className="text-slate-900 font-bold break-all">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">
                  이름
                </p>
                <p className="text-slate-900 font-bold">{user.username}</p>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    계정 상태
                  </p>
                  <p
                    className={`py-1 px-3 rounded-lg text-xs font-bold text-center ${
                      user.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.is_active ? "활성" : "비활성"}
                  </p>
                </div>

                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    인증 상태
                  </p>
                  <p
                    className={`py-1 px-3 rounded-lg text-xs font-bold text-center ${
                      user.is_verified
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {user.is_verified ? "인증됨" : "미인증"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 계정 활동 */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                <Clock size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">계정 활동</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">
                  가입일
                </p>
                <p className="text-slate-900 font-bold">
                  {new Date(user.created_at).toLocaleDateString("ko-KR")}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">
                  마지막 로그인
                </p>
                <p className="text-slate-900 font-bold">
                  {user.last_login
                    ? new Date(user.last_login).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "아직 없음"}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-xs text-blue-700 font-medium mt-1">
                    총 운동
                  </p>
                </div>
                <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-xs text-green-700 font-medium mt-1">
                    식단 기록
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 기능 카드들 */}
        <motion.div variants={itemVariants} className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">주요 기능</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 운동 계획 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate("/workout")}
              className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 text-left hover:border-blue-200 hover:shadow-blue-200/50 transition-all"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-3">
                <TrendingUp size={24} />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">운동 계획</h4>
              <p className="text-sm text-slate-600">
                나만의 운동 루틴을 관리하세요
              </p>
            </motion.button>

            {/* 식단 관리 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate("/diet")}
              className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 text-left hover:border-green-200 hover:shadow-green-200/50 transition-all"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-3">
                <Calendar size={24} />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">식단 관리</h4>
              <p className="text-sm text-slate-600">
                영양 있는 식단을 기록하세요
              </p>
            </motion.button>

            {/* AI 코치 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 text-left hover:border-purple-200 hover:shadow-purple-200/50 transition-all"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-3">
                <Shield size={24} />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">AI 코치</h4>
              <p className="text-sm text-slate-600">
                AI와 함께 상담받으세요
              </p>
            </motion.button>
          </div>
        </motion.div>

        {/* 통계 섹션 (향후 확장) */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6">이번 주 통계</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "총 운동 시간", value: "0분", icon: "🏃" },
              { label: "칼로리 소모", value: "0kcal", icon: "🔥" },
              { label: "운동 일수", value: "0일", icon: "📅" },
              { label: "식단 기록", value: "0건", icon: "🍎" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl mb-2">{stat.icon}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
