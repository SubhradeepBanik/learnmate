import { Link } from "react-router-dom";

export default function Card({ icon, title, children, to }) {
  const content = (
    <>
      <h3 className="mb-1 text-lg font-bold text-brand-head">{icon} {title}</h3>
      <p className="text-sm text-slate-500">{children}</p>
    </>
  );
  const className = "block h-full rounded-2xl border border-brand-line bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg";
  return to ? (
    <Link to={to} className={`${className} no-underline`}>{content}</Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
