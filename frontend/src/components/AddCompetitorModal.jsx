import { useState } from "react";
import { createCompetitor } from "../api";

const EMOJIS = ["🏢", "🚀", "⚡", "🔥", "🌊", "🎯", "💡", "🤖", "🦄", "🌍", "🛸", "💎"];
const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4", "#10a37f", "#c17940",
];

export default function AddCompetitorModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    website_url: "",
    changelog_url: "",
    github_repo: "",
    rss_url: "",
    description: "",
    logo_emoji: "🏢",
    color: "#6366f1",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.website_url.trim()) {
      setError("Name and website URL are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        changelog_url: form.changelog_url || null,
        github_repo: form.github_repo || null,
        rss_url: form.rss_url || null,
        description: form.description || null,
      };
      const res = await createCompetitor(payload);
      onAdded(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to add competitor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-slate-100">Add Competitor</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Emoji + Color picker */}
          <div className="flex gap-4 items-start">
            <div>
              <label className="block text-xs text-slate-500 mb-2">Icon</label>
              <div className="flex flex-wrap gap-1.5 w-36">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => set("logo_emoji", e)}
                    className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-colors ${
                      form.logo_emoji === e ? "bg-white/20 ring-2 ring-indigo-500" : "hover:bg-white/10"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-2">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("color", c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      form.color === c ? "scale-125 ring-2 ring-white" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Fields */}
          {[
            { key: "name", label: "Company Name *", placeholder: "e.g. Stripe", type: "text" },
            { key: "website_url", label: "Website URL *", placeholder: "https://stripe.com", type: "url" },
            { key: "description", label: "Description", placeholder: "What do they do?", type: "text" },
            { key: "rss_url", label: "RSS/Atom Feed URL", placeholder: "https://stripe.com/blog/feed.rss", type: "url" },
            { key: "changelog_url", label: "Changelog URL", placeholder: "https://stripe.com/changelog", type: "url" },
            { key: "github_repo", label: "GitHub Repo", placeholder: "stripe/stripe-node", type: "text" },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#0f0f13] border border-white/10 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          ))}

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                "Add & Fetch Updates"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
