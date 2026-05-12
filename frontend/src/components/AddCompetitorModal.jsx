import { useState } from "react";
import { createCompetitor } from "../api";

const EMOJIS = ["🏢", "🚀", "⚡", "🔥", "🌊", "🎯", "💡", "🤖", "🦄", "🌍", "🛸", "💎"];
const COLORS = [
  "#06b6d4", "#0ea5e9", "#6366f1", "#8b5cf6",
  "#ec4899", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#10b981", "#10a37f", "#c17940",
];

const SUGGESTED_COMPANIES = [
  {
    category: "AI Labs",
    items: [
      { name: "OpenAI", website_url: "https://openai.com", changelog_url: "https://platform.openai.com/docs/changelog", rss_url: null, github_repo: null, logo_emoji: "🤖", color: "#10a37f", description: "GPT-4, DALL-E, Whisper" },
      { name: "Anthropic", website_url: "https://anthropic.com", changelog_url: "https://docs.anthropic.com/en/release-notes/api", rss_url: null, github_repo: null, logo_emoji: "⚡", color: "#c17940", description: "Claude model family" },
      { name: "Mistral AI", website_url: "https://mistral.ai", changelog_url: null, rss_url: null, github_repo: "mistralai/mistral-src", logo_emoji: "🌊", color: "#ff7000", description: "Open + efficient LLMs" },
      { name: "Cohere", website_url: "https://cohere.com", changelog_url: null, rss_url: null, github_repo: "cohere-ai/cohere-python", logo_emoji: "🔷", color: "#39594d", description: "Enterprise NLP APIs" },
      { name: "Google DeepMind", website_url: "https://deepmind.google", changelog_url: null, rss_url: null, github_repo: null, logo_emoji: "🧠", color: "#4285f4", description: "Gemini, AlphaCode, Imagen" },
    ],
  },
  {
    category: "AI Inference & Tools",
    items: [
      { name: "Groq", website_url: "https://groq.com", changelog_url: null, rss_url: null, github_repo: "groq/groq-python", logo_emoji: "⚡", color: "#f43f5e", description: "Ultra-fast LPU inference" },
      { name: "Together AI", website_url: "https://www.together.ai", changelog_url: null, rss_url: null, github_repo: "togethercomputer/together-python", logo_emoji: "🤝", color: "#7c3aed", description: "Open-source model hosting" },
      { name: "Replicate", website_url: "https://replicate.com", changelog_url: null, rss_url: null, github_repo: "replicate/replicate-python", logo_emoji: "🔁", color: "#0ea5e9", description: "Run ML models via API" },
      { name: "Hugging Face", website_url: "https://huggingface.co", changelog_url: null, rss_url: "https://huggingface.co/blog/feed.xml", github_repo: "huggingface/transformers", logo_emoji: "🤗", color: "#ffd21e", description: "500k+ open-source models" },
      { name: "Perplexity", website_url: "https://www.perplexity.ai", changelog_url: null, rss_url: null, github_repo: null, logo_emoji: "🔍", color: "#20b2aa", description: "AI-powered search & answers" },
    ],
  },
  {
    category: "Dev Tools & Cloud",
    items: [
      { name: "Vercel", website_url: "https://vercel.com", changelog_url: "https://vercel.com/changelog", rss_url: null, github_repo: null, logo_emoji: "▲", color: "#ffffff", description: "Frontend cloud & AI SDK" },
      { name: "Supabase", website_url: "https://supabase.com", changelog_url: null, rss_url: null, github_repo: "supabase/supabase", logo_emoji: "🔋", color: "#3ecf8e", description: "Open-source Firebase alternative" },
      { name: "Railway", website_url: "https://railway.app", changelog_url: null, rss_url: null, github_repo: null, logo_emoji: "🚂", color: "#7000ff", description: "Deploy anything instantly" },
      { name: "GitHub", website_url: "https://github.com", changelog_url: "https://github.blog/changelog/", rss_url: null, github_repo: null, logo_emoji: "🐙", color: "#6e40c9", description: "Code hosting + Copilot" },
      { name: "Stripe", website_url: "https://stripe.com", changelog_url: "https://stripe.com/docs/upgrades", rss_url: null, github_repo: "stripe/stripe-python", logo_emoji: "💳", color: "#635bff", description: "Payments infrastructure" },
    ],
  },
  {
    category: "Productivity & PM",
    items: [
      { name: "Linear", website_url: "https://linear.app", changelog_url: "https://linear.app/changelog", rss_url: null, github_repo: null, logo_emoji: "📐", color: "#5e6ad2", description: "Issue tracking for software teams" },
      { name: "Notion", website_url: "https://notion.so", changelog_url: null, rss_url: null, github_repo: null, logo_emoji: "📝", color: "#ffffff", description: "All-in-one workspace" },
      { name: "Figma", website_url: "https://figma.com", changelog_url: null, rss_url: null, github_repo: null, logo_emoji: "🎨", color: "#f24e1e", description: "Collaborative design tool" },
      { name: "Slack", website_url: "https://slack.com", changelog_url: null, rss_url: null, github_repo: null, logo_emoji: "💬", color: "#4a154b", description: "Team messaging platform" },
      { name: "Airtable", website_url: "https://airtable.com", changelog_url: null, rss_url: null, github_repo: null, logo_emoji: "🗃️", color: "#2d7ff9", description: "Low-code database platform" },
    ],
  },
];

