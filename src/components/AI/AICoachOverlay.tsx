import { useAI } from "./AIProvider";
import type { PersonaType } from "./AIProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageCircle } from "lucide-react";

const PERSONA_STYLES: Record<PersonaType, { color: string; icon: string }> = {
  friendly: { color: "bg-gradient-to-r from-green-400 to-emerald-600", icon: "🌱" },
  bestie: { color: "bg-gradient-to-r from-yellow-400 to-orange-500", icon: "🔥" },
  strict: { color: "bg-gradient-to-r from-red-500 to-rose-700", icon: "⚡️" },
};

export default function AICoachOverlay() {
  const { persona, isRescheduleModalOpen, closeRescheduleModal, nudgeMessage } = useAI();
  const style = PERSONA_STYLES[persona];

  return (
    <>
      {/* 1. AI Nudge (Top Notification) */}
      <AnimatePresence>
        {nudgeMessage && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
          >
            <div className={`${style.color} text-white px-6 py-3 rounded-full shadow-xl shadow-black/10 flex items-center gap-2 mt-4`}>
              <Bot size={20} />
              <span className="font-medium text-sm">{nudgeMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Reschedule Modal */}
      <AnimatePresence>
        {isRescheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-2 ${style.color}`} />
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                {style.icon} 일정 조정
              </h3>
              <p className="text-gray-600 mb-6">
                {persona === "strict"
                  ? "변명은 필요 없다. 언제로 미룰 텐가?"
                  : persona === "bestie"
                  ? "오늘 무슨 일 있어? 그럼 내일은 꼭 하는 거다?"
                  : "오늘 많이 바쁘신가요? 무리하지 말고 내일로 옮겨드릴까요?"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeRescheduleModal}
                  className="flex-1 py-3.5 bg-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    closeRescheduleModal();
                  }}
                  className={`flex-1 py-3.5 rounded-2xl font-bold text-white shadow-lg ${style.color}`}
                >
                  내일로 변경
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Global FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-28 right-6 w-14 h-14 ${style.color} rounded-full shadow-xl shadow-blue-500/20 flex items-center justify-center text-white z-40`}
      >
        <MessageCircle size={28} />
      </motion.button>
    </>
  );
}