import { useEffect, useState } from "react";
import { getCompetitors, getUpdates, getHealth } from "./api";
import Sidebar from "./components/Sidebar";
import UpdatesFeed from "./components/UpdatesFeed";
import GapAnalysis from "./components/GapAnalysis";
import AddCompetitorModal from "./components/AddCompetitorModal";

export default function App() {
  const [competitors, setCompetitors] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [activeTab, setActiveTab] = useState("feed");
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchAll = async () => {
    try {
      const [compRes, updRes] = await Promise.all([
        getCompetitors(),
        getUpdates({ limit: 50 }),
      ]);
      setCompetitors(Array.isArray(compRes.data) ? compRes.data : []);
      setUpdates(Array.isArray(updRes.data) ? updRes.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const id = setInterval(() => { getHealth().catch(() => {}); }, 14 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const fetchUpdates = async (competitorId) => {
    const res = await getUpdates({ competitor_id: competitorId || undefined, limit: 50 });
    setUpdates(Array.isArray(res.data) ? res.data : []);
  };

  const handleSelectCompetitor = (id) => {
    setSelectedCompetitor(id);
    fetchUpdates(id);
    setSidebarOpen(false);
  };

  const handleCompetitorAdded = (newComp) => {
    setCompetitors((prev) => [newComp, ...prev]);
    setShowAddModal(false);
  };

  const handleCompetitorDeleted = (id) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
    if (selectedCompetitor === id) {
      setSelectedCompetitor(null);
      fetchUpdates(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#07090f", color: "#e2e8f0" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} w-72 flex-shrink-0`}>
        <Sidebar
          competitors={competitors}
          selected={selectedCompetitor}
          onSelect={handleSelectCompetitor}
          onAdd={() => setShowAddModal(true)}
          onRefresh={fetchAll}
          onDelete={handleCompetitorDeleted}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header style={{ background: "#0b1018", borderBottom: "1px solid rgba(6,182,212,0.12)" }} className="flex items-center gap-3 px-4 py-3">
          <button className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)" }} className="w-7 h-7 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold" style={{ background: "linear-gradient(135deg, #67e8f9, #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                RivalScan
              </span>
              <span className="text-xs text-slate-500 ml-2 hidden sm:inline">Competitive Intelligence</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="ml-auto flex gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
            {[
              { id: "feed", label: "Updates Feed" },
              { id: "gaps", label: "Gap Analysis" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                style={activeTab === tab.id
                  ? { background: "rgba(6,182,212,0.15)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.3)" }
                  : { color: "#94a3b8", border: "1px solid transparent" }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(6,182,212,0.06) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full border border-cyan-500/10" />
                </div>
                <p className="text-slate-400 text-sm tracking-wide">Scanning intelligence...</p>
              </div>
            </div>
          ) : activeTab === "feed" ? (
            <UpdatesFeed
              updates={updates}
              competitors={competitors}
              selectedCompetitor={selectedCompetitor}
              onFilterChange={(id) => { setSelectedCompetitor(id); fetchUpdates(id); }}
            />
          ) : (
            <GapAnalysis competitors={competitors} />
          )}
        </main>
      </div>

      {showAddModal && (
        <AddCompetitorModal onClose={() => setShowAddModal(false)} onAdded={handleCompetitorAdded} />
      )}
    </div>
  );
}
