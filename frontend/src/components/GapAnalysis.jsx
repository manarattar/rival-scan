import { useState } from "react";
import { runGapAnalysis } from "../api";

const URGENCY_CONFIG = {
  High:   { bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)",   badge: { bg: "rgba(239,68,68,0.15)",  color: "#fca5a5" }, dot: "#f87171" },
  Medium: { bg: "rgba(234,179,8,0.08)",   border: "rgba(234,179,8,0.2)",   badge: { bg: "rgba(234,179,8,0.15)",  color: "#fde047" }, dot: "#fbbf24" },
  Low:    { bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)",  badge: { bg: "rgba(16,185,129,0.15)", color: "#6ee7b7" }, dot: "#34d399" },
};

const cardStyle = {
  background: "#0f1620",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: "0.75rem",
  padding: "1.25rem",
};

const textareaStyle = {
  width: "100%",
  background: "#0f1620",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "0.75rem",
  padding: "0.75rem 1rem",
  color: "#e2e8f0",
  fontSize: "0.875rem",
  resize: "none",
  outline: "none",
};

export default function GapAnalysis({ competitors }) {
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleCompetitor = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) { setError("Please describe your product first."); return; }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await runGapAnalysis({
        your_product_description: description,
        competitor_ids: selectedIds.length > 0 ? selectedIds : null,
      });
      setResult(res.data);
    } catch {
      setError("Analysis failed. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #06b6d4, #0ea5e9)" }} />
          <h2 className="text-xl font-bold text-slate-100">Gap Analysis</h2>
        </div>
        <p className="text-sm ml-3" style={{ color: "#64748b" }}>
          Describe your product — discover what competitors have shipped that you haven't.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        {/* Product description */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Your Product</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. A developer-first API monitoring tool that tracks latency, errors, and usage patterns in real time with alerting and Slack integration."
            rows={4}
            style={textareaStyle}
            onFocus={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          />
        </div>

        {/* Competitor selector */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Analyze against{" "}
            <span className="font-normal" style={{ color: "#475569" }}>(optional — defaults to all)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {competitors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCompetitor(c.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all"
                style={selectedIds.includes(c.id)
                  ? { background: "rgba(6,182,212,0.15)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.35)" }
                  : { background: "rgba(255,255,255,0.04)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                <span>{c.logo_emoji}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm rounded-lg px-4 py-2" style={{ color: "#fca5a5", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
          style={{ background: "rgba(6,182,212,0.15)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.3)" }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "rgba(6,182,212,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(6,182,212,0.15)"; }}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(103,232,249,0.2)", borderTopColor: "#67e8f9" }} />
              Scanning...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Run Gap Analysis
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="space-y-5">
          {/* Summary */}
          <div style={cardStyle}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#06b6d4" }}>
              Strategic Overview
            </p>
            <p className="text-sm leading-relaxed text-slate-300">{result.summary}</p>
          </div>

          {/* Top threats */}
          {result.top_threats?.length > 0 && (
            <div style={{ ...cardStyle, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#f87171" }}>
                ⚡ Top Threats
              </p>
              <ul className="space-y-2">
                {result.top_threats.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span style={{ color: "#f87171" }} className="mt-0.5 flex-shrink-0">▸</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
              Feature Gaps ({result.gaps?.length})
            </p>
            <div className="space-y-3">
              {result.gaps?.map((gap, i) => {
                const cfg = URGENCY_CONFIG[gap.urgency] || URGENCY_CONFIG.Medium;
                return (
                  <div key={i} className="rounded-xl p-4" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: cfg.dot }} />
                        <span className="text-sm font-semibold text-slate-100">{gap.feature}</span>
                        <span className="text-xs" style={{ color: "#475569" }}>→ {gap.competitor}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={cfg.badge}>
                        {gap.urgency}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed ml-3.5" style={{ color: "#64748b" }}>{gap.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
