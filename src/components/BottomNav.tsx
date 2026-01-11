import { Home, Dumbbell, Utensils, BarChart2, User } from "lucide-react";

export type TabType = "home" | "workout" | "diet" | "report" | "my";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "홈" },
    { id: "workout", icon: Dumbbell, label: "운동" },
    { id: "diet", icon: Utensils, label: "식단" },
    { id: "report", icon: BarChart2, label: "리포트" },
    { id: "my", icon: User, label: "내 정보" },
  ] as const;

  return (
    <nav className="fixed bottom-0 max-w-md w-full bg-white/80 backdrop-blur-lg border-t border-slate-200/60 flex justify-around py-4 pb-8 z-30 text-slate-400 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`flex flex-col items-center gap-1.5 bg-transparent border-none transition-colors ${
            activeTab === item.id ? "text-blue-600" : "hover:text-slate-600"
          }`}
        >
          <item.icon size={24} />
          <span className="text-[10px] font-bold">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}