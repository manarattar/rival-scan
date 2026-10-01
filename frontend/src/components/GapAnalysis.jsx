import { useState } from "react";
import { runGapAnalysis } from "../api";
import CompetitorAvatar from "./CompetitorAvatar";

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

  return <section className="page-content">
    <div className="page-heading"><p className="label">Market watch / Strategy</p><h1>Gap analysis</h1><p>Describe your product: discover what competitors have shipped that you haven't.</p></div>
    <form onSubmit={handleSubmit} className="analysis-form">
      <label htmlFor="product-description" className="label">Your product</label>
      <textarea id="product-description" value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="e.g. A developer-first API monitoring tool that tracks latency, errors, and usage patterns in real time with alerting and Slack integration." />
      <fieldset><legend className="label">Analyze against <span className="normal-case">(optional; defaults to all)</span></legend>
        <div className="flex flex-wrap gap-2 mt-2">{competitors.map(c => <button key={c.id} type="button" className={`button competitor-choice ${selectedIds.includes(c.id) ? "selected" : ""}`} aria-pressed={selectedIds.includes(c.id)} onClick={() => toggleCompetitor(c.id)}><CompetitorAvatar name={c.name} color={c.color} size={22} />{c.name}</button>)}</div>
      </fieldset>
      {error && <p role="alert" className="error-banner">{error}</p>}
      <button type="submit" className="button primary" disabled={loading}>{loading ? "Scanning..." : "Run gap analysis"}</button>
    </form>
    {result && <div className="analysis-results">
      <section className="report-section"><h2>Strategic overview</h2><p>{result.summary}</p></section>
      {result.top_threats?.length > 0 && <section className="report-section threats"><h2>Top threats</h2><ul>{result.top_threats.map((t, i) => <li key={i}>{t}</li>)}</ul></section>}
      <section><h2 className="label mb-3">Feature gaps <span className="num">({result.gaps?.length})</span></h2><div className="ledger">{result.gaps?.map((gap, i) => <article key={i} className={`gap-row impact-${["High", "Medium", "Low"].includes(gap.urgency) ? gap.urgency.toLowerCase() : "medium"}`}><span className="heat-strip" /><div className="gap-index num">{String(i + 1).padStart(2, "0")}</div><div className="min-w-0"><div className="gap-meta"><span className="company-label">{gap.competitor}</span><span className="urgency">{gap.urgency} urgency</span></div><h3>{gap.feature}</h3><p>{gap.description}</p></div></article>)}</div></section>
    </div>}
  </section>;
}
