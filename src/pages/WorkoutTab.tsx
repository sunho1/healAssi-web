import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Plus, Pencil, Trash2, Dumbbell, Check, CheckCircle2 } from "lucide-react";
import { routinesService, workoutsService } from "../services/api";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  "3div":  { bg: "bg-orange-50",  text: "text-orange-600",  dot: "bg-orange-400",  border: "border-orange-300" },
  "4div":  { bg: "bg-blue-50",    text: "text-blue-600",    dot: "bg-blue-400",    border: "border-blue-300"   },
  "5div":  { bg: "bg-purple-50",  text: "text-purple-600",  dot: "bg-purple-400",  border: "border-purple-300" },
  "nodiv": { bg: "bg-green-50",   text: "text-green-600",   dot: "bg-green-400",   border: "border-green-300"  },
};

const CATEGORY_LABELS: Record<string, string> = {
  "3div": "3분할", "4div": "4분할", "5div": "5분할", "nodiv": "무분할",
};

const CATEGORIES = ["3div", "4div", "5div", "nodiv"] as const;
const WEEKDAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;
const ALL_DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

// ─── 타입 ────────────────────────────────────────────────────────────────────

interface SetDetail { sets: string; reps: string; weight: string; }
interface Exercise {
  name: string;
  body_part?: string;
  set_details?: SetDetail[];
  // 이전 버전 flat 구조
  sets?: string;
  reps?: string;
  weight?: string;
}
interface Routine {
  id: number;
  category: string;
  title: string;
  count: number;
  time: string;
  exercises: Exercise[];
  active_days: string[];
}
interface WorkoutLog { id: number; name: string; date: string; sets: number; weight: number; }
interface FormSetDetail { sets: string; reps: string; weight: string; }
interface FormExercise { name: string; body_part: string; set_details: FormSetDetail[]; }

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

const emptySet = (): FormSetDetail => ({ sets: "", reps: "", weight: "" });
const emptyExercise = (): FormExercise => ({ name: "", body_part: "", set_details: [emptySet()] });
const dateKey = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** 이전 버전(flat) / 새 버전(set_details) 모두 정규화 */
function normalizeExercise(ex: Exercise): FormExercise {
  const set_details =
    ex.set_details && ex.set_details.length > 0
      ? ex.set_details
      : [{ sets: ex.sets ?? "", reps: ex.reps ?? "", weight: ex.weight ?? "" }];
  return { name: ex.name, body_part: ex.body_part ?? "", set_details };
}

/** 세트 표시: 3세트 · 10회 · 60kg */
function setLabel(s: SetDetail | { sets?: string; reps?: string; weight?: string }): string {
  const parts: string[] = [];
  if (s.sets)   parts.push(`${s.sets}세트`);
  if (s.reps)   parts.push(`${s.reps}회`);
  if (s.weight) parts.push(s.weight);
  return parts.join(" · ") || "-";
}

const truncate = (name: string) => (name.length > 5 ? name.slice(0, 4) : name);

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────

