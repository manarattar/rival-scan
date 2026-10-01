import { useCallback, useEffect, useState } from "react";
import { getCompetitors, getUpdates, getHealth } from "./api";
import Sidebar from "./components/Sidebar";
import UpdatesFeed from "./components/UpdatesFeed";
import GapAnalysis from "./components/GapAnalysis";
import AddCompetitorModal from "./components/AddCompetitorModal";
import ThemeToggle from "./components/ThemeToggle.jsx";

import Onboarding, { hasSeenTour } from "./components/Onboarding";
const TOUR_KEY = "rivalscan.onboarded.v1";
const STEPS = [
  { target: null, title: "Watch what your competitors ship", body: "RivalScan collects competitor release notes, blogs and changelogs, summarises each with AI and scores its business impact." },
  { target: "competitors", title: "Competitors you track", body: "Pick one to filter; the coloured dot shows whether its feed was fetched." },
  { target: "add", title: "Add your own", body: "Give a name and a feed, GitHub repo or changelog URL." },
  { target: "feed", title: "The ledger", body: "Newest first; click a row to open the original text." },
  { target: "impact", title: "Impact at a glance", body: "Red high, amber medium, teal low." },
  { target: "tabs", title: "Gap analysis", body: "Describe your product and see what competitors shipped that you lack." },
];
export default function App() {
  const [competitors, setCompetitors] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [activeTab, setActiveTab] = useState("feed");
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [error, setError] = useState("");
  const [tour, setTour] = useState(() => !hasSeenTour(TOUR_KEY));
  const onTourStep = useCallback((target) => {
    setSidebarOpen((target === "competitors" || target === "add") && window.innerWidth < 1024);
  }, []);
  const closeTour = useCallback(() => { setTour(false); setSidebarOpen(false); }, []);
  const fetchAll = async () => {
    setError("");
    try {
      const [compRes, updRes] = await Promise.all([
        getCompetitors(),
        getUpdates({ limit: 50 }),
      ]);
      setCompetitors(Array.isArray(compRes.data) ? compRes.data : []);
      setUpdates(Array.isArray(updRes.data) ? updRes.data : []);
    } catch {
      setError("Could not load competitors and updates. Please try again.");
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
    <div className="app-shell">
      {sidebarOpen && <div className="drawer-scrim lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div id="competitor-drawer" className={`sidebar-drawer ${sidebarOpen ? "is-open" : ""} ${tour ? "tour-open" : ""}`}>
        <Sidebar competitors={competitors} selected={selectedCompetitor} onSelect={handleSelectCompetitor}
          onAdd={() => setShowAddModal(true)} onRefresh={fetchAll} onDelete={handleCompetitorDeleted}
          onClose={() => setSidebarOpen(false)} onTour={() => setTour(true)} />
      </div>
      <div className="workspace">
        <header className="app-header">
          <span className="brand">RivalScan<span className="hidden xl:inline brand-caption">Market watch</span></span>
          <button className="button drawer-trigger lg:hidden" aria-expanded={sidebarOpen} aria-controls="competitor-drawer" onClick={() => setSidebarOpen(true)}>Competitors</button>
          <nav className="tabs" data-tour="tabs" aria-label="Views">
            {[{ id: "feed", label: "Updates" }, { id: "gaps", label: "Gap analysis" }].map(tab => (
              <button key={tab.id} aria-pressed={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
            ))}
          </nav>
          <button className="button hidden lg:block" onClick={() => setTour(true)}>How it works</button>
          <ThemeToggle />
        </header>
        <main className="main-content">
          {error && <div role="alert" className="error-banner"><span>{error}</span><button className="button" onClick={fetchAll}>Retry</button></div>}
          {loading ? <div className="empty-state" role="status">Loading market updates...</div> : activeTab === "feed" ? (
            <UpdatesFeed updates={updates} competitors={competitors} selectedCompetitor={selectedCompetitor}
              onFilterChange={(id) => { setSelectedCompetitor(id); fetchUpdates(id); }} />
          ) : <GapAnalysis competitors={competitors} />}
        </main>
      </div>
      {showAddModal && <AddCompetitorModal onClose={() => setShowAddModal(false)} onAdded={handleCompetitorAdded} />}
      {tour && !loading && <Onboarding steps={STEPS} storageKey={TOUR_KEY} finishLabel="Got it" onClose={closeTour} onStep={onTourStep} />}
    </div>
  );
}
