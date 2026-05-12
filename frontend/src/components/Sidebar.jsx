import { useState } from "react";
import { deleteCompetitor, refreshCompetitor } from "../api";

const STATUS_COLOR = {
  ok: "bg-emerald-500",
  fetching: "bg-cyan-400 animate-pulse",
  error: "bg-red-500",
  pending: "bg-slate-500",
};

export default function Sidebar({ competitors, selected, onSelect, onAdd, onRefresh, onDelete }) {
  const [hoveredId, setHoveredId] = useState(null);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Remove this competitor and all its updates?")) return;
    await deleteCompetitor(id);
    onDelete(id);
  };

  const handleRefresh = async (e, id) => {
    e.stopPropagation();
    await refreshCompetitor(id);
    onRefresh();
  };

  return (
    <aside className="h-full flex flex-col" style={{ background: "#0b1018", borderRight: "1px solid rgba(6,182,212,0.1)" }}>
      {/* Header */}
      <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#06b6d4" }}>
            Competitors
          </span>
          <span className="text-xs text-slate-600 tabular-nums">{competitors.length}</span>
        </div>
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: "rgba(6,182,212,0.12)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.25)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,182,212,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(6,182,212,0.12)"; }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Track Competitor
        </button>
      </div>

      {/* All updates */}
      <div className="px-3 pt-3">
        <button
          onClick={() => onSelect(null)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
          style={selected === null
            ? { background: "rgba(6,182,212,0.1)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.2)" }
            : { color: "#94a3b8", border: "1px solid transparent" }
          }
        >
          <span className="text-base">📡</span>
          <span className="font-medium">All Updates</span>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 my-2" style={{ height: "1px", background: "rgba(255,255,255,0.04)" }} />

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1">
        {competitors.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            onMouseEnter={() => setHoveredId(c.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
            style={selected === c.id
              ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(6,182,212,0.2)" }
              : { border: "1px solid transparent" }
            }
          >
            {/* Color stripe */}
            <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ backgroundColor: c.color }} />

            <span className="text-xl ml-1">{c.logo_emoji}</span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-200 truncate">{c.name}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    c.fetch_status === "ok" && !c.update_count ? "bg-amber-500" : STATUS_COLOR[c.fetch_status] || "bg-slate-500"
                  }`}
                  title={c.fetch_status}
                />
              </div>
              <div className="text-xs" style={{ color: "#475569" }}>
                {c.update_count ? `${c.update_count} updates` : "no feed found"}
              </div>
            </div>

            {hoveredId === c.id && (
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => handleRefresh(e, c.id)}
                  className="p-1 rounded transition-colors text-slate-500 hover:text-cyan-400"
                  title="Refresh"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                {!c.is_demo && (
                  <button
                    onClick={(e) => handleDelete(e, c.id)}
                    className="p-1 rounded transition-colors text-slate-500 hover:text-red-400"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs" style={{ color: "#334155" }}>Auto-refresh · daily · AI-powered</p>
        </div>
      </div>
    </aside>
  );
}
