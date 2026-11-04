import { useEffect, useState } from "react";
import { getHealth } from "../api/client";
import { useLanguage } from "../context/LanguageContext";

export default function BackendStatus() {
  const { t } = useLanguage();
  const [state, setState] = useState("checking"); // checking | ok | down | demo

  useEffect(() => {
    getHealth()
      .then(() => setState("ok"))
      .catch(() => {
        // If hosted on Vercel without a cloud backend URL configured, show demo mode rather than a scary error
        if (window.location.hostname !== "localhost" && !import.meta.env.VITE_API_BASE_URL) {
          setState("demo");
        } else {
          setState("down");
        }
      });
  }, []);

  const color =
    state === "ok"
      ? "bg-emerald-500"
      : state === "demo"
      ? "bg-emerald-400"
      : state === "down"
      ? "bg-rose-500"
      : "bg-amber-400";

  const label =
    state === "ok"
      ? "online"
      : state === "demo"
      ? "cloud demo"
      : state === "down"
      ? "offline"
      : "checking";

  return (
    <div
      className="flex items-center gap-2 text-[11px] text-[#A3BFA8] font-medium"
      title={
        state === "demo"
          ? "Running in cloud demo mode with built-in data. Connect a deployed FastAPI backend to enable live AI RAG."
          : `Backend is ${state}`
      }
    >
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      <span>{t("sidebar.backend")}:</span>
      <span className="capitalize font-semibold text-[#F5F7F2]">{label}</span>
    </div>
  );
}
