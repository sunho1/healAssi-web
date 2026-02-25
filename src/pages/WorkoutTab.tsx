import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Plus, Pencil, Trash2, Dumbbell } from "lucide-react";
import { routinesService, workoutsService } from "../services/api";

// 카테고리별 색상
const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "3div":  { bg: "bg-orange-50",  text: "text-orange-600",  dot: "bg-orange-400"  },
  "4div":  { bg: "bg-blue-50",    text: "text-blue-600",    dot: "bg-blue-400"    },
  "5div":  { bg: "bg-purple-50",  text: "text-purple-600",  dot: "bg-purple-400"  },
  "nodiv": { bg: "bg-green-50",   text: "text-green-600",   dot: "bg-green-400"   },
};

const CATEGORY_LABELS: Record<string, string> = {
  "3div": "3분할",
  "4div": "4분할",
  "5div": "5분할",
  "nodiv": "무분할",
};

const CATEGORIES = ["3div", "4div", "5div", "nodiv"] as const;
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

interface Routine {
  id: number;
  category: string;
  title: string;
  count: number;
  time: string;
  exercises: Exercise[];
}

interface WorkoutLog {
  id: number;
  name: string;
  date: string;
  sets: number;
  weight: number;
}

const emptyExercise = (): Exercise => ({ name: "", sets: "", reps: "", weight: "" });

