import { useState } from "react";
import { AIProvider } from "@/components/AI/AIProvider";
import AICoachOverlay from "@/components/AI/AICoachOverlay";
import BottomNav from "@/components/BottomNav";
import type { TabType } from "@/components/BottomNav";
import HomeTab from "@/pages/HomeTab";
import WorkoutTab from "@/pages/WorkoutTab";
import DietTab from "@/pages/DietTab";
import ReportTab from "@/pages/ReportTab";
import MyPageTab from "@/pages/MyPageTab";
import LoginPage from "@/pages/LoginPage";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("home");

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
        
        <AICoachOverlay />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </AIProvider>
  );
}