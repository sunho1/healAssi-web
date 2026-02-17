import { useState } from "react";
import { Dumbbell, Plus, ChevronLeft, ChevronRight, X, ArrowLeft, LayoutGrid } from "lucide-react";

export default function WorkoutTab() {
  const [isAddRoutineOpen, setIsAddRoutineOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const categories = [
    { id: "3div", name: "3분할", desc: "국민 루틴", color: "bg-orange-100 text-orange-600" },
    { id: "4div", name: "4분할", desc: "체계적인 관리", color: "bg-blue-100 text-blue-600" },
    { id: "5div", name: "5분할", desc: "부위별 집중", color: "bg-purple-100 text-purple-600" },
    { id: "nodiv", name: "무분할", desc: "전신 운동", color: "bg-green-100 text-green-600" },
  ];

  const routines = [
    { 
      id: 1, 
      category: "3div",
      title: "하체 박살내기 🦵", 
      count: 3,
      time: "50분",
      exercises: [
        { name: "바벨 스쿼트", sets: "4세트", reps: "10-12회", weight: "60kg" },
        { name: "레그 프레스", sets: "3세트", reps: "15회", weight: "120kg" },
        { name: "런지", sets: "3세트", reps: "20회", weight: "맨몸" },
      ]
    },
    { 
      id: 2, 
      category: "3div",
      title: "가슴 웅장해지기 💪", 
      count: 2,
      time: "40분",
      exercises: [
        { name: "벤치 프레스", sets: "5세트", reps: "5-8회", weight: "80kg" },
        { name: "인클라인 덤벨 프레스", sets: "4세트", reps: "10-12회", weight: "25kg" },
      ]
    },
    { 
      id: 3, 
      category: "4div",
      title: "등 신이 되는 길 🐢", 
      count: 3,
      time: "45분",
      exercises: [
        { name: "풀업", sets: "5세트", reps: "10회", weight: "맨몸" },
        { name: "렛풀다운", sets: "4세트", reps: "12회", weight: "40kg" },
        { name: "시티드 로우", sets: "4세트", reps: "12회", weight: "40kg" },
      ]
    },
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const activeDays = [2, 5, 8, 12, 15, 19, 22, 26]; // Dummy data for workout days

  const filteredRoutines = selectedCategory 
    ? routines.filter(r => r.category === selectedCategory)
    : routines;

  return (
    <div className="pb-32 px-6 pt-10 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">운동 계획</h1>
      </header>

      {!selectedCategory ? (
        <>
          {!isLibraryOpen ? (
            <>
              {/* Calendar Section - Only visible in main view */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-800 text-lg">2024년 5월</h2>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft size={20} className="text-slate-400" /></button>
                <button className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight size={20} className="text-slate-400" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-4 text-center text-sm mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <div key={day} className="text-slate-400 font-bold text-xs">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-4 text-center text-sm">
              {Array(3).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
              {days.map(day => (
                <button 
                  key={day} 
                  onClick={() => setSelectedDate(day)}
                  className="flex flex-col items-center gap-1 focus:outline-none group"
                >
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold transition-colors ${
                    day === 22 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-slate-700 group-hover:bg-slate-100'
                  }`}>
                    {day}
                  </span>
                  {activeDays.includes(day) && (
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

              {/* Routine Library Button */}
              <button 
                onClick={() => setIsLibraryOpen(true)}
                className="w-full bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all active:scale-98"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <LayoutGrid size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 text-lg">루틴 보관함</h3>
                    <p className="text-sm text-slate-500 font-medium">나만의 루틴을 관리해보세요</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
              </button>
            </>
          ) : (
            /* Split Categories Grid (Moved to separate view) */
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="flex items-center gap-2 mb-6">
                <button 
                  onClick={() => setIsLibraryOpen(false)}
                  className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <ArrowLeft size={24} className="text-slate-700" />
                </button>
                <h3 className="font-bold text-slate-900 text-lg">루틴 보관함</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-left hover:border-blue-200 transition-all active:scale-95"
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${cat.color}`}>
                      <LayoutGrid size={20} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg">{cat.name}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">{cat.desc}</p>
                  </button>
                ))}
                <button
                  onClick={() => setIsAddRoutineOpen(true)}
                  className="bg-slate-50 p-5 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Plus size={20} className="text-slate-400" />
                  </div>
                  <span className="font-bold text-sm text-slate-500">루틴 추가</span>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Routine List View (Sub-page) */
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-2 mb-6">
            <button 
              onClick={() => setSelectedCategory(null)}
              className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-700" />
            </button>
            <h2 className="text-xl font-bold text-slate-900">
              {categories.find(c => c.id === selectedCategory)?.name} 루틴
            </h2>
          </div>

          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-500">총 {filteredRoutines.length}개</span>
            <button 
              onClick={() => setIsAddRoutineOpen(true)}
              className="flex items-center gap-1 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
            >
              <Plus size={16} />
              루틴 추가
            </button>
          </div>

          {filteredRoutines.length > 0 ? (
            filteredRoutines.map((routine) => (
              <div 
                key={routine.id} 
                onClick={() => setSelectedRoutine(routine)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-blue-200 transition-all active:scale-98"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{routine.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                      <span>운동 {routine.count}개</span>
                      <span className="w-0.5 h-2 bg-slate-300 rounded-full"></span>
                      <span>{routine.time}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <ChevronRight size={20} className="text-slate-300" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border border-slate-100 border-dashed">
              <p className="text-slate-400 font-medium mb-2">저장된 루틴이 없어요 🥲</p>
              <p className="text-xs text-slate-400">새로운 루틴을 추가해보세요!</p>
            </div>
          )}
        </div>
      )}

      {/* Add Routine Modal */}
      {isAddRoutineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddRoutineOpen(false)} />
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">새 루틴 만들기</h3>
              <button onClick={() => setIsAddRoutineOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">루틴 이름</label>
                <input type="text" placeholder="예: 등신 되기 프로젝트" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium mb-3">아직 추가된 운동이 없어요</p>
                <button className="text-sm font-bold text-blue-600 bg-white border border-blue-100 px-4 py-2 rounded-xl shadow-sm">
                  + 운동 추가하기
                </button>
              </div>
              
              <button className="w-full py-4 mt-2 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all">
                루틴 생성 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Routine Modal */}
      {selectedRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedRoutine(null)} />
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedRoutine.title}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">총 {selectedRoutine.count}개 운동 · {selectedRoutine.time}</p>
              </div>
              <button onClick={() => setSelectedRoutine(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedRoutine.exercises.map((ex: any, i: number) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm">
                    <Dumbbell size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{ex.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{ex.sets} · {ex.reps} · {ex.weight}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-4 mt-6 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all">
              이 루틴으로 운동 시작
            </button>
          </div>
        </div>
      )}

      {/* Date Log Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedDate(null)} />
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">5월 {selectedDate}일</h3>
                {activeDays.includes(selectedDate) ? (
                  <p className="text-sm text-blue-600 font-bold mt-1">450kcal 소모 🔥</p>
                ) : (
                  <p className="text-sm text-slate-500 font-medium mt-1">운동 기록이 없어요 😴</p>
                )}
              </div>
              <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            {activeDays.includes(selectedDate) && (
              <div className="space-y-3">
                {[
                  { name: "바벨 스쿼트", detail: "4세트 · 10회 · 60kg" },
                  { name: "레그 익스텐션", detail: "3세트 · 15회 · 40kg" },
                  { name: "런지", detail: "3세트 · 20회 · 맨몸" },
                ].map((log, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm">
                      <Dumbbell size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{log.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{log.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}