export default function WorkoutTab() {
  const today = new Date();

  // 달력
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // 데이터
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);

  // 현재 적용 중인 루틴 ID (localStorage 유지)
  const [activeRoutineId, setActiveRoutineId] = useState<number | null>(() => {
    const v = localStorage.getItem("activeRoutineId");
    return v ? Number(v) : null;
  });

  // 운동 완료 날짜 Set (localStorage 유지)
  const [doneDates, setDoneDates] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("doneDates") ?? "[]")); }
    catch { return new Set(); }
  });

  // 날짜 상세 모달
  const [selectedDate, setSelectedDate] = useState<{ y: number; m: number; d: number } | null>(null);
  const [addLogName, setAddLogName] = useState("");
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);

  // 루틴 모달
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // 루틴 폼 상태
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<string>("3div");
  const [formTime, setFormTime] = useState("");
  const [formActiveDays, setFormActiveDays] = useState<string[]>([]);
  const [formExercises, setFormExercises] = useState<FormExercise[]>([emptyExercise()]);
  const [formLoading, setFormLoading] = useState(false);

  // ── 데이터 패치 ──────────────────────────────────────────────────────────

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

  // ── 달력 헬퍼 ────────────────────────────────────────────────────────────

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDay = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : null;

  // 날짜별 운동 로그
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

  const activeRoutine = routines.find(r => r.id === activeRoutineId) ?? null;

  // 해당 요일이 active_days에 포함되는지 확인
  const isRoutineDay = (d: number) => {
    if (!activeRoutine || !activeRoutine.active_days.length) return false;
    const weekday = WEEKDAY_NAMES[new Date(year, month, d).getDay()];
    return activeRoutine.active_days.includes("매일") || activeRoutine.active_days.includes(weekday);
  };

  // ── 운동 완료 토글 ────────────────────────────────────────────────────────

  const toggleDone = (key: string) => {
    setDoneDates(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      localStorage.setItem("doneDates", JSON.stringify([...next]));
      return next;
    });
  };

  // ── 운동 로그 추가 ─────────────────────────────────────────────────────────

  const handleAddLog = async () => {
    if (!addLogName.trim() || !selectedDate) return;
    const key = dateKey(selectedDate.y, selectedDate.m, selectedDate.d);
    try {
      await workoutsService.createWorkout({ name: addLogName.trim(), date: key, sets: 0, weight: 0 });
      const res = await workoutsService.getWorkouts();
      if (res?.data) setWorkouts(res.data);
      setAddLogName("");
      setIsAddLogOpen(false);
    } catch (e) { console.error(e); }
  };

  // ── 적용 루틴 설정 ─────────────────────────────────────────────────────────

  const applyRoutine = (id: number) => {
    setActiveRoutineId(id);
    localStorage.setItem("activeRoutineId", String(id));
  };
  const clearActiveRoutine = () => {
    setActiveRoutineId(null);
    localStorage.removeItem("activeRoutineId");
  };

  // ── 루틴 폼 ───────────────────────────────────────────────────────────────

  const openAdd = () => {
    setIsEditMode(false);
    setFormTitle(""); setFormCategory("3div"); setFormTime("");
    setFormActiveDays([]); setFormExercises([emptyExercise()]);
    setIsFormOpen(true);
  };

  const openEdit = () => {
    if (!selectedRoutine) return;
    setIsEditMode(true);
    setFormTitle(selectedRoutine.title);
    setFormCategory(selectedRoutine.category);
    setFormTime(selectedRoutine.time);
    setFormActiveDays([...selectedRoutine.active_days]);
    setFormExercises(
      selectedRoutine.exercises.length > 0
        ? selectedRoutine.exercises.map(normalizeExercise)
        : [emptyExercise()]
    );
    setIsFormOpen(true);
  };

  const toggleFormDay = (day: string) => {
    if (day === "매일") {
      setFormActiveDays(prev => (prev.includes("매일") ? [] : ["매일"]));
    } else {
      setFormActiveDays(prev => {
        const filtered = prev.filter(d => d !== "매일");
        return filtered.includes(day)
          ? filtered.filter(d => d !== day)
          : [...filtered, day];
      });
    }
  };

  const updateFormEx = (i: number, field: keyof FormExercise, value: string) =>
    setFormExercises(prev => prev.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex));

  const addSet = (i: number) =>
    setFormExercises(prev => prev.map((ex, idx) => idx === i
      ? { ...ex, set_details: [...ex.set_details, emptySet()] } : ex));

  const removeSet = (i: number, si: number) =>
    setFormExercises(prev => prev.map((ex, idx) => idx === i
      ? { ...ex, set_details: ex.set_details.filter((_, j) => j !== si) } : ex));

  const updateSet = (i: number, si: number, field: keyof FormSetDetail, value: string) =>
    setFormExercises(prev => prev.map((ex, idx) => idx === i
      ? { ...ex, set_details: ex.set_details.map((s, j) => j === si ? { ...s, [field]: value } : s) }
      : ex));

  const handleSave = async () => {
    if (!formTitle.trim()) return;
    setFormLoading(true);
    try {
      const validExercises = formExercises
        .filter(e => e.name.trim())
        .map(e => ({
          name: e.name.trim(),
          body_part: e.body_part.trim(),
          set_details: e.set_details.filter(s => s.sets || s.reps || s.weight),
        }));
      const payload = {
        category: formCategory,
        title: formTitle.trim(),
        count: validExercises.length,
        time: formTime.trim() || "0분",
        exercises: validExercises,
        active_days: formActiveDays,
      };
      if (isEditMode && selectedRoutine) {
        await routinesService.updateRoutine(selectedRoutine.id, payload);
      } else {
        await routinesService.createRoutine(payload);
      }
      fetchRoutines();
      setIsFormOpen(false);
      setSelectedRoutine(null);
    } catch (e) { console.error(e); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!selectedRoutine) return;
    try {
      await routinesService.deleteRoutine(selectedRoutine.id);
      if (activeRoutineId === selectedRoutine.id) clearActiveRoutine();
      fetchRoutines();
      setShowDeleteConfirm(false);
      setSelectedRoutine(null);
    } catch (e) { console.error(e); }
  };

  // ── 날짜 상세 모달 데이터 ─────────────────────────────────────────────────

  const selDateWeekday = selectedDate
    ? WEEKDAY_NAMES[new Date(selectedDate.y, selectedDate.m, selectedDate.d).getDay()]
    : null;
  const selDateKey = selectedDate ? dateKey(selectedDate.y, selectedDate.m, selectedDate.d) : null;
  const isToday =
    selectedDate?.y === today.getFullYear() &&
    selectedDate?.m === today.getMonth() &&
    selectedDate?.d === today.getDate();
  const isDoneToday = selDateKey ? doneDates.has(selDateKey) : false;
  const selDateLogs = selectedDate ? workoutsByDay[selectedDate.d] ?? [] : [];
  const showRoutineExercises =
    selectedDate && activeRoutine && selDateWeekday
      ? activeRoutine.active_days.includes("매일") || activeRoutine.active_days.includes(selDateWeekday)
      : false;

  // ─── 렌더 ────────────────────────────────────────────────────────────────

  return (
    <div className="pb-32 px-5 pt-10 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">운동 계획</h1>
      </header>

      {/* ── 달력 ── */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-800 text-base">{year}년 {month + 1}월</h2>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft size={18} className="text-slate-400" />
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center mb-1">
          {WEEKDAY_NAMES.map(d => (
            <div key={d} className="text-[11px] font-bold text-slate-400 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-0.5 text-center">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`e-${i}`} className="h-14" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const key = dateKey(year, month, day);
            const isDone = doneDates.has(key);
            const hasLogs = (workoutsByDay[day] ?? []).length > 0;
            const routineDay = isRoutineDay(day);
            const isT = day === todayDay;

            let dotColor = "";
            let labelText = "";
            if (isDone) {
              dotColor = "bg-green-500";
              labelText = activeRoutine?.exercises[0]?.name ?? "완료";
            } else if (routineDay) {
              dotColor = CATEGORY_COLORS[activeRoutine!.category]?.dot ?? "bg-blue-400";
              labelText = activeRoutine?.exercises[0]?.name ?? "";
            } else if (hasLogs) {
              dotColor = "bg-blue-400";
              labelText = workoutsByDay[day][0]?.name ?? "";
            }

            return (
              <button
                key={day}
                onClick={() => setSelectedDate({ y: year, m: month, d: day })}
                className="flex flex-col items-center h-14 pt-1 focus:outline-none"
              >
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                  isT ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                }`}>
                  {day}
                </span>
                {dotColor ? (
                  <>
                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${dotColor} ${!isT ? "opacity-60" : ""}`} />
                    <span className={`text-[9px] leading-tight font-medium truncate max-w-[28px] ${
                      isT ? "text-blue-600" : "text-slate-400"
                    }`}>
                      {truncate(labelText)}
                    </span>
                  </>
                ) : <div className="mt-0.5 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 루틴 보관함 ── */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">루틴 보관함</h2>

        {activeRoutine && (
          <div className={`mb-3 px-4 py-2.5 rounded-2xl flex items-center gap-3 ${CATEGORY_COLORS[activeRoutine.category]?.bg ?? "bg-blue-50"}`}>
            <CheckCircle2 size={16} className={CATEGORY_COLORS[activeRoutine.category]?.text ?? "text-blue-600"} />
            <span className={`text-sm font-bold ${CATEGORY_COLORS[activeRoutine.category]?.text ?? "text-blue-600"}`}>
              {activeRoutine.title} 적용 중
            </span>
            <button
              onClick={clearActiveRoutine}
              className="ml-auto text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              해제
            </button>
          </div>
        )}

        {routines.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-10 text-center">
            <p className="text-slate-400 font-medium text-sm">저장된 루틴이 없어요</p>
            <p className="text-xs text-slate-400 mt-1">아래 버튼으로 루틴을 추가해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {routines.map(routine => {
              const color = CATEGORY_COLORS[routine.category] ?? CATEGORY_COLORS["3div"];
              const isActive = routine.id === activeRoutineId;
              const exerciseNames = routine.exercises.map(e => e.name).filter(Boolean).join(" · ");
              return (
                <button
                  key={routine.id}
                  onClick={() => setSelectedRoutine(routine)}
                  className={`w-full bg-white px-4 py-4 rounded-2xl border shadow-sm text-left hover:border-blue-200 transition-all active:scale-[0.99] ${
                    isActive ? color.border + " border" : "border-slate-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {isActive && <Check size={13} className={color.text} />}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
                          {CATEGORY_LABELS[routine.category] ?? routine.category}
                        </span>
                        {routine.active_days.length > 0 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {routine.active_days.includes("매일") ? "매일" : routine.active_days.join("·")}
                          </span>
                        )}
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

        <button
          onClick={openAdd}
          className="w-full mt-4 py-4 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-slate-500 font-bold text-sm hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all"
        >
          <Plus size={18} />루틴 추가
        </button>
      </div>

      {/* ── 날짜 상세 모달 ── */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setSelectedDate(null); setIsAddLogOpen(false); }} />
          <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedDate.m + 1}월 {selectedDate.d}일 {selDateWeekday}요일
                  </h3>
                  {isToday && (
                    <button
                      onClick={() => selDateKey && toggleDone(selDateKey)}
                      className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                        isDoneToday
                          ? "bg-green-500 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-700"
                      }`}
                    >
                      <Check size={14} />
                      {isDoneToday ? "운동 완료!" : "운동 완료 체크"}
                    </button>
                  )}
                </div>
                <button onClick={() => { setSelectedDate(null); setIsAddLogOpen(false); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {/* 적용 중인 루틴 운동 */}
              {showRoutineExercises && activeRoutine && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    오늘의 루틴 — {activeRoutine.title}
                  </p>
                  <div className="space-y-2">
                    {activeRoutine.exercises.map((ex, i) => {
                      const normalized = normalizeExercise(ex);
                      return (
                        <div key={i} className="bg-slate-50 px-4 py-3 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            {normalized.body_part && (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-full">
                                {normalized.body_part}
                              </span>
                            )}
                            <p className="font-bold text-slate-900 text-sm">{ex.name}</p>
                          </div>
                          {normalized.set_details.map((s, si) => (
                            <p key={si} className="text-xs text-slate-500 pl-1">{setLabel(s)}</p>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 추가 운동 로그 */}
              {selDateLogs.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">추가 기록</p>
                  <div className="space-y-2">
                    {selDateLogs.map((w) => (
                      <div key={w.id} className="bg-blue-50 px-4 py-3 rounded-xl flex items-center gap-3">
                        <Dumbbell size={14} className="text-blue-500 flex-shrink-0" />
                        <p className="font-bold text-slate-900 text-sm">{w.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!showRoutineExercises && selDateLogs.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-4">기록된 운동이 없어요</p>
              )}

              {/* 운동 추가 인라인 폼 */}
              {isAddLogOpen ? (
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="운동 이름 (예: 데드리프트)"
                    value={addLogName}
                    onChange={e => setAddLogName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={() => { setIsAddLogOpen(false); setAddLogName(""); }} className="flex-1 py-2.5 rounded-xl bg-slate-200 text-slate-600 font-bold text-sm">취소</button>
                    <button onClick={handleAddLog} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm">추가</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddLogOpen(true)}
                  className="w-full py-3 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm font-bold hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={15} />운동 추가 기록
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 루틴 상세 모달 ── */}
      {selectedRoutine && !isFormOpen && !showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedRoutine(null)} />
          <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${(CATEGORY_COLORS[selectedRoutine.category] ?? CATEGORY_COLORS["3div"]).bg} ${(CATEGORY_COLORS[selectedRoutine.category] ?? CATEGORY_COLORS["3div"]).text}`}>
                    {CATEGORY_LABELS[selectedRoutine.category] ?? selectedRoutine.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{selectedRoutine.title}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">예상 시간 {selectedRoutine.time}</p>
                  {selectedRoutine.active_days.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {selectedRoutine.active_days.map(d => (
                        <span key={d} className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{d}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedRoutine(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
              {selectedRoutine.exercises.map((ex, i) => {
                const norm = normalizeExercise(ex);
                return (
                  <div key={i} className="bg-slate-50 px-4 py-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      {norm.body_part && (
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full">
                          {norm.body_part}
                        </span>
                      )}
                      <p className="font-bold text-slate-900 text-sm">{ex.name}</p>
                    </div>
                    {norm.set_details.map((s, si) => (
                      <p key={si} className="text-xs text-slate-500 pl-1">{setLabel(s)}</p>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="px-6 pb-8 pt-4 border-t border-slate-100 space-y-3">
              {/* 루틴 적용 */}
              {selectedRoutine.id !== activeRoutineId ? (
                <button
                  onClick={() => applyRoutine(selectedRoutine.id)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${(CATEGORY_COLORS[selectedRoutine.category] ?? CATEGORY_COLORS["3div"]).bg} ${(CATEGORY_COLORS[selectedRoutine.category] ?? CATEGORY_COLORS["3div"]).text}`}
                >
                  이 루틴 적용하기
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl bg-green-50 text-green-600 font-bold text-sm text-center">
                  ✓ 현재 적용 중인 루틴
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />삭제
                </button>
                <button
                  onClick={openEdit}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-colors"
                >
                  <Pencil size={15} />수정하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 삭제 확인 ── */}
      {showDeleteConfirm && selectedRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">루틴을 삭제할까요?</h3>
            <p className="text-sm text-slate-500 mb-6">"{selectedRoutine.title}" 루틴이 영구적으로 삭제됩니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors">취소</button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors">삭제</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 루틴 추가/수정 폼 모달 ── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-300 max-h-[94vh] flex flex-col">

            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-lg font-bold text-slate-900">{isEditMode ? "루틴 수정" : "새 루틴 만들기"}</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {/* 루틴 이름 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">루틴 이름</label>
                <input
                  type="text" placeholder="예: 등신 되기 프로젝트" value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* 분류 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">분류</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => {
                    const c = CATEGORY_COLORS[cat];
                    const active = formCategory === cat;
                    return (
                      <button key={cat} type="button" onClick={() => setFormCategory(cat)}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          active ? `${c.bg} ${c.text} ${c.border}` : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
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
                  type="text" placeholder="예: 60분" value={formTime}
                  onChange={e => setFormTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* 운동 일자 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">운동 일자</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button" onClick={() => toggleFormDay("매일")}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      formActiveDays.includes("매일")
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >매일</button>
                  {ALL_DAYS.map(d => {
                    const selected = formActiveDays.includes("매일") || formActiveDays.includes(d);
                    return (
                      <button key={d} type="button" onClick={() => toggleFormDay(d)}
                        className={`w-9 h-9 rounded-full text-xs font-bold border transition-all ${
                          selected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                        }`}
                      >{d}</button>
                    );
                  })}
                </div>
              </div>

              {/* 운동 목록 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">운동 목록</label>
                <div className="space-y-4">
                  {formExercises.map((ex, i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-3">
                      {/* 운동 이름 + 부위 row */}
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text" placeholder="부위 (예: 가슴)" value={ex.body_part}
                          onChange={e => updateFormEx(i, "body_part", e.target.value)}
                          className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <input
                          type="text" placeholder="운동 이름" value={ex.name}
                          onChange={e => updateFormEx(i, "name", e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button type="button" onClick={() => setFormExercises(prev => prev.filter((_, idx) => idx !== i))}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors flex-shrink-0">
                          <X size={14} />
                        </button>
                      </div>
                      {/* 세트 rows */}
                      {ex.set_details.map((s, si) => (
                        <div key={si} className="flex items-center gap-1.5 mb-1.5 pl-1">
                          <span className="text-[10px] text-slate-400 w-5 text-center">{si + 1}</span>
                          <input type="text" placeholder="세트" value={s.sets} onChange={e => updateSet(i, si, "sets", e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                          <input type="text" placeholder="횟수" value={s.reps} onChange={e => updateSet(i, si, "reps", e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                          <input type="text" placeholder="무게" value={s.weight} onChange={e => updateSet(i, si, "weight", e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                          <button type="button" onClick={() => removeSet(i, si)} className="p-1 text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addSet(i)}
                        className="mt-1 ml-6 text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1">
                        <Plus size={12} />세트 추가
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setFormExercises(prev => [...prev, emptyExercise()])}
                  className="w-full mt-3 py-3 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm font-bold hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-2">
                  <Plus size={15} />운동 추가
                </button>
              </div>
            </div>

            <div className="px-6 pb-8 pt-4 border-t border-slate-100 flex-shrink-0">
              <button type="button" onClick={handleSave} disabled={formLoading || !formTitle.trim()}
                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {formLoading ? "저장 중..." : isEditMode ? "수정 완료" : "루틴 생성 완료"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
