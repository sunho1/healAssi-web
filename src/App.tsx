import { useState, useRef, useEffect } from "react";
import { AIProvider } from "@/components/AI/AIProvider";
import BottomNav from "@/components/BottomNav";
import type { TabType } from "@/components/BottomNav";
import HomeTab from "@/pages/HomeTab";
import WorkoutTab from "@/pages/WorkoutTab";
import DietTab from "@/pages/DietTab";
import ReportTab from "@/pages/ReportTab";
import MyPageTab from "@/pages/MyPageTab";
import LoginPage from "@/pages/LoginPage";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "안녕하세요! 오늘 운동 계획은 어떻게 되시나요? 💪" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = { role: 'user' as const, text: inputMessage };
    setMessages(prev => [...prev, newMsg]);
    setInputMessage("");

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "좋은 목표네요! 제가 도와드릴게요. 🔥" 
      }]);
    }, 1000);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <AIProvider>
      <main className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-hidden">
        {activeTab === "home" && <HomeTab />}
        {activeTab === "workout" && <WorkoutTab />}
        {activeTab === "diet" && <DietTab />}
        {activeTab === "report" && <ReportTab />}
        {activeTab === "my" && <MyPageTab onLogout={() => setIsLoggedIn(false)} />}
        
        {/* Chat Overlay */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-28 right-4 left-4 z-50 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-w-[calc(100%-2rem)] md:max-w-[380px] md:right-[calc(50%-190px+1rem)] h-[500px] flex flex-col"
            >
              {/* Header */}
              <div className="bg-slate-900 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white">
                  <Bot size={20} />
                  <span className="font-bold">HealAssi Coach</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button 
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                >
                  <Send size={20} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-slate-900 text-white rounded-full shadow-lg shadow-slate-900/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </AIProvider>
  );
}