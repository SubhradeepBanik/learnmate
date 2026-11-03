export default function Card({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-brand-line bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <h3 className="mb-1 text-lg font-bold">
        {icon} {title}
      </h3>
      <p className="text-sm text-slate-500">{children}</p>
    </div>
  );
}