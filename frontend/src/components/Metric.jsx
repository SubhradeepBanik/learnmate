export default function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-brand-line bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-brand-head">{value}</div>
    </div>
  );
}