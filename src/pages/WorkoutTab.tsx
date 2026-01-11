import { Dumbbell, Plus } from "lucide-react";

export default function WorkoutTab() {
  const workouts = [
    { id: 1, name: "바벨 스쿼트", sets: "4세트", reps: "10-12회", weight: "60kg" },
    { id: 2, name: "레그 프레스", sets: "3세트", reps: "15회", weight: "120kg" },
    { id: 3, name: "런지", sets: "3세트", reps: "20회", weight: "맨몸" },
  ];

  return (
    <div className="pb-32 px-6 pt-10 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">운동 계획</h1>
        <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
          <Plus size={24} />
        </button>
      </header>

      <div className="space-y-4">
        {workouts.map((workout) => (
          <div key={workout.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                <Dumbbell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{workout.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {workout.sets} · {workout.reps}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="block font-bold text-blue-600">{workout.weight}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}