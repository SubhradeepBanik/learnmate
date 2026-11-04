import { Link } from "react-router-dom";
import { NavIcon } from "./Icons";

export default function Card({ icon, title, children, to, badge }) {
  const content = (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#DDE8DC] border border-[#A3BFA8]/40 flex items-center justify-center flex-shrink-0 text-[#1B4332] shadow-sm transition-transform duration-300 group-hover:scale-110">
            {typeof icon === "string" ? <NavIcon name={icon} className="w-5 h-5 text-[#1B4332]" /> : icon}
          </div>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/20">
              {badge}
            </span>
          )}
        </div>
        <h3 className="mb-1.5 text-sm font-black text-[#143D2B] tracking-tight">{title}</h3>
        <p className="text-xs text-[#52796F] leading-relaxed font-medium">{children}</p>
      </div>
      {to && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#1B4332] group-hover:text-[#143D2B] transition-colors">
          <span>Explore</span>
          <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      )}
    </div>
  );

  const cls = "group block h-full rounded-2xl border border-[#DDE8DC] bg-white/95 backdrop-blur-sm p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#A3BFA8] hover:bg-white";

  return to ? (
    <Link to={to} className={`${cls} no-underline`}>{content}</Link>
  ) : (
    <div className={cls}>{content}</div>
  );
}
