from unittest.mock import patch

import pytest

from app.services.ai_analyzer import analyze_update
from app.services.fetcher import _safe_url

VALID_CATEGORIES = {
    "Feature",
    "Fix",
    "Pricing",
    "Integration",
    "Deprecation",
    "Announcement",
    "Other",
}
VALID_IMPACTS = {"High", "Medium", "Low"}


# ── analyze_update ────────────────────────────────────────────────────────────


class TestAnalyzeUpdate:
    def test_mock_mode_returns_required_keys(self):
        result = analyze_update("GPT-5 launched", "Amazing new model")
        assert set(result.keys()) == {"ai_summary", "category", "impact"}

    def test_mock_mode_category_is_valid(self):
        result = analyze_update("Some update", "content")
        assert result["category"] in VALID_CATEGORIES

    def test_mock_mode_impact_is_valid(self):
        result = analyze_update("Some update", "content")
        assert result["impact"] in VALID_IMPACTS

    def test_mock_mode_cycles_through_summaries(self):
        # index param selects from MOCK_SUMMARIES
        r0 = analyze_update("t", "c", index=0)
        r1 = analyze_update("t", "c", index=1)
        # Different mock entries → different ai_summary values
        assert r0["ai_summary"] != r1["ai_summary"]

    def test_invalid_category_falls_back_to_other(self):
        bad = {"ai_summary": "test", "category": "INVALID", "impact": "High"}
        with patch("app.services.ai_analyzer._call_llm", return_value=bad):
            result = analyze_update("title", "content")
        assert result["category"] == "Other"

    def test_invalid_impact_falls_back_to_medium(self):
        bad = {"ai_summary": "test", "category": "Feature", "impact": "INVALID"}
        with patch("app.services.ai_analyzer._call_llm", return_value=bad):
            result = analyze_update("title", "content")
        assert result["impact"] == "Medium"

    def test_missing_category_falls_back_to_other(self):
        bad = {"ai_summary": "test", "impact": "High"}
        with patch("app.services.ai_analyzer._call_llm", return_value=bad):
            result = analyze_update("title", "content")
        assert result["category"] == "Other"

    def test_missing_impact_falls_back_to_medium(self):
        bad = {"ai_summary": "test", "category": "Feature"}
        with patch("app.services.ai_analyzer._call_llm", return_value=bad):
            result = analyze_update("title", "content")
        assert result["impact"] == "Medium"

    def test_summary_capped_at_500_chars(self):
        long_summary = "x" * 600
        bad = {"ai_summary": long_summary, "category": "Feature", "impact": "High"}
        with patch("app.services.ai_analyzer._call_llm", return_value=bad):
            result = analyze_update("title", "content")
        assert len(result["ai_summary"]) <= 500

    def test_summary_exactly_500_chars_not_truncated(self):
        exact = "y" * 500
        good = {"ai_summary": exact, "category": "Feature", "impact": "High"}
        with patch("app.services.ai_analyzer._call_llm", return_value=good):
            result = analyze_update("title", "content")
        assert len(result["ai_summary"]) == 500

    def test_all_valid_categories_accepted(self):
        for cat in VALID_CATEGORIES:
            data = {"ai_summary": "ok", "category": cat, "impact": "High"}
            with patch("app.services.ai_analyzer._call_llm", return_value=data):
                result = analyze_update("t", "c")
            assert result["category"] == cat

    def test_all_valid_impacts_accepted(self):
        for imp in VALID_IMPACTS:
            data = {"ai_summary": "ok", "category": "Feature", "impact": imp}
            with patch("app.services.ai_analyzer._call_llm", return_value=data):
                result = analyze_update("t", "c")
            assert result["impact"] == imp


# ── _safe_url ─────────────────────────────────────────────────────────────────


class TestSafeUrl:
    def test_https_public_domain_passes(self):
        url = "https://openai.com/blog"
        assert _safe_url(url) == url

    def test_http_public_domain_passes(self):
        url = "http://example.com"
        assert _safe_url(url) == url

    def test_url_with_path_passes(self):
        url = "https://huggingface.co/blog/feed.xml"
        assert _safe_url(url) == url

    def test_ftp_scheme_raises(self):
        with pytest.raises(ValueError, match="scheme"):
            _safe_url("ftp://example.com")

    def test_file_scheme_raises(self):
        with pytest.raises(ValueError, match="scheme"):
            _safe_url("file:///etc/passwd")

    def test_private_ip_192_168_raises(self):
        with pytest.raises(ValueError, match="Blocked"):
            _safe_url("http://192.168.1.1")

    def test_private_ip_10_net_raises(self):
        with pytest.raises(ValueError, match="Blocked"):
            _safe_url("http://10.0.0.1")

    def test_private_ip_172_16_raises(self):
        with pytest.raises(ValueError, match="Blocked"):
            _safe_url("http://172.16.0.1")

    def test_loopback_ipv4_raises(self):
        with pytest.raises(ValueError, match="Blocked"):
            _safe_url("http://127.0.0.1")

    def test_loopback_localhost_passes(self):
        # "localhost" is a hostname, not an IP — _safe_url only blocks numeric IPs
        # This documents the current behaviour; a DNS-resolving check would be P2
        _safe_url("http://localhost")  # should not raise

    def test_aws_metadata_link_local_raises(self):
        with pytest.raises(ValueError, match="Blocked"):
            _safe_url("http://169.254.169.254/latest/meta-data/")

    def test_ipv6_loopback_raises(self):
        with pytest.raises(ValueError, match="Blocked"):
            _safe_url("http://[::1]/")
