import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Plus, Pencil, Trash2, Check, CheckCircle2 } from "lucide-react";
import { routinesService, workoutLogsService } from "../services/api";

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
  sets?: string; reps?: string; weight?: string;
}
interface Routine {
  id: number; category: string; title: string; count: number; time: string;
  exercises: Exercise[]; active_days: string[];
}
interface WorkoutLogData { id: number; date: string; is_done: boolean; body_parts: FormBodyPart[]; }
interface FormSetDetail { reps: string; weight: string; }
interface FormExerciseItem { name: string; set_details: FormSetDetail[]; }
interface FormBodyPart { body_part: string; exercises: FormExerciseItem[]; }

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

const emptySet = (): FormSetDetail => ({ reps: "", weight: "" });
const emptyExerciseItem = (): FormExerciseItem => ({ name: "", set_details: [emptySet()] });
const emptyBodyPart = (): FormBodyPart => ({ body_part: "", exercises: [emptyExerciseItem()] });

const dateKey = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function normalizeSetDetails(ex: Exercise): FormSetDetail[] {
  if (ex.set_details && ex.set_details.length > 0)
    return ex.set_details.map(s => ({ reps: s.reps ?? "", weight: s.weight ?? "" }));
  return [{ reps: ex.reps ?? "", weight: ex.weight ?? "" }];
}

function groupExercisesByBodyPart(exercises: Exercise[]): FormBodyPart[] {
  const map = new Map<string, FormExerciseItem[]>();
  exercises.forEach(ex => {
    const bp = ex.body_part ?? "";
    if (!map.has(bp)) map.set(bp, []);
    map.get(bp)!.push({ name: ex.name, set_details: normalizeSetDetails(ex) });
  });
  if (map.size === 0) return [emptyBodyPart()];
  return Array.from(map.entries()).map(([body_part, exItems]) => ({ body_part, exercises: exItems }));
}

function flattenBodyParts(bps: FormBodyPart[]) {
  return bps.flatMap(bp =>
    bp.exercises.filter(ex => ex.name.trim()).map((ex, idx) => ({
      name: ex.name.trim(),
      body_part: bp.body_part.trim(),
      set_details: ex.set_details
        .filter(s => s.reps || s.weight)
        .map((s, si) => ({ sets: String(si + 1), reps: s.reps, weight: s.weight })),
      sets: String(idx + 1),
    }))
  );
}

function getUniqueBodyParts(exercises: Exercise[]): string[] {
  return [...new Set(exercises.map(e => e.body_part ?? "").filter(Boolean))];
}

function setLabel(s: { reps?: string; weight?: string; sets?: string }): string {
  const parts: string[] = [];
  if (s.weight) parts.push(`${s.weight}kg`);
  if (s.reps) parts.push(`${s.reps}회`);
  return parts.join(" · ") || "-";
}

