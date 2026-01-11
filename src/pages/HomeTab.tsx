import React from "react";
import { useAI } from "@/components/AI/AIProvider";
import type { PersonaType } from "@/components/AI/AIProvider";
import { motion } from "framer-motion";
import { Dumbbell, CalendarX, ChevronRight, ChevronDown } from "lucide-react";

const PERSONA_MESSAGES = {
  friendly: "오늘도 건강한 하루 보내세요! 조금만 더 힘내봐요 🌱",
  bestie: "야, 오늘 운동 안 하면 손해인 거 알지? 딱 30분만 하자 🔥",
  strict: "나약한 소리 하지 마라. 당장 쇠질 시작해. ⚡️",
};

export default function HomeTab() {
  const { persona, setPersona, openRescheduleModal, triggerNudge } = useAI();

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (val > 0 && val < 40) {
      if (persona === "strict") triggerNudge("장난하나? 무게 더 올려라.");
      else if (persona === "bestie") triggerNudge("에이, 그거 들고 운동이 돼? 더 꽂자!");
      else triggerNudge("워밍업인가요? 무리하지 마세요!");
    } else if (val >= 40) {
      triggerNudge("오! 훌륭해요! 자극 제대로 오겠는데요?");
    }
  };

  return (
    <div className="pb-32 px-6 pt-10 bg-slate-50 min-h-screen text-left font-sans selection:bg-blue-100">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">HealAssi</h1>
          <p className="text-xs text-slate-500 font-medium mt-1 ml-0.5">AI Personal Trainer</p>
        </div>
        <div className="relative group">
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value as PersonaType)}
            className="appearance-none bg-white border border-slate-200 rounded-full pl-4 pr-10 py-2 text-sm font-bold text-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-blue-300 cursor-pointer"
          >
            <option value="friendly">🌱 메이트</option>
            <option value="bestie">🔥 찐친</option>
            <option value="strict">⚡️ 관장님</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
        </div>
      </header>

      <motion.div
        key={persona}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-3xl shadow-sm border mb-8 flex items-start gap-4 relative overflow-hidden transition-colors duration-500 ${
          persona === 'friendly' ? 'bg-green-50/80 border-green-100' :
          persona === 'bestie' ? 'bg-orange-50/80 border-orange-100' :
          'bg-red-50/80 border-red-100'
        }`}
      >
        <div className="text-2xl">
          {persona === "friendly" ? "🥰" : persona === "bestie" ? "😎" : "👹"}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500 mb-1">AI 코치의 한마디</p>
          <p className="text-gray-800 font-medium leading-snug">
            {PERSONA_MESSAGES[persona]}
          </p>
        </div>
      </motion.div>

      <section className="mb-10">
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-xl font-bold text-slate-900">오늘의 루틴</h2>
          <span className="text-sm text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full">하체 하는 날</span>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <Dumbbell size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">스쿼트 & 레그프레스</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">예상 소요시간 50분</p>
              </div>
            </div>
            <button className="text-slate-300 hover:text-slate-500 transition-colors">
              <ChevronRight />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={openRescheduleModal}
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              <CalendarX size={18} />
              오늘 못 가요
            </button>
            <button className="py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all active:scale-95">
              운동 시작
            </button>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3 text-slate-900">빠른 기록</h2>
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              스쿼트 1세트
            </span>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="number"
                placeholder="kg"
                className="w-full bg-slate-50 rounded-2xl px-4 py-4 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 transition-all placeholder:text-slate-300"
                onBlur={handleWeightChange}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">kg</span>
            </div>
            <div className="flex-1 relative">
              <input
                type="number"
                placeholder="회"
                className="w-full bg-slate-50 rounded-2xl px-4 py-4 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 transition-all placeholder:text-slate-300"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">회</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}