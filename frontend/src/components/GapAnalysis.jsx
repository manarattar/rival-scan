import { useState } from "react";
import { runGapAnalysis } from "../api";

const URGENCY_CONFIG = {
  High: { bg: "bg-red-500/10 border-red-500/30", badge: "bg-red-500/20 text-red-300", icon: "🔴" },
  Medium: { bg: "bg-yellow-500/10 border-yellow-500/30", badge: "bg-yellow-500/20 text-yellow-300", icon: "🟡" },
  Low: { bg: "bg-green-500/10 border-green-500/30", badge: "bg-green-500/20 text-green-300", icon: "🟢" },
};

export default function GapAnalysis({ competitors }) {
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleCompetitor = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe your product first.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await runGapAnalysis({
        your_product_description: description,
        competitor_ids: selectedIds.length > 0 ? selectedIds : null,
      });
      setResult(res.data);
    } catch (e) {
      setError("Analysis failed. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 mb-1">Gap Analysis</h2>
        <p className="text-sm text-slate-400">
          Describe your product and discover what competitors have that you don't.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Your Product
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. A developer-first API monitoring tool that tracks latency, errors, and usage patterns in real time with alerting and Slack integration."
            rows={4}
            className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Analyze against{" "}
            <span className="text-slate-500 font-normal">(optional — defaults to all)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {competitors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCompetitor(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedIds.includes(c.id)
                    ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                }`}
              >
                <span>{c.logo_emoji}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <span>🔍</span>
              Run Gap Analysis
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary */}
          <div className="bg-[#1a1a2e] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Strategic Overview
            </h3>
            <p className="text-slate-200 leading-relaxed">{result.summary}</p>
          </div>

          {/* Top Threats */}
          {result.top_threats?.length > 0 && (
            <div className="bg-red-500/5 rounded-xl p-5 border border-red-500/20">
              <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-3">
                ⚠️ Top Threats
              </h3>
              <ul className="space-y-2">
                {result.top_threats.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-red-400 mt-0.5">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Feature Gaps ({result.gaps?.length})
            </h3>
            <div className="space-y-3">
              {result.gaps?.map((gap, i) => {
                const cfg = URGENCY_CONFIG[gap.urgency] || URGENCY_CONFIG.Medium;
                return (
                  <div
                    key={i}
                    className={`rounded-xl p-4 border ${cfg.bg}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-sm font-semibold text-slate-100">{gap.feature}</span>
                        <span className="text-xs text-slate-500 ml-2">→ {gap.competitor}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cfg.badge}`}>
                        {cfg.icon} {gap.urgency}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{gap.description}</p>
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
