import { User, Settings, Bell, LogOut, ChevronRight, ChevronDown, Bot } from "lucide-react";
import { useAI } from "@/components/AI/AIProvider";
import type { PersonaType } from "@/components/AI/AIProvider";
import { useEffect, useState } from "react";
import { workoutsService, mealsService, routinesService } from "../services/api";

interface MyPageTabProps {
  onLogout: () => void;
}

export default function MyPageTab({ onLogout }: MyPageTabProps) {
  const { persona, setPersona } = useAI();
  const [stats, setStats] = useState({ days: 12, streak: 3, weekCount: 4 });

  useEffect(() => {
    Promise.all([workoutsService.getWorkouts(), mealsService.getMeals(), routinesService.getRoutines()])
      .then(([wRes, mRes, rRes]) => {
        // 임시: 백엔드가 제공하는 값을 사용하도록 변경 가능
        setStats({
          days: Array.isArray(wRes?.data) ? wRes.data.length : stats.days,
          streak: stats.streak,
          weekCount: Array.isArray(wRes?.data) ? Math.min(7, wRes.data.length) : stats.weekCount,
        });
      })
      .catch(() => {
        // 실패해도 기존 UI 유지
      });
  }, []);

  return (
    <div className="pb-32 px-6 pt-10 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">마이페이지</h1>
      </header>

      {/* Profile Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl">
          😎
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">김헬스</h2>
          <p className="text-sm text-slate-500 font-medium">오늘도 득근하세요! 💪</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-bold mb-1">운동일수</p>
          <p className="text-xl font-extrabold text-slate-900">12<span className="text-xs font-medium text-slate-400 ml-0.5">일</span></p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-bold mb-1">연속</p>
          <p className="text-xl font-extrabold text-blue-600">3<span className="text-xs font-medium text-blue-400 ml-0.5">일</span></p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-bold mb-1">이번주</p>
          <p className="text-xl font-extrabold text-slate-900">4<span className="text-xs font-medium text-slate-400 ml-0.5">회</span></p>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="w-full flex items-center justify-between p-5 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Bot size={20} /></div>
            <span className="font-bold text-slate-700">AI 코치 스타일</span>
          </div>
          <div className="relative">
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as PersonaType)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
            >
              <option value="friendly">🌱 메이트</option>
              <option value="bestie">🔥 찐친</option>
              <option value="strict">⚡️ 관장님</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
          </div>
        </div>
        <button className="w-full flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><User size={20} /></div>
            <span className="font-bold text-slate-700">내 정보 수정</span>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
        <button className="w-full flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Bell size={20} /></div>
            <span className="font-bold text-slate-700">알림 설정</span>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
        <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Settings size={20} /></div>
            <span className="font-bold text-slate-700">앱 설정</span>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
      </div>

      <button 
        onClick={onLogout}
        className="w-full mt-6 flex items-center justify-center gap-2 p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors"
      >
        <LogOut size={20} />
        로그아웃
      </button>
    </div>
  );
}