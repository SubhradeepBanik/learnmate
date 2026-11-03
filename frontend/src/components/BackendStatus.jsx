import { useEffect, useState } from "react";
import { getHealth } from "../api/client";
import { useLanguage } from "../context/LanguageContext";

export default function BackendStatus() {
  const { t } = useLanguage();
  const [state, setState] = useState("checking"); // checking | ok | down

  useEffect(() => {
    getHealth()
      .then(() => setState("ok"))
      .catch(() => setState("down"));
  }, []);

  const color =
    state === "ok" ? "bg-green-500" : state === "down" ? "bg-red-500" : "bg-amber-400";

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
      {t("sidebar.backend")}: {state}
    </div>
  );
}