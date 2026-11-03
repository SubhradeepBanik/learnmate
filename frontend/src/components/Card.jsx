import { Link } from "react-router-dom";

export default function Card({ icon, title, children, to }) {
  const content = (
    <>
      <h3 className="mb-1 text-lg font-bold">
        {icon} {title}
      </h3>
      <p className="text-sm text-slate-500">{children}</p>
    </>
  );

  const className =
    "block rounded-2xl border border-brand-line bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg cursor-pointer";

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
