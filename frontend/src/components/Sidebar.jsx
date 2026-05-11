import { useState } from "react";
import { deleteCompetitor, refreshCompetitor } from "../api";

const STATUS_COLOR = {
  ok: "bg-green-500",
  fetching: "bg-yellow-400 animate-pulse",
  error: "bg-red-500",
  pending: "bg-slate-500",
};

export default function Sidebar({
  competitors,
  selected,
  onSelect,
  onAdd,
  onRefresh,
  onDelete,
}) {
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
    <aside className="h-full bg-[#13131a] border-r border-white/5 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Competitors
          </span>
          <span className="text-xs text-slate-600">{competitors.length}</span>
        </div>
        <button
          onClick={onAdd}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Competitor
        </button>
      </div>

      {/* All updates option */}
      <div className="px-3 pt-3">
        <button
          onClick={() => onSelect(null)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            selected === null
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
          }`}
        >
          <span className="text-base">📊</span>
          <span className="font-medium">All Updates</span>
        </button>
      </div>

      {/* Competitor list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {competitors.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            onMouseEnter={() => setHoveredId(c.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
              selected === c.id
                ? "bg-white/8 border border-white/10"
                : "hover:bg-white/5"
            }`}
          >
            {/* Color accent */}
            <div
              className="w-0.5 absolute left-0 top-2 bottom-2 rounded-full"
              style={{ backgroundColor: c.color }}
            />

            <span className="text-xl ml-1">{c.logo_emoji}</span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-200 truncate">{c.name}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    c.fetch_status === "ok" && !c.update_count
                      ? "bg-amber-500"
                      : STATUS_COLOR[c.fetch_status] || "bg-slate-500"
                  }`}
                  title={c.fetch_status === "ok" && !c.update_count ? "No feed found" : c.fetch_status}
                />
              </div>
              <div className="text-xs text-slate-500">
                {c.update_count ? `${c.update_count} updates` : "no feed found"}
              </div>
            </div>

            {/* Action buttons on hover */}
            {hoveredId === c.id && (
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => handleRefresh(e, c.id)}
                  className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
                  title="Refresh"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                {!c.is_demo && (
                  <button
                    onClick={(e) => handleDelete(e, c.id)}
                    className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
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
      <div className="p-4 border-t border-white/5">
        <p className="text-xs text-slate-600 text-center">
          Powered by AI · Mock mode available
        </p>
      </div>
    </aside>
  );
}
