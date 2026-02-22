import { Utensils, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { mealsService } from "../services/api";

export default function DietTab() {
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    mealsService.getMeals()
      .then((res) => {
        if (res && res.data) {
          setMeals(res.data);
          console.log("meals from API:", res.data);
        } else {
          setMeals([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("meals fetch failed", err);
        setError("식단 정보를 불러올 수 없습니다.");
        setMeals([]);
        setLoading(false);
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

      {loading && (
        <div className="text-center py-12">
          <p className="text-slate-500 font-medium">식단 정보를 로드 중입니다...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {!loading && meals.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-slate-500 font-medium">등록된 식단이 없습니다.</p>
        </div>
      )}

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