import { useState } from "react";
import { AIProvider } from "@/components/AI/AIProvider";
import AICoachOverlay from "@/components/AI/AICoachOverlay";
import BottomNav from "@/components/BottomNav";
import type { TabType } from "@/components/BottomNav";
import HomeTab from "@/pages/HomeTab";
import WorkoutTab from "@/pages/WorkoutTab";
import DietTab from "@/pages/DietTab";
import ReportTab from "@/pages/ReportTab";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("home");

  return (
    <AIProvider>
      <main className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-hidden">
        {activeTab === "home" && <HomeTab />}
        {activeTab === "workout" && <WorkoutTab />}
        {activeTab === "diet" && <DietTab />}
        {activeTab === "report" && <ReportTab />}
        
        <AICoachOverlay />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </AIProvider>
  );
}