function parsePeriodSchedule(days: string[]): { work: number; rest: number } | null {
  const p = days.find(d => d.startsWith("period:"));
  if (!p) return null;
  const [, w, r] = p.split(":");
  return { work: parseInt(w) || 0, rest: parseInt(r) || 0 };
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────

export default function WorkoutTab() {
  const today = new Date();

  // 달력
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // 데이터
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogData[]>([]);

  // 적용 중인 루틴
  const [activeRoutineId, setActiveRoutineId] = useState<number | null>(() => {
    const v = localStorage.getItem("activeRoutineId");
    return v ? Number(v) : null;
  });

  const [routineStartDate, setRoutineStartDate] = useState<string>(
    () => localStorage.getItem("routineStartDate") ?? ""
  );

  // 날짜 상세 모달
  const [selectedDate, setSelectedDate] = useState<{ y: number; m: number; d: number } | null>(null);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editDateBodyParts, setEditDateBodyParts] = useState<FormBodyPart[]>([]);

  // 루틴 모달
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // 루틴 폼
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<string>("3div");
  const [formTime, setFormTime] = useState("");
  const [formScheduleTab, setFormScheduleTab] = useState<"weekday" | "period">("weekday");
  const [formActiveDays, setFormActiveDays] = useState<string[]>([]);
  const [formPeriodWork, setFormPeriodWork] = useState("3");
  const [formPeriodRest, setFormPeriodRest] = useState("1");
  const [formBodyParts, setFormBodyParts] = useState<FormBodyPart[]>([emptyBodyPart()]);
  const [formLoading, setFormLoading] = useState(false);

  // ── 데이터 패치 ──────────────────────────────────────────────────────────

  const fetchRoutines = () => {
    routinesService.getRoutines()
      .then(res => { if (res?.data) setRoutines(res.data); })
      .catch(console.error);
  };

  useEffect(() => {
    fetchRoutines();
    workoutLogsService.getLogs()
      .then(res => { if (res?.data) setWorkoutLogs(res.data); })
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

  // workoutLogs를 dateKey → log 로 빠르게 조회하는 맵
  const logByDate = new Map(workoutLogs.map(l => [l.date, l]));

  const activeRoutine = routines.find(r => r.id === activeRoutineId) ?? null;

  const isRoutineDay = (d: number): boolean => {
    if (!activeRoutine || !activeRoutine.active_days.length) return false;
    const period = parsePeriodSchedule(activeRoutine.active_days);
    if (period) {
      if (!routineStartDate) return false;
      const start = new Date(routineStartDate);
      start.setHours(0, 0, 0, 0);
      const current = new Date(year, month, d);
      const daysDiff = Math.floor((current.getTime() - start.getTime()) / 86400000);
      if (daysDiff < 0) return false;
      return (daysDiff % (period.work + period.rest)) < period.work;
    }
    const weekday = WEEKDAY_NAMES[new Date(year, month, d).getDay()];
    return activeRoutine.active_days.includes("매일") || activeRoutine.active_days.includes(weekday);
  };

  const isPastDay = (d: number): boolean => {
    const cellDate = new Date(year, month, d);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return cellDate < todayStart;
  };

  // ── 완료 토글 ─────────────────────────────────────────────────────────────

  const toggleDone = async (key: string) => {
    const current = logByDate.get(key)?.is_done ?? false;
    try {
      const res = await workoutLogsService.upsertLog(key, { is_done: !current });
      setWorkoutLogs(prev => {
        const exists = prev.find(l => l.date === key);
        return exists
          ? prev.map(l => l.date === key ? res.data : l)
          : [...prev, res.data];
      });
    } catch (e) { console.error(e); }
  };

  // ── 루틴 적용 ─────────────────────────────────────────────────────────────

  const applyRoutine = (id: number) => {
    setActiveRoutineId(id);
    localStorage.setItem("activeRoutineId", String(id));
    const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
    setRoutineStartDate(todayKey);
    localStorage.setItem("routineStartDate", todayKey);
  };

  const clearActiveRoutine = () => {
    setActiveRoutineId(null);
    localStorage.removeItem("activeRoutineId");
    localStorage.removeItem("routineStartDate");
    setRoutineStartDate("");
  };

  // ── 루틴 폼 ───────────────────────────────────────────────────────────────

  const openAdd = () => {
    setIsEditMode(false);
    setFormTitle(""); setFormCategory("3div"); setFormTime("");
    setFormScheduleTab("weekday"); setFormActiveDays([]);
    setFormPeriodWork("3"); setFormPeriodRest("1");
    setFormBodyParts([emptyBodyPart()]);
    setIsFormOpen(true);
  };

  const openEdit = () => {
    if (!selectedRoutine) return;
    setIsEditMode(true);
    setFormTitle(selectedRoutine.title);
    setFormCategory(selectedRoutine.category);
    setFormTime(selectedRoutine.time);
    const period = parsePeriodSchedule(selectedRoutine.active_days);
    if (period) {
      setFormScheduleTab("period");
      setFormPeriodWork(String(period.work));
      setFormPeriodRest(String(period.rest));
      setFormActiveDays([]);
    } else {
      setFormScheduleTab("weekday");
      setFormActiveDays([...selectedRoutine.active_days]);
      setFormPeriodWork("3"); setFormPeriodRest("1");
    }
    setFormBodyParts(groupExercisesByBodyPart(selectedRoutine.exercises));
    setIsFormOpen(true);
  };

  const toggleFormDay = (day: string) => {
    if (day === "매일") {
      setFormActiveDays(prev => prev.includes("매일") ? [] : ["매일"]);
    } else {
      setFormActiveDays(prev => {
        const filtered = prev.filter(d => d !== "매일");
        return filtered.includes(day) ? filtered.filter(d => d !== day) : [...filtered, day];
      });
    }
  };

  // FormBodyPart 조작
  const addBodyPart = () => setFormBodyParts(prev => [...prev, emptyBodyPart()]);
  const removeBodyPart = (bi: number) => setFormBodyParts(prev => prev.filter((_, i) => i !== bi));
  const updateBodyPartName = (bi: number, val: string) =>
    setFormBodyParts(prev => prev.map((bp, i) => i === bi ? { ...bp, body_part: val } : bp));

  const addExercise = (bi: number) =>
    setFormBodyParts(prev => prev.map((bp, i) => i === bi
      ? { ...bp, exercises: [...bp.exercises, emptyExerciseItem()] } : bp));
  const removeExercise = (bi: number, ei: number) =>
    setFormBodyParts(prev => prev.map((bp, i) => i === bi
      ? { ...bp, exercises: bp.exercises.filter((_, j) => j !== ei) } : bp));
  const updateExerciseName = (bi: number, ei: number, val: string) =>
    setFormBodyParts(prev => prev.map((bp, i) => i === bi
      ? { ...bp, exercises: bp.exercises.map((ex, j) => j === ei ? { ...ex, name: val } : ex) } : bp));

  const addSet = (bi: number, ei: number) =>
    setFormBodyParts(prev => prev.map((bp, i) => i === bi
      ? { ...bp, exercises: bp.exercises.map((ex, j) => j === ei
          ? { ...ex, set_details: [...ex.set_details, emptySet()] } : ex) } : bp));
  const removeSet = (bi: number, ei: number, si: number) =>
    setFormBodyParts(prev => prev.map((bp, i) => i === bi
      ? { ...bp, exercises: bp.exercises.map((ex, j) => j === ei
          ? { ...ex, set_details: ex.set_details.filter((_, k) => k !== si) } : ex) } : bp));
  const updateFormSet = (bi: number, ei: number, si: number, field: keyof FormSetDetail, val: string) =>
    setFormBodyParts(prev => prev.map((bp, i) => i === bi
      ? { ...bp, exercises: bp.exercises.map((ex, j) => j === ei
          ? { ...ex, set_details: ex.set_details.map((s, k) => k === si ? { ...s, [field]: val } : s) } : ex) } : bp));

  const handleSave = async () => {
    if (!formTitle.trim()) return;
    setFormLoading(true);
    try {
      const activeDays = formScheduleTab === "period"
        ? [`period:${formPeriodWork}:${formPeriodRest}`]
        : formActiveDays;
      const exercises = flattenBodyParts(formBodyParts);
      const payload = {
        category: formCategory,
        title: formTitle.trim(),
        count: exercises.length,
        time: formTime.trim() || "0분",
        exercises,
        active_days: activeDays,
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

  // ── 날짜 상세 모달 ────────────────────────────────────────────────────────

  const selDateKey = selectedDate ? dateKey(selectedDate.y, selectedDate.m, selectedDate.d) : null;
  const selDateWeekday = selectedDate
    ? WEEKDAY_NAMES[new Date(selectedDate.y, selectedDate.m, selectedDate.d).getDay()]
    : null;
  const isDoneSelected = selDateKey ? (logByDate.get(selDateKey)?.is_done ?? false) : false;
  const isSelectedRoutineDay = selectedDate ? isRoutineDay(selectedDate.d) : false;
  const selDateLog = selDateKey ? logByDate.get(selDateKey) ?? null : null;
  const hasDateOverride = selDateLog !== null && selDateLog.body_parts.length > 0;

  const getDateBodyParts = (): FormBodyPart[] => {
    if (!selDateKey) return [];
    if (hasDateOverride) return selDateLog!.body_parts;
    if (activeRoutine && isSelectedRoutineDay) return groupExercisesByBodyPart(activeRoutine.exercises);
    return [];
  };

  const openDateEdit = () => {
    const existing = getDateBodyParts();
    setEditDateBodyParts(existing.length > 0 ? existing : [emptyBodyPart()]);
    setIsEditingDate(true);
  };

  const saveDateEdit = async () => {
    if (!selDateKey) return;
    try {
      const res = await workoutLogsService.upsertLog(selDateKey, { body_parts: editDateBodyParts });
      setWorkoutLogs(prev => {
        const exists = prev.find(l => l.date === selDateKey);
        return exists
          ? prev.map(l => l.date === selDateKey ? res.data : l)
          : [...prev, res.data];
      });
      setIsEditingDate(false);
    } catch (e) { console.error(e); }
  };

  // editDateBodyParts 조작 (날짜 편집 모달용)
  const updateEditBpName = (bi: number, val: string) =>
    setEditDateBodyParts(prev => prev.map((b, i) => i === bi ? { ...b, body_part: val } : b));
  const removeEditBp = (bi: number) =>
    setEditDateBodyParts(prev => prev.filter((_, i) => i !== bi));
  const addEditExercise = (bi: number) =>
    setEditDateBodyParts(prev => prev.map((b, i) => i === bi
      ? { ...b, exercises: [...b.exercises, emptyExerciseItem()] } : b));
  const removeEditExercise = (bi: number, ei: number) =>
    setEditDateBodyParts(prev => prev.map((b, i) => i === bi
      ? { ...b, exercises: b.exercises.filter((_, j) => j !== ei) } : b));
  const updateEditExName = (bi: number, ei: number, val: string) =>
    setEditDateBodyParts(prev => prev.map((b, i) => i === bi
      ? { ...b, exercises: b.exercises.map((ex, j) => j === ei ? { ...ex, name: val } : ex) } : b));
  const addEditSet = (bi: number, ei: number) =>
    setEditDateBodyParts(prev => prev.map((b, i) => i === bi
      ? { ...b, exercises: b.exercises.map((ex, j) => j === ei
          ? { ...ex, set_details: [...ex.set_details, emptySet()] } : ex) } : b));
  const removeEditSet = (bi: number, ei: number, si: number) =>
    setEditDateBodyParts(prev => prev.map((b, i) => i === bi
      ? { ...b, exercises: b.exercises.map((ex, j) => j === ei
          ? { ...ex, set_details: ex.set_details.filter((_, k) => k !== si) } : ex) } : b));
  const updateEditSet = (bi: number, ei: number, si: number, field: keyof FormSetDetail, val: string) =>
    setEditDateBodyParts(prev => prev.map((b, i) => i === bi
      ? { ...b, exercises: b.exercises.map((ex, j) => j === ei
          ? { ...ex, set_details: ex.set_details.map((s, k) => k === si ? { ...s, [field]: val } : s) } : ex) } : b));

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

        <div className="grid grid-cols-7 gap-y-1 text-center">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`e-${i}`} className="h-[62px]" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const key = dateKey(year, month, day);
            const isDone = logByDate.get(key)?.is_done ?? false;
            const routineDay = isRoutineDay(day);
            const isPast = isPastDay(day);
            const isT = day === todayDay;

            let indicator: "check" | "x" | null = null;
            if (routineDay) {
              if (isDone) indicator = "check";
              else if (isPast) indicator = "x";
            } else if (isDone) {
              indicator = "check";
            }

            const routineLabel = routineDay && activeRoutine
              ? activeRoutine.title.slice(0, 6)
              : "";

            return (
              <button
                key={day}
                onClick={() => setSelectedDate({ y: year, m: month, d: day })}
                className="flex flex-col items-center h-[62px] pt-1 focus:outline-none"
              >
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                  isT ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                }`}>
                  {day}
                </span>
                <div className="h-4 flex items-center justify-center">
                  {indicator === "check" && (
                    <span className="text-green-500 text-[12px] font-black leading-none">✓</span>
                  )}
                  {indicator === "x" && (
                    <span className="text-red-400 text-[12px] font-black leading-none">✗</span>
                  )}
                </div>
                <span className={`text-[8px] leading-tight font-medium truncate w-full text-center px-0.5 ${
                  isT ? "text-blue-500" : "text-slate-400"
                }`}>
                  {routineLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 루틴 만들기 ── */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">루틴 만들기</h2>

        {activeRoutine && (
          <div className={`mb-3 px-4 py-2.5 rounded-2xl flex items-center gap-3 ${CATEGORY_COLORS[activeRoutine.category]?.bg ?? "bg-blue-50"}`}>
            <CheckCircle2 size={16} className={CATEGORY_COLORS[activeRoutine.category]?.text ?? "text-blue-600"} />
            <span className={`text-sm font-bold ${CATEGORY_COLORS[activeRoutine.category]?.text ?? "text-blue-600"}`}>
              {activeRoutine.title} 적용 중
            </span>
            <button onClick={clearActiveRoutine} className="ml-auto text-xs text-slate-400 hover:text-slate-600 font-medium">해제</button>
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
              const bodyParts = getUniqueBodyParts(routine.exercises);
              const period = parsePeriodSchedule(routine.active_days);
              const scheduleLabel = period
                ? `${period.work}일 운동 · ${period.rest}일 휴식`
                : routine.active_days.includes("매일") ? "매일"
                : routine.active_days.join("·");

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
                        {scheduleLabel && (
                          <span className="text-[10px] text-slate-400 font-medium">{scheduleLabel}</span>
                        )}
                      </div>
                      <p className="font-bold text-slate-900">{routine.title}</p>
                      {bodyParts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {bodyParts.map(bp => (
                            <span key={bp} className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              {bp}
                            </span>
                          ))}
                        </div>
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setSelectedDate(null); setIsEditingDate(false); }} />
          <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-300 max-h-[88vh] flex flex-col">

            {/* 헤더 */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedDate.m + 1}월 {selectedDate.d}일 {selDateWeekday}요일
                  </h3>
                  <button
                    onClick={() => selDateKey && toggleDone(selDateKey)}
                    className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      isDoneSelected
                        ? "bg-green-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-700"
                    }`}
                  >
                    <Check size={14} />
                    {isDoneSelected ? "운동 완료!" : "운동 완료 체크"}
                  </button>
                </div>
                <button onClick={() => { setSelectedDate(null); setIsEditingDate(false); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* 본문 */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {isEditingDate ? (
                /* 편집 모드 */
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">운동 수정</p>
                  {editDateBodyParts.map((bp, bi) => (
                    <div key={bi} className="bg-slate-50 rounded-2xl p-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text" placeholder="운동 부위 (예: 가슴)" value={bp.body_part}
                          onChange={e => updateEditBpName(bi, e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button onClick={() => removeEditBp(bi)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                          <X size={14} />
                        </button>
                      </div>

                      {bp.exercises.map((ex, ei) => (
                        <div key={ei} className="bg-white rounded-xl p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text" placeholder="운동 이름" value={ex.name}
                              onChange={e => updateEditExName(bi, ei, e.target.value)}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <button onClick={() => removeEditExercise(bi, ei)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                              <X size={13} />
                            </button>
                          </div>
                          {ex.set_details.map((s, si) => (
                            <div key={si} className="flex items-center gap-1.5 pl-1">
                              <span className="text-[10px] font-bold text-slate-400 w-5 text-center">{si + 1}</span>
                              <input type="text" placeholder="무게(kg)" value={s.weight}
                                onChange={e => updateEditSet(bi, ei, si, "weight", e.target.value)}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                              <input type="text" placeholder="횟수" value={s.reps}
                                onChange={e => updateEditSet(bi, ei, si, "reps", e.target.value)}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                              <button onClick={() => removeEditSet(bi, ei, si)} className="p-1 text-slate-300 hover:text-red-400 transition-colors">
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => addEditSet(bi, ei)} className="ml-6 text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1">
                            <Plus size={11} />세트 추가
                          </button>
                        </div>
                      ))}

                      <button onClick={() => addEditExercise(bi)}
                        className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs font-bold hover:bg-white hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-1">
                        <Plus size={12} />운동 추가
                      </button>
                    </div>
                  ))}

                  <button onClick={() => setEditDateBodyParts(prev => [...prev, emptyBodyPart()])}
                    className="w-full py-3 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm font-bold hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-2">
                    <Plus size={14} />부위 추가
                  </button>

                  <div className="flex gap-3 pb-2">
                    <button onClick={() => setIsEditingDate(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">취소</button>
                    <button onClick={saveDateEdit} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm">저장</button>
                  </div>
                </div>
              ) : (
                /* 조회 모드 */
                <div className="space-y-4">
                  {(isSelectedRoutineDay && activeRoutine) || hasDateOverride ? (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          {activeRoutine ? `루틴 — ${activeRoutine.title}` : "운동 기록"}
                          {hasDateOverride && (
                            <span className="ml-2 text-blue-500 normal-case font-bold">수정됨</span>
                          )}
                        </p>
                        <button onClick={openDateEdit} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
                          <Pencil size={11} />수정
                        </button>
                      </div>
                      <div className="space-y-3">
                        {getDateBodyParts().map((bp, bi) => (
                          <div key={bi} className="bg-slate-50 rounded-xl p-3">
                            {bp.body_part && (
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">{bp.body_part}</p>
                            )}
                            <div className="space-y-2">
                              {bp.exercises.map((ex, ei) => (
                                <div key={ei} className="bg-white rounded-lg px-3 py-2.5">
                                  <p className="font-bold text-slate-900 text-sm mb-1.5">{ex.name}</p>
                                  <div className="space-y-0.5">
                                    {ex.set_details.map((s, si) => (
                                      <p key={si} className="text-xs text-slate-500">
                                        {si + 1}세트 · {setLabel(s)}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <p className="text-center text-slate-400 text-sm mb-4">등록된 운동이 없어요</p>
                      <button onClick={openDateEdit}
                        className="w-full py-3 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm font-bold hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-2">
                        <Plus size={15} />운동 기록 추가
                      </button>
                    </div>
                  )}
                </div>
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
                  {selectedRoutine.time && selectedRoutine.time !== "0분" && (
                    <p className="text-sm text-slate-500 mt-0.5">예상 시간 {selectedRoutine.time}</p>
                  )}
                  {(() => {
                    const period = parsePeriodSchedule(selectedRoutine.active_days);
                    if (period) return (
                      <p className="text-xs font-bold text-slate-400 mt-1.5 bg-slate-50 inline-block px-2 py-1 rounded-full">
                        {period.work}일 운동 · {period.rest}일 휴식 사이클
                      </p>
                    );
                    if (selectedRoutine.active_days.length > 0) return (
                      <div className="flex gap-1 mt-2">
                        {selectedRoutine.active_days.map(d => (
                          <span key={d} className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{d}</span>
                        ))}
                      </div>
                    );
                    return null;
                  })()}
                </div>
                <button onClick={() => setSelectedRoutine(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
              {groupExercisesByBodyPart(selectedRoutine.exercises).map((bp, bi) => (
                <div key={bi} className="bg-slate-50 rounded-xl p-3">
                  {bp.body_part && (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">{bp.body_part}</p>
                  )}
                  <div className="space-y-2">
                    {bp.exercises.map((ex, ei) => (
                      <div key={ei} className="bg-white rounded-lg px-3 py-2.5">
                        <p className="font-bold text-slate-900 text-sm mb-1">{ex.name}</p>
                        <div className="space-y-0.5">
                          {ex.set_details.map((s, si) => (
                            <p key={si} className="text-xs text-slate-500">{si + 1}세트 · {setLabel(s)}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 pb-8 pt-4 border-t border-slate-100 space-y-3">
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
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">취소</button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm">삭제</button>
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

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

              {/* ① 루틴 이름 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">루틴 이름</label>
                <input
                  type="text" placeholder="예: 상체 분할 루틴" value={formTitle}
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

              {/* ② 운동 일자 - 탭 형태 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">운동 일자</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-3">
                  <button
                    type="button" onClick={() => setFormScheduleTab("weekday")}
                    className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
                      formScheduleTab === "weekday" ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >요일별</button>
                  <button
                    type="button" onClick={() => setFormScheduleTab("period")}
                    className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
                      formScheduleTab === "period" ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >기간별</button>
                </div>

                {formScheduleTab === "weekday" ? (
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
                            selected ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                          }`}
                        >{d}</button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-3">N일 운동 후 M일 휴식하는 사이클을 설정하세요</p>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">운동 일수</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number" min="1" max="30" value={formPeriodWork}
                            onChange={e => setFormPeriodWork(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <span className="text-sm text-slate-500 font-medium whitespace-nowrap">일</span>
                        </div>
                      </div>
                      <span className="text-slate-300 text-xl pb-2.5">·</span>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">휴식 일수</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number" min="0" max="30" value={formPeriodRest}
                            onChange={e => setFormPeriodRest(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <span className="text-sm text-slate-500 font-medium whitespace-nowrap">일</span>
                        </div>
                      </div>
                    </div>
                    {formPeriodWork && (
                      <p className="text-xs text-blue-600 font-bold mt-3 text-center">
                        {formPeriodWork}일 운동 후 {formPeriodRest}일 휴식 반복
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ③ 운동 부위 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">운동 부위</label>
                <div className="space-y-4">
                  {formBodyParts.map((bp, bi) => (
                    <div key={bi} className="bg-slate-50 rounded-2xl p-3 space-y-3">
                      {/* 부위 헤더 */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">부위</span>
                          <input
                            type="text" placeholder="가슴 / 등 / 어깨 / 하체..." value={bp.body_part}
                            onChange={e => updateBodyPartName(bi, e.target.value)}
                            className="flex-1 text-sm font-bold text-slate-800 bg-transparent focus:outline-none"
                          />
                        </div>
                        {formBodyParts.length > 1 && (
                          <button type="button" onClick={() => removeBodyPart(bi)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors flex-shrink-0">
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* 운동 목록 */}
                      <div className="space-y-2">
                        {bp.exercises.map((ex, ei) => (
                          <div key={ei} className="bg-white rounded-xl p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text" placeholder="운동 이름 (예: 벤치프레스)" value={ex.name}
                                onChange={e => updateExerciseName(bi, ei, e.target.value)}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                              <button type="button" onClick={() => removeExercise(bi, ei)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors flex-shrink-0">
                                <X size={13} />
                              </button>
                            </div>

                            {/* 세트 목록 */}
                            <div className="space-y-1.5">
                              {ex.set_details.map((s, si) => (
                                <div key={si} className="flex items-center gap-1.5 pl-1">
                                  <span className="text-[10px] font-bold text-slate-400 w-5 text-center">{si + 1}</span>
                                  <input type="text" placeholder="무게(kg)" value={s.weight}
                                    onChange={e => updateFormSet(bi, ei, si, "weight", e.target.value)}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                                  <input type="text" placeholder="횟수" value={s.reps}
                                    onChange={e => updateFormSet(bi, ei, si, "reps", e.target.value)}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                                  <button type="button" onClick={() => removeSet(bi, ei, si)} className="p-1 text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button type="button" onClick={() => addSet(bi, ei)}
                              className="ml-6 text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1">
                              <Plus size={11} />세트 추가
                            </button>
                          </div>
                        ))}
                      </div>

                      <button type="button" onClick={() => addExercise(bi)}
                        className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs font-bold hover:bg-white hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-1">
                        <Plus size={12} />운동 추가
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addBodyPart}
                  className="w-full mt-3 py-3 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm font-bold hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-2">
                  <Plus size={15} />부위 추가
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
