import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
const CATEGORIES = ["Feature", "Fix", "Pricing", "Integration", "Deprecation", "Announcement", "Other"];
const IMPACTS = ["High", "Medium", "Low"];
function UpdateRow({ update, first }) {
  const [expanded, setExpanded] = useState(false);
  const impact = IMPACTS.includes(update.impact) ? update.impact : "Medium";
  const date = new Date(update.published_at || update.fetched_at);
  const validDate = !Number.isNaN(date.getTime());
  return <article data-tour={first ? "impact" : undefined} className={`ledger-row impact-${impact.toLowerCase()}`}>
    <button className="ledger-toggle" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
      <span className="timestamp">{validDate ? formatDistanceToNow(date, { addSuffix: true }) : "recently"}<span>{validDate ? format(date, "dd MMM yyyy") : ""}</span></span>
      <span className="ledger-body">
        <span className="ledger-meta"><span className="company-label">{update.competitor_name}</span><span className="category-tag">{update.category}</span></span>
        <span className="impact-marker"><span className="heat-strip" /><span>{impact} impact</span></span>
        <span className="update-title">{update.title}</span>
        {update.ai_summary && <span className="update-summary">{update.ai_summary}</span>}
        <span className="source-toggle">{expanded ? "Hide original text −" : "Read original text +"}</span>
      </span>
    </button>
    {expanded && update.content_raw && <div className="source-text"><h3 className="label">Source</h3><p>{update.content_raw.slice(0, 500)}</p></div>}
    <div className="ledger-footer">{update.url && <a href={update.url} target="_blank" rel="noopener noreferrer">View source ↗</a>}<span>{update.source_type}</span></div>
  </article>;
}
export default function UpdatesFeed({ updates, competitors, selectedCompetitor }) {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [impactFilter, setImpactFilter] = useState("");
  const currentComp = selectedCompetitor ? competitors.find(c => c.id === selectedCompetitor) : null;
  const filtered = updates.filter(u => (!categoryFilter || u.category === categoryFilter) && (!impactFilter || u.impact === impactFilter));
  const counts = IMPACTS.map(impact => updates.filter(u => u.impact === impact).length);
  const stats = [["Total", updates.length], ["High impact", counts[0]], ["Features", updates.filter(u => u.category === "Feature").length], ["Pricing", updates.filter(u => u.category === "Pricing").length]];
  return <section className="page-content">
    <div className="page-heading"><p className="label">Market watch / Updates</p><h1>{currentComp ? currentComp.name : "The updates ledger"}</h1><p>What changed. Why it matters.</p></div>
    <div className="summary-strip">{stats.map(([label, value]) => <div key={label}><span>{label}</span><strong className="num">{value}</strong></div>)}</div>
    <div className="impact-distribution" role="img" aria-label={`Impact share: ${counts[0]} high, ${counts[1]} medium, ${counts[2]} low`}>{IMPACTS.map((impact, i) => <span key={impact} style={{ flex: counts[i], background: `var(--${impact.toLowerCase()})` }} />)}</div>
    <div className="filters">
      <select aria-label="Category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option value="">All categories</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
      <select aria-label="Impact" value={impactFilter} onChange={e => setImpactFilter(e.target.value)}><option value="">All impact levels</option>{IMPACTS.map(i => <option key={i}>{i}</option>)}</select>
      {(categoryFilter || impactFilter) && <button className="button" onClick={() => { setCategoryFilter(""); setImpactFilter(""); }}>Clear filters ×</button>}
      <span className="num filter-count">{filtered.length} updates</span>
    </div>
    <div data-tour="feed" className="ledger">
      {filtered.length ? filtered.map((update, i) => <UpdateRow key={update.id} update={update} first={i === 0} />) : <div className="empty-state">{categoryFilter || impactFilter ? "No updates match your filters" : currentComp?.update_count === 0 ? <><h2>No feed found for {currentComp.name}</h2><p>Add an RSS feed URL, GitHub repo, or changelog URL, then hit Refresh.</p></> : "No updates yet — click Refresh to scan."}</div>}
    </div>
  </section>;
}
