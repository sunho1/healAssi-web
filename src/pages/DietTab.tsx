import { Utensils, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { mealsService } from "../services/api";

export default function DietTab() {
  const [meals, setMeals] = useState<any[]>([
    { id: 1, type: "아침", menu: "오트밀, 계란 2개", kcal: 450, time: "08:00" },
    { id: 2, type: "점심", menu: "닭가슴살 샐러드", kcal: 320, time: "12:30" },
    { id: 3, type: "저녁", menu: "현미밥, 불고기", kcal: 600, time: "19:00" },
  ]);

  useEffect(() => {
    mealsService.getMeals()
      .then((res) => {
        if (res && res.data) setMeals(res.data);
      })
      .catch((err) => {
        console.debug("meals fetch failed (dev fallback used)", err);
      });
  }, []);

  return (
    <div className="pb-32 px-6 pt-10 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">오늘의 식단</h1>
        <button className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors">
          <Camera size={24} />
        </button>
      </header>

      <div className="space-y-4">
        {meals.map((meal) => (
          <div key={meal.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                meal.type === '아침' ? 'bg-yellow-100 text-yellow-700' :
                meal.type === '점심' ? 'bg-orange-100 text-orange-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {meal.type}
              </span>
              <span className="text-xs text-slate-400 font-medium">{meal.time}</span>
            </div>
            <div className="flex items-center gap-3">
              <Utensils size={18} className="text-slate-300" />
              <h3 className="font-bold text-slate-800 text-lg">{meal.menu}</h3>
            </div>
            <p className="text-right text-sm font-bold text-slate-500 mt-2">{meal.kcal} kcal</p>
          </div>
        ))}
      </div>
    </div>
  );
}