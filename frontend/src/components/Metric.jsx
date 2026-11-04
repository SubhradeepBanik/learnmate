export default function Metric({ label, value, icon, trend, sublabel }) {
  return (
    <div className="group rounded-2xl border border-[#DDE8DC] bg-white/95 backdrop-blur-sm p-4 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#A3BFA8]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#52796F] truncate">{label}</span>
        {icon && (
          <span className="w-8 h-8 rounded-lg bg-[#DDE8DC]/60 flex items-center justify-center text-[#1B4332] text-sm group-hover:scale-110 transition-transform">
            {icon}
          </span>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-black text-[#143D2B] tracking-tight">{value}</div>
      {(trend || sublabel) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#52796F]">
          {trend && <span className="text-[#1B4332] font-bold">{trend}</span>}
          {sublabel && <span className="truncate">{sublabel}</span>}
        </div>
      )}
    </div>
  );
}
