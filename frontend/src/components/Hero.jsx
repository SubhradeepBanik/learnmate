export default function Hero({ title, children }) {
  return (
    <div className="mb-6 rounded-3xl bg-gradient-to-br from-[#143D2B] via-[#1B4332] to-[#143D2B] border border-[#A3BFA8]/20 p-6 sm:p-7 shadow-md text-[#F5F7F2] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#A3BFA8]/10 blur-xl pointer-events-none" />
      <div className="relative z-10">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{title}</h2>
        <div className="mt-2 space-y-1 text-xs sm:text-sm text-[#DDE8DC]/90 leading-relaxed font-medium">{children}</div>
      </div>
    </div>
  );
}