export default function WorkoutTab() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);

  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // 폼 상태
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<string>("3div");
  const [formTime, setFormTime] = useState("");
  const [formExercises, setFormExercises] = useState<Exercise[]>([emptyExercise()]);
  const [formLoading, setFormLoading] = useState(false);

  const fetchRoutines = () => {
    routinesService.getRoutines()
      .then(res => { if (res?.data) setRoutines(res.data); })
      .catch(console.error);
  };

  useEffect(() => {
    fetchRoutines();
    workoutsService.getWorkouts()
      .then(res => { if (res?.data) setWorkouts(res.data); })
      .catch(console.error);
  }, []);

  // ── 달력 헬퍼 ─────────────────────────────────────────────

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDay = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : null;

  // 이번 달 날짜별 운동 기록
  const workoutsByDay: Record<number, WorkoutLog[]> = {};
  workouts.forEach(w => {
    if (!w.date) return;
    const d = new Date(w.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!workoutsByDay[day]) workoutsByDay[day] = [];
      workoutsByDay[day].push(w);
    }
  });

  const truncate = (name: string) => name.length > 5 ? name.slice(0, 4) : name;

  // ── 폼 헬퍼 ───────────────────────────────────────────────

  const openAdd = () => {
    setFormTitle("");
    setFormCategory("3div");
    setFormTime("");
    setFormExercises([emptyExercise()]);
    setIsAddOpen(true);
  };

  const openEdit = () => {
    if (!selectedRoutine) return;
    setFormTitle(selectedRoutine.title);
    setFormCategory(selectedRoutine.category);
    setFormTime(selectedRoutine.time);
    setFormExercises(selectedRoutine.exercises.length > 0 ? [...selectedRoutine.exercises] : [emptyExercise()]);
    setIsEditOpen(true);
  };

  const handleExerciseChange = (i: number, field: keyof Exercise, value: string) => {
    setFormExercises(prev => prev.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex));
  };

  const handleSave = async (isEdit: boolean) => {
    if (!formTitle.trim()) return;
    setFormLoading(true);
    try {
      const validExercises = formExercises.filter(e => e.name.trim());
      const payload = {
        category: formCategory,
        title: formTitle.trim(),
        count: validExercises.length,
        time: formTime.trim() || "0분",
        exercises: validExercises,
      };
      if (isEdit && selectedRoutine) {
        await routinesService.updateRoutine(selectedRoutine.id, payload);
      } else {
        await routinesService.createRoutine(payload);
      }
      fetchRoutines();
      setIsAddOpen(false);
      setIsEditOpen(false);
      setSelectedRoutine(null);
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRoutine) return;
    try {
      await routinesService.deleteRoutine(selectedRoutine.id);
      fetchRoutines();
      setShowDeleteConfirm(false);
      setSelectedRoutine(null);
    } catch (e) {
      console.error(e);
    }
  };

  // ── 렌더 ──────────────────────────────────────────────────

  return (
    <div className="pb-32 px-6 pt-10 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">운동 계획</h1>
      </header>

      {/* ── 달력 ── */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-800 text-base">
            {year}년 {month + 1}월
          </h2>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft size={18} className="text-slate-400" />
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 text-center mb-1">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-[11px] font-bold text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7 gap-y-0.5 text-center">
          {/* 첫 날 이전 빈 칸 */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-14" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dayWorkouts = workoutsByDay[day] || [];
            const isToday = day === todayDay;
            const hasWorkout = dayWorkouts.length > 0;

            return (
              <div key={day} className="flex flex-col items-center h-14 pt-1">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                  isToday
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-700"
                }`}>
                  {day}
                </span>

                {hasWorkout ? (
                  <>
                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      isToday ? "bg-blue-400" : "bg-blue-400/50"
                    }`} />
                    <span className={`text-[9px] leading-tight font-medium ${
                      isToday ? "text-blue-600" : "text-slate-400/70"
                    }`}>
                      {truncate(dayWorkouts[0].name)}
                    </span>
                  </>
                ) : (
                  <div className="mt-0.5 h-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 루틴 보관함 ── */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900 mb-4">루틴 보관함</h2>

        {routines.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-10 text-center">
            <p className="text-slate-400 font-medium text-sm">저장된 루틴이 없어요</p>
            <p className="text-xs text-slate-400 mt-1">아래 버튼으로 루틴을 추가해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {routines.map(routine => {
              const color = CATEGORY_COLORS[routine.category] ?? CATEGORY_COLORS["3div"];
              const exerciseNames = routine.exercises.map(e => e.name).filter(Boolean).join(" · ");
              return (
                <button
                  key={routine.id}
                  onClick={() => setSelectedRoutine(routine)}
                  className="w-full bg-white px-4 py-4 rounded-2xl border border-slate-100 shadow-sm text-left hover:border-blue-200 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
                          {CATEGORY_LABELS[routine.category] ?? routine.category}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">{routine.title}</p>
                      {exerciseNames && (
                        <p className="text-xs text-slate-400 mt-1 truncate">{exerciseNames}</p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-slate-300 mt-1 flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 루틴 추가 버튼 */}
        <button
          onClick={openAdd}
          className="w-full mt-4 py-4 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-slate-500 font-bold text-sm hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all"
        >
          <Plus size={18} />
          루틴 추가
        </button>
      </div>

      {/* ── 루틴 상세 바텀시트 ── */}
      {selectedRoutine && !isEditOpen && !showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSelectedRoutine(null)}
          />
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
            {/* 헤더 */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${(CATEGORY_COLORS[selectedRoutine.category] ?? CATEGORY_COLORS["3div"]).bg} ${(CATEGORY_COLORS[selectedRoutine.category] ?? CATEGORY_COLORS["3div"]).text}`}>
                  {CATEGORY_LABELS[selectedRoutine.category] ?? selectedRoutine.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">{selectedRoutine.title}</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  운동 {selectedRoutine.count}개 · {selectedRoutine.time}
                </p>
              </div>
              <button
                onClick={() => setSelectedRoutine(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* 운동 목록 */}
            <div className="overflow-y-auto flex-1 space-y-2 mb-5">
              {selectedRoutine.exercises.map((ex, i) => (
                <div key={i} className="bg-slate-50 px-4 py-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <Dumbbell size={14} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{ex.name}</p>
                    <p className="text-xs text-slate-500">{ex.sets}세트 · {ex.reps}회 · {ex.weight}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
                삭제
              </button>
              <button
                onClick={openEdit}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors"
              >
                <Pencil size={15} />
                수정하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 삭제 확인 ── */}
      {showDeleteConfirm && selectedRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">루틴을 삭제할까요?</h3>
            <p className="text-sm text-slate-500 mb-6">
              "{selectedRoutine.title}" 루틴이 영구적으로 삭제됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 루틴 추가/수정 모달 ── */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
          />
          <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {isEditOpen ? "루틴 수정" : "새 루틴 만들기"}
              </h3>
              <button
                onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* 모달 바디 */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {/* 루틴 이름 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">루틴 이름</label>
                <input
                  type="text"
                  placeholder="예: 등신 되기 프로젝트"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">분류</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => {
                    const color = CATEGORY_COLORS[cat];
                    const active = formCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormCategory(cat)}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          active
                            ? `${color.bg} ${color.text} border-current`
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {CATEGORY_LABELS[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 예상 시간 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">예상 시간</label>
                <input
                  type="text"
                  placeholder="예: 60분"
                  value={formTime}
                  onChange={e => setFormTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>

              {/* 운동 목록 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">운동 목록</label>
                <div className="space-y-3">
                  {formExercises.map((ex, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-blue-600">{i + 1}</span>
                        </div>
                        <input
                          type="text"
                          placeholder="운동 이름"
                          value={ex.name}
                          onChange={e => handleExerciseChange(i, "name", e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setFormExercises(prev => prev.filter((_, idx) => idx !== i))}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pl-7">
                        <input
                          type="text"
                          placeholder="세트"
                          value={ex.sets}
                          onChange={e => handleExerciseChange(i, "sets", e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-900 text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <input
                          type="text"
                          placeholder="횟수"
                          value={ex.reps}
                          onChange={e => handleExerciseChange(i, "reps", e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-900 text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <input
                          type="text"
                          placeholder="무게"
                          value={ex.weight}
                          onChange={e => handleExerciseChange(i, "weight", e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-900 text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 운동 추가 */}
                <button
                  type="button"
                  onClick={() => setFormExercises(prev => [...prev, emptyExercise()])}
                  className="w-full mt-3 py-3 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm font-bold hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={15} />
                  운동 추가
                </button>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="px-6 pb-8 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleSave(isEditOpen)}
                disabled={formLoading || !formTitle.trim()}
                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? "저장 중..." : isEditOpen ? "수정 완료" : "루틴 생성 완료"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
