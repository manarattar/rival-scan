import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

const CATEGORY_STYLE = {
  Feature:      { bg: "rgba(14,165,233,0.12)",  text: "#7dd3fc", border: "rgba(14,165,233,0.25)"  },
  Fix:          { bg: "rgba(16,185,129,0.12)",  text: "#6ee7b7", border: "rgba(16,185,129,0.25)"  },
  Pricing:      { bg: "rgba(234,179,8,0.12)",   text: "#fde047", border: "rgba(234,179,8,0.25)"   },
  Integration:  { bg: "rgba(5,150,105,0.12)",   text: "#34d399", border: "rgba(5,150,105,0.25)"   },
  Deprecation:  { bg: "rgba(239,68,68,0.12)",   text: "#fca5a5", border: "rgba(239,68,68,0.25)"   },
  Announcement: { bg: "rgba(168,85,247,0.12)",  text: "#d8b4fe", border: "rgba(168,85,247,0.25)"  },
  Other:        { bg: "rgba(100,116,139,0.12)", text: "#94a3b8", border: "rgba(100,116,139,0.25)" },
};

const IMPACT_CONFIG = {
  High:   { color: "#f87171", dot: "#f87171", label: "High" },
  Medium: { color: "#fbbf24", dot: "#fbbf24", label: "Med"  },
  Low:    { color: "#34d399", dot: "#34d399", label: "Low"  },
};

const CATEGORIES = ["Feature", "Fix", "Pricing", "Integration", "Deprecation", "Announcement", "Other"];
const IMPACTS = ["High", "Medium", "Low"];

function UpdateCard({ update }) {
  const [expanded, setExpanded] = useState(false);
  const impact = IMPACT_CONFIG[update.impact] || IMPACT_CONFIG.Medium;
  const cat = CATEGORY_STYLE[update.category] || CATEGORY_STYLE.Other;

  const timeAgo = update.published_at
    ? formatDistanceToNow(new Date(update.published_at), { addSuffix: true })
    : update.fetched_at
    ? formatDistanceToNow(new Date(update.fetched_at), { addSuffix: true })
    : "recently";

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="rounded-xl p-4 cursor-pointer transition-all group"
      style={{
        background: "#101d14",
        border: `1px solid rgba(255,255,255,0.05)`,
        borderLeft: `3px solid ${update.competitor_color || "#059669"}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(5,150,105,0.25)`; e.currentTarget.style.borderLeftColor = update.competitor_color || "#059669"; e.currentTarget.style.background = "#131f17"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderLeftColor = update.competitor_color || "#059669"; e.currentTarget.style.background = "#101d14"; }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${update.competitor_color || "#059669"}18`, border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {update.competitor_emoji || "🏢"}
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-sm font-semibold text-slate-200">{update.competitor_name}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: cat.bg, color: cat.text, border: `1px solid ${cat.border}` }}
            >
              {update.category}
            </span>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: impact.dot }} />
              <span className="text-xs font-medium" style={{ color: impact.color }}>{impact.label}</span>
            </div>
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-slate-100 mb-1.5 leading-snug">{update.title}</p>

          {/* Summary */}
          {update.ai_summary && (
            <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{update.ai_summary}</p>
          )}

          {/* Expanded */}
          {expanded && update.content_raw && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#334155" }}>Source</p>
              <p className="text-xs leading-relaxed" style={{ color: "#475569" }}>{update.content_raw.slice(0, 500)}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 mt-2.5">
            <span className="text-xs" style={{ color: "#334155" }}>{timeAgo}</span>
            {update.url && (
              <a
                href={update.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs transition-colors"
                style={{ color: "#059669" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#34d399"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#059669"; }}
              >
                View source →
              </a>
            )}
            <span className="text-xs ml-auto capitalize" style={{ color: "#1e293b" }}>{update.source_type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpdatesFeed({ updates, competitors, selectedCompetitor, onFilterChange }) {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [impactFilter, setImpactFilter] = useState("");

  const currentComp = selectedCompetitor ? competitors.find((c) => c.id === selectedCompetitor) : null;

  const filtered = updates.filter((u) => {
    if (categoryFilter && u.category !== categoryFilter) return false;
    if (impactFilter && u.impact !== impactFilter) return false;
    return true;
  });

  const stats = [
    { label: "Total", value: updates.length, color: "#e2e8f0" },
    { label: "High Impact", value: updates.filter((u) => u.impact === "High").length, color: "#f87171" },
    { label: "Features", value: updates.filter((u) => u.category === "Feature").length, color: "#7dd3fc" },
    { label: "Pricing", value: updates.filter((u) => u.category === "Pricing").length, color: "#fde047" },
  ];

  const selectStyle = {
    background: "#101d14",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#94a3b8",
    borderRadius: "0.5rem",
    padding: "0.375rem 0.75rem",
    fontSize: "0.875rem",
    outline: "none",
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{ background: "#101d14", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "#334155" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5 items-center">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={selectStyle}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={impactFilter} onChange={(e) => setImpactFilter(e.target.value)} style={selectStyle}>
          <option value="">All impact levels</option>
          {IMPACTS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        {(categoryFilter || impactFilter) && (
          <button
            onClick={() => { setCategoryFilter(""); setImpactFilter(""); }}
            className="text-xs px-2 py-1.5 rounded-lg transition-colors"
            style={{ color: "#64748b" }}
          >
            Clear ×
          </button>
        )}
        <span className="ml-auto text-xs tabular-nums" style={{ color: "#334155" }}>{filtered.length} updates</span>
      </div>

      {/* Feed or empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">
            {categoryFilter || impactFilter ? "🔎" : currentComp?.update_count === 0 ? "📡" : "📭"}
          </div>
          {categoryFilter || impactFilter ? (
            <p style={{ color: "#64748b" }}>No updates match your filters</p>
          ) : currentComp?.update_count === 0 ? (
            <>
              <p className="text-slate-300 font-medium mb-1">No feed found for {currentComp.name}</p>
              <p className="text-sm max-w-xs mx-auto" style={{ color: "#475569" }}>
                Add an RSS feed URL, GitHub repo, or changelog URL, then hit Refresh.
              </p>
            </>
          ) : (
            <p style={{ color: "#64748b" }}>No updates yet — click Refresh to scan.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((update) => <UpdateCard key={update.id} update={update} />)}
        </div>
      )}
    </div>
  );
}
