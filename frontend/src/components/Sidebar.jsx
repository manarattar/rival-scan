import { deleteCompetitor, refreshCompetitor } from "../api";
import CompetitorAvatar from "./CompetitorAvatar";

export default function Sidebar({ competitors, selected, onSelect, onAdd, onRefresh, onDelete, onClose, onTour }) {
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Remove this competitor and all its updates?")) return;
    await deleteCompetitor(id);
    onDelete(id);
  };
  const handleRefresh = async (e, id) => {
    e.stopPropagation();
    await refreshCompetitor(id);
    onRefresh();
  };
  return <aside className="sidebar">
    <div className="sidebar-heading"><h2>Competitors <span className="num">{competitors.length}</span></h2><button className="icon-button lg:hidden" aria-label="Close competitors" onClick={onClose}>×</button></div>
    <div className="px-4 pb-4"><button data-tour="add" className="button primary w-full" onClick={onAdd}>+ Track competitor</button></div>
    <div data-tour="competitors" className="competitor-list">
      <button className={`all-updates ${selected === null ? "selected" : ""}`} onClick={() => onSelect(null)}>All updates</button>
      {competitors.map(c => <div className={`competitor-row group ${selected === c.id ? "selected" : ""}`} key={c.id}>
        <button className="competitor-select" onClick={() => onSelect(c.id)} aria-pressed={selected === c.id}>
          <CompetitorAvatar name={c.name} color={c.color} size={30} />
          <span className="min-w-0"><span className="competitor-name">{c.name}</span><span className="competitor-meta">{c.update_count ? `${c.update_count} updates` : "no feed found"}</span></span>
          <span className={`status-dot status-${c.fetch_status === "ok" && !c.update_count ? "empty" : c.fetch_status}`} title={c.fetch_status} aria-label={`Feed status: ${c.fetch_status}`} />
        </button>
        <div className="row-actions">
          <button className="icon-button" onClick={e => handleRefresh(e, c.id)} aria-label={`Refresh ${c.name}`} title="Refresh"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 14 6M4 12a8 8 0 0 0 14 6" /></svg></button>
          {!c.is_demo && <button className="icon-button delete-button" onClick={e => handleDelete(e, c.id)} aria-label={`Delete ${c.name}`} title="Delete">×</button>}
        </div>
      </div>)}
    </div>
    <footer className="sidebar-footer"><button className="button w-full mb-3 lg:hidden" onClick={onTour}>How it works</button><p>Auto-refresh · daily · AI-powered</p></footer>
  </aside>;
}
