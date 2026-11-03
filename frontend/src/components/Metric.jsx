export default function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-brand-line bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-brand/30">
      <div className="text-xs font-semibold text-brand-muted mb-2">{label}</div>
      <div className="text-2xl font-black text-brand-head">{value}</div>
    </div>
  );
}
