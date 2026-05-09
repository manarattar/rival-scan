import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

const CATEGORY_COLORS = {
  Feature: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Fix: "bg-green-500/20 text-green-300 border-green-500/30",
  Pricing: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Integration: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Deprecation: "bg-red-500/20 text-red-300 border-red-500/30",
  Announcement: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  Other: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const IMPACT_CONFIG = {
  High: { color: "text-red-400", dot: "bg-red-400", label: "High impact" },
  Medium: { color: "text-yellow-400", dot: "bg-yellow-400", label: "Medium impact" },
  Low: { color: "text-green-400", dot: "bg-green-400", label: "Low impact" },
};

const CATEGORIES = ["Feature", "Fix", "Pricing", "Integration", "Deprecation", "Announcement", "Other"];
const IMPACTS = ["High", "Medium", "Low"];

function UpdateCard({ update }) {
  const [expanded, setExpanded] = useState(false);
  const impact = IMPACT_CONFIG[update.impact] || IMPACT_CONFIG.Medium;
  const catStyle = CATEGORY_COLORS[update.category] || CATEGORY_COLORS.Other;

  const timeAgo = update.published_at
    ? formatDistanceToNow(new Date(update.published_at), { addSuffix: true })
    : update.fetched_at
    ? formatDistanceToNow(new Date(update.fetched_at), { addSuffix: true })
    : "recently";

  return (
    <div
      className="bg-[#1a1a2e] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        {/* Competitor avatar */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 border border-white/5"
          style={{ backgroundColor: `${update.competitor_color}20` }}
        >
          {update.competitor_emoji || "🏢"}
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-slate-200">{update.competitor_name}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${catStyle}`}
            >
              {update.category}
            </span>
            <div className="flex items-center gap-1 ml-auto">
              <span className={`w-1.5 h-1.5 rounded-full ${impact.dot}`} />
              <span className={`text-xs ${impact.color} hidden sm:inline`}>{impact.label}</span>
            </div>
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-slate-100 mb-1.5">{update.title}</p>

          {/* AI Summary */}
          {update.ai_summary && (
            <p className="text-sm text-slate-400 leading-relaxed">{update.ai_summary}</p>
          )}

          {/* Expanded: raw content */}
          {expanded && update.content_raw && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Original text</p>
              <p className="text-xs text-slate-500 leading-relaxed">{update.content_raw.slice(0, 500)}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 mt-2.5">
            <span className="text-xs text-slate-600">{timeAgo}</span>
            {update.url && (
              <a
                href={update.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View source →
              </a>
            )}
            <span className="text-xs text-slate-700 ml-auto capitalize">{update.source_type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpdatesFeed({ updates, competitors, selectedCompetitor, onFilterChange }) {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [impactFilter, setImpactFilter] = useState("");

  const filtered = updates.filter((u) => {
    if (categoryFilter && u.category !== categoryFilter) return false;
    if (impactFilter && u.impact !== impactFilter) return false;
    return true;
  });

  const stats = {
    total: updates.length,
    high: updates.filter((u) => u.impact === "High").length,
    features: updates.filter((u) => u.category === "Feature").length,
    pricing: updates.filter((u) => u.category === "Pricing").length,
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Updates", value: stats.total, color: "text-slate-300" },
          { label: "High Impact", value: stats.high, color: "text-red-400" },
          { label: "New Features", value: stats.features, color: "text-blue-400" },
          { label: "Pricing Changes", value: stats.pricing, color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1a1a2e] rounded-xl p-3 border border-white/5">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-[#1a1a2e] border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={impactFilter}
          onChange={(e) => setImpactFilter(e.target.value)}
          className="bg-[#1a1a2e] border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All impact levels</option>
          {IMPACTS.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        {(categoryFilter || impactFilter) && (
          <button
            onClick={() => { setCategoryFilter(""); setImpactFilter(""); }}
            className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-slate-600 self-center">{filtered.length} updates</span>
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-400">No updates match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((update) => (
            <UpdateCard key={update.id} update={update} />
          ))}
        </div>
      )}
    </div>
  );
}
