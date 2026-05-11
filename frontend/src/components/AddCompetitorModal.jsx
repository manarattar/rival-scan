import { useState } from "react";
import { createCompetitor } from "../api";

const EMOJIS = ["🏢", "🚀", "⚡", "🔥", "🌊", "🎯", "💡", "🤖", "🦄", "🌍", "🛸", "💎"];
const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4", "#10a37f", "#c17940",
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
  const [mode, setMode] = useState("browse"); // "browse" | "custom"
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

  const prefill = (company) => {
    setForm({
      name: company.name,
      website_url: company.website_url,
      changelog_url: company.changelog_url || "",
      github_repo: company.github_repo || "",
      rss_url: company.rss_url || "",
      description: company.description || "",
      logo_emoji: company.logo_emoji,
      color: company.color,
    });
    setMode("custom");
  };

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
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-100">Add Competitor</h2>
            <div className="flex bg-white/5 rounded-lg p-0.5">
              {["browse", "custom"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    mode === m ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {m === "browse" ? "Quick Add" : "Custom"}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {mode === "browse" ? (
          /* ── Quick Add: suggested companies ── */
          <div className="p-5 space-y-5">
            {SUGGESTED_COMPANIES.map((group) => (
              <div key={group.category}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {group.category}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((company) => (
                    <button
                      key={company.name}
                      onClick={() => prefill(company)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-left transition-colors group"
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                        style={{ backgroundColor: `${company.color}25` }}
                      >
                        {company.logo_emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{company.name}</p>
                        <p className="text-xs text-slate-500 truncate">{company.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-600 text-center pt-2">
              Click any company to pre-fill the form, then customise and save.
            </p>
          </div>
        ) : (
          /* ── Custom form ── */
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
                onClick={() => setMode("browse")}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 text-sm transition-colors"
              >
                ← Back
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
        )}
      </div>
    </div>
  );
}