export default function AddCompetitorModal({ onClose, onAdded }) {
  const [mode, setMode] = useState("browse");
  const [form, setForm] = useState({ name: "", website_url: "", changelog_url: "", github_repo: "", rss_url: "", description: "", logo_emoji: "🏢", color: "#06b6d4" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const prefill = (company) => {
    setForm({ name: company.name, website_url: company.website_url, changelog_url: company.changelog_url || "", github_repo: company.github_repo || "", rss_url: company.rss_url || "", description: company.description || "", logo_emoji: company.logo_emoji, color: company.color });
    setMode("custom");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.website_url.trim()) { setError("Name and website URL are required."); return; }
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, changelog_url: form.changelog_url || null, github_repo: form.github_repo || null, rss_url: form.rss_url || null, description: form.description || null };
      const res = await createCompetitor(payload);
      onAdded(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to add competitor.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "#07090f",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "0.5rem",
    padding: "0.5rem 0.75rem",
    color: "#e2e8f0",
    fontSize: "0.875rem",
    outline: "none",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: "#0b1018", border: "1px solid rgba(6,182,212,0.15)" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-100">Track Competitor</h2>
            <div className="flex rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.04)" }}>
              {["browse", "custom"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                  style={mode === m
                    ? { background: "rgba(6,182,212,0.2)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.3)" }
                    : { color: "#64748b", border: "1px solid transparent" }
                  }
                >
                  {m === "browse" ? "Quick Add" : "Custom"}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 transition-colors hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {mode === "browse" ? (
          <div className="p-5 space-y-5">
            {SUGGESTED_COMPANIES.map((group) => (
              <div key={group.category}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#06b6d4" }}>
                  {group.category}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((company) => (
                    <button
                      key={company.name}
                      onClick={() => prefill(company)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,182,212,0.06)"; e.currentTarget.style.borderColor = "rgba(6,182,212,0.2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                    >
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: `${company.color}20` }}>
                        {company.logo_emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{company.name}</p>
                        <p className="text-xs truncate" style={{ color: "#475569" }}>{company.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-center pt-1" style={{ color: "#334155" }}>
              Click any company to pre-fill, then customise and save.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Emoji + Color */}
            <div className="flex gap-4 items-start">
              <div>
                <label className="block text-xs text-slate-500 mb-2">Icon</label>
                <div className="flex flex-wrap gap-1.5 w-36">
                  {EMOJIS.map((e) => (
                    <button key={e} type="button" onClick={() => set("logo_emoji", e)}
                      className="w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all"
                      style={form.logo_emoji === e
                        ? { background: "rgba(6,182,212,0.2)", outline: "2px solid rgba(6,182,212,0.5)" }
                        : {}
                      }
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
                    <button key={c} type="button" onClick={() => set("color", c)}
                      className="w-7 h-7 rounded-full transition-transform"
                      style={{ backgroundColor: c, transform: form.color === c ? "scale(1.25)" : "scale(1)", outline: form.color === c ? "2px solid rgba(255,255,255,0.5)" : "none", outlineOffset: "1px" }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {[
              { key: "name", label: "Company Name *", placeholder: "e.g. Stripe", type: "text" },
              { key: "website_url", label: "Website URL *", placeholder: "https://stripe.com", type: "url" },
              { key: "description", label: "Description", placeholder: "What do they do?", type: "text" },
              { key: "rss_url", label: "RSS/Atom Feed URL", placeholder: "https://stripe.com/blog/feed.rss", type: "url" },
              { key: "changelog_url", label: "Changelog URL", placeholder: "https://stripe.com/changelog", type: "url" },
              { key: "github_repo", label: "GitHub Repo", placeholder: "stripe/stripe-node", type: "text" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                />
              </div>
            ))}

            {error && (
              <p className="text-sm rounded-lg px-4 py-2" style={{ color: "#fca5a5", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setMode("browse")}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}
              >
                ← Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "rgba(6,182,212,0.15)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.3)" }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "rgba(6,182,212,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(6,182,212,0.15)"; }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(103,232,249,0.2)", borderTopColor: "#67e8f9" }} />
                    Adding...
                  </>
                ) : "Add & Scan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
