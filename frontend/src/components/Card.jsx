import { Link } from "react-router-dom";

export default function Card({ icon, title, children, to }) {
  const content = (
    <>
      <div className="mb-3 w-10 h-10 rounded-xl bg-brand-tint border border-brand/10 flex items-center justify-center text-xl flex-shrink-0">
        {icon}
      </div>
      <h3 className="mb-1.5 text-sm font-bold text-brand-head">{title}</h3>
      <p className="text-xs text-brand-muted leading-relaxed">{children}</p>
      {to && (
        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-brand">
          <span>Open</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      )}
    </>
  );

  const cls = "block h-full rounded-2xl border border-brand-line bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-brand/30";

  return to ? (
    <Link to={to} className={`${cls} no-underline`}>{content}</Link>
  ) : (
    <div className={cls}>{content}</div>
  );
}
