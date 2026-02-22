import { useState } from "react";
import { motion } from "framer-motion";
import { authService } from "../services/api";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    authService
      .login(email, password)
      .then((res) => {
        setLoading(false);
        if (res?.data?.access_token) {
          // 개발용 간단 처리: 토큰을 로컬스토리지에 저장
          localStorage.setItem("access_token", res.data.access_token);
          onLogin();
        } else {
          alert("로그인 실패");
        }
      })
      .catch(() => {
        setLoading(false);
        // 기존 동작: dev 테스트 계정 안내
        if (email === "test" && password === "test") {
          onLogin();
        } else {
          alert("개발용 테스트 계정입니다.\nID: test\nPW: test");
        }
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">HealAssi</h1>
        <p className="text-slate-500 font-medium">AI와 함께하는 건강한 습관</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">이메일</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
              placeholder="test"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
              placeholder="test"
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all"
          >
            로그인
          </button>
        </form>
        <div className="mt-6 text-center">
          <button className="text-sm text-slate-400 font-medium hover:text-slate-600 transition-colors">
            계정이 없으신가요? 회원가입
          </button>
        </div>
      </motion.div>
    </div>
  );
}