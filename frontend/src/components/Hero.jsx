export default function Hero({ title, children }) {
  return (
    <div className="mb-6 rounded-2xl border-l-4 border-brand bg-gradient-to-r from-brand-hero to-white p-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-2 space-y-1 text-slate-600">{children}</div>
    </div>
  );
}