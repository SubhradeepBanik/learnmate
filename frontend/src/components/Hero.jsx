export default function Hero({ title, children }) {
  return (
    <div className="mb-6 rounded-2xl bg-white border border-brand-line p-6 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-brand rounded-l-2xl" />
      <div className="pl-4">
        <h2 className="text-xl font-black text-brand-head">{title}</h2>
        <div className="mt-2 space-y-1 text-sm text-brand-muted">{children}</div>
      </div>
    </div>
  );
}
