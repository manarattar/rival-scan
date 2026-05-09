import { useEffect, useState } from "react";
import { getCompetitors, getUpdates } from "./api";
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
      setCompetitors(compRes.data);
      setUpdates(updRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchUpdates = async (competitorId) => {
    const res = await getUpdates({
      competitor_id: competitorId || undefined,
      limit: 50,
    });
    setUpdates(res.data);
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
    <div className="flex h-screen bg-[#0f0f13] text-slate-200 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-30 lg:z-auto
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-72 flex-shrink-0
        `}
      >
        <Sidebar
          competitors={competitors}
          selected={selectedCompetitor}
          onSelect={handleSelectCompetitor}
          onAdd={() => setShowAddModal(true)}
          onRefresh={fetchAll}
          onDelete={handleCompetitorDeleted}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#13131a]">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              RivalScan
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">AI Competitive Intelligence</span>
          </div>

          <div className="ml-auto flex gap-1">
            {["feed", "gaps"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {tab === "feed" ? "Updates Feed" : "Gap Analysis"}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Loading intelligence...</p>
              </div>
            </div>
          ) : activeTab === "feed" ? (
            <UpdatesFeed
              updates={updates}
              competitors={competitors}
              selectedCompetitor={selectedCompetitor}
              onFilterChange={(id) => {
                setSelectedCompetitor(id);
                fetchUpdates(id);
              }}
            />
          ) : (
            <GapAnalysis competitors={competitors} />
          )}
        </main>
      </div>

      {showAddModal && (
        <AddCompetitorModal
          onClose={() => setShowAddModal(false)}
          onAdded={handleCompetitorAdded}
        />
      )}
    </div>
  );
}
