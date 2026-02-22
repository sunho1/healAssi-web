export default function ReportTab() {
  return (
    <div className="pb-32 px-6 pt-10 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">주간 리포트</h1>
        <p className="text-slate-500 text-sm mt-1">이번 주 운동 달성률 85% 🔥</p>
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
        <h3 className="font-bold text-slate-800 mb-4">요일별 활동량</h3>
        <div className="flex justify-between items-end h-32 gap-2">
          {[40, 70, 30, 85, 50, 90, 20].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
              <div 
                className="w-full bg-blue-500 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: `${h}%` }}
              />
              <span className="text-xs text-slate-400 font-bold">
                {['월', '화', '수', '목', '금', '토', '일'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 font-bold mb-1">총 운동 시간</p>
          <p className="text-2xl font-extrabold text-slate-900">4h 20m</p>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 font-bold mb-1">소모 칼로리</p>
          <p className="text-2xl font-extrabold text-slate-900">2,450</p>
        </div>
      </div>
    </div>
  );
}