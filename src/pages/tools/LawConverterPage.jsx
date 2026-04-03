/**
 * Law Converter Micro-Tool Page
 *
 * A public, SEO-friendly tool to look up correspondences between
 * old Indian laws (IPC/CrPC) and new Indian laws (BNS/BNSS).
 *
 * Features:
 * - Bidirectional search (old→new, new→old, or both)
 * - Tab switching (IPC↔BNS | CrPC↔BNSS)
 * - Expandable detail cards with comparison view
 * - Status badges (direct, modified, repealed, new, merged)
 * - Quick stats bar
 * - Server-side pagination
 * - SEO meta tags + JSON-LD structured data
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getMappings, getStats } from '../../api/lawConverterApi';
import './LawConverterPage.css';

// ─── SEO Head Component ──────────────────────────────────────
const SEO_TITLE = 'IPC to BNS & CrPC to BNSS Section Converter | Indian Law Correspondence Tool';
const SEO_DESCRIPTION =
    'Free tool to find which IPC section corresponds to which BNS section and CrPC to BNSS. Search old Indian law sections and find their new equivalents under Bharatiya Nyaya Sanhita and Bharatiya Nagarik Suraksha Sanhita.';
const SEO_KEYWORDS =
    'IPC to BNS converter, CrPC to BNSS converter, Indian Penal Code to Bharatiya Nyaya Sanhita, Code of Criminal Procedure to Bharatiya Nagarik Suraksha Sanhita, IPC BNS correspondence, CrPC BNSS correspondence, Indian law converter, section converter, BNS sections, BNSS sections, new criminal law India';

function useDocumentMeta() {
    useEffect(() => {
        // Title
        document.title = SEO_TITLE;

        // Meta tags
        const metas = {
            description: SEO_DESCRIPTION,
            keywords: SEO_KEYWORDS,
            'og:title': SEO_TITLE,
            'og:description': SEO_DESCRIPTION,
            'og:type': 'website',
            'twitter:card': 'summary_large_image',
            'twitter:title': SEO_TITLE,
            'twitter:description': SEO_DESCRIPTION,
            robots: 'index, follow',
        };

        const createdElements = [];
        Object.entries(metas).forEach(([name, content]) => {
            const isOG = name.startsWith('og:');
            const isTwitter = name.startsWith('twitter:');
            const attr = isOG || isTwitter ? 'property' : 'name';

            let el = document.querySelector(`meta[${attr}="${name}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, name);
                document.head.appendChild(el);
                createdElements.push(el);
            }
            el.setAttribute('content', content);
        });

        // JSON-LD structured data
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Indian Law Section Converter',
            description: SEO_DESCRIPTION,
            applicationCategory: 'Legal Tool',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
            featureList: [
                'IPC to BNS section conversion',
                'CrPC to BNSS section conversion',
                'Bidirectional search',
                'Summary of changes',
                'Side-by-side comparison',
            ],
        };

        let jsonLdScript = document.querySelector('#law-converter-jsonld');
        if (!jsonLdScript) {
            jsonLdScript = document.createElement('script');
            jsonLdScript.id = 'law-converter-jsonld';
            jsonLdScript.type = 'application/ld+json';
            document.head.appendChild(jsonLdScript);
            createdElements.push(jsonLdScript);
        }
        jsonLdScript.textContent = JSON.stringify(jsonLd);

        // Canonical link
        let canonical = document.querySelector('link[rel="canonical"]');
        const created = !canonical;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', window.location.origin + '/law-mgmt/tools/law-converter');

        return () => {
            createdElements.forEach((el) => el.remove());
            if (created && canonical) canonical.remove();
        };
    }, []);
}

// ─── Constants ───────────────────────────────────────────────
const TAB_CONFIG = [
    { key: 'ipc_bns', label: 'IPC ↔ BNS', oldName: 'IPC', newName: 'BNS' },
    { key: 'crpc_bnss', label: 'CrPC ↔ BNSS', oldName: 'CrPC', newName: 'BNSS' },
];

const DIRECTION_OPTIONS = [
    { key: 'both', label: 'Both Directions' },
    { key: 'old_to_new', label: 'Old → New' },
    { key: 'new_to_old', label: 'New → Old' },
];

const STATUS_LABELS = {
    direct: 'Direct',
    modified: 'Modified',
    repealed: 'Repealed',
    new: 'New',
    merged: 'Merged',
    split: 'Split',
    no_change: 'No Change',
};

const STATUS_EMOJI = {
    direct: '🟢',
    modified: '🟡',
    repealed: '🔴',
    new: '🔵',
    merged: '🟠',
    split: '🟣',
    no_change: '✅',
};

const PAGE_SIZE = 30;

// ─── Main Component ─────────────────────────────────────────
export default function LawConverterPage() {
    useDocumentMeta();

    // State
    const [activeTab, setActiveTab] = useState('ipc_bns');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [direction, setDirection] = useState('both');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [mappings, setMappings] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    const searchInputRef = useRef(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to page 1 on new search
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset page on filter changes
    useEffect(() => {
        setPage(1);
        setExpandedId(null);
    }, [activeTab, direction, statusFilter]);

    // Fetch stats
    useEffect(() => {
        let cancelled = false;
        getStats().then((data) => {
            if (!cancelled) setStats(data);
        }).catch(() => { });
        return () => { cancelled = true; };
    }, []);

    // Fetch mappings
    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        const params = {
            law_type: activeTab,
            page,
            page_size: PAGE_SIZE,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (direction !== 'both') params.direction = direction;
        if (statusFilter) params.status = statusFilter;

        getMappings(params)
            .then((data) => {
                if (!cancelled) {
                    setMappings(data.results || []);
                    setTotalCount(data.count || 0);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setMappings([]);
                    setTotalCount(0);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [activeTab, debouncedSearch, direction, statusFilter, page]);

    // Derived
    const activeTabConfig = TAB_CONFIG.find((t) => t.key === activeTab);
    const activeStats = stats.find((s) => s.law_type === activeTab);
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // Handlers
    const toggleExpand = useCallback((id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const handleStatusFilter = useCallback((status) => {
        setStatusFilter((prev) => (prev === status ? '' : status));
    }, []);

    // Generate page numbers for pagination
    const pageNumbers = useMemo(() => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    }, [page, totalPages]);

    return (
        <div className="law-converter-page">
            {/* Hero Header */}
            <header className="lc-header">
                <div className="lc-header-content">
                    <span className="lc-logo" role="img" aria-label="scales of justice">⚖️</span>
                    <h1 className="lc-title">
                        Indian Law <span>Section Converter</span>
                    </h1>
                    <p className="lc-subtitle">
                        Find which old section became which new section — IPC↔BNS &amp; CrPC↔BNSS
                    </p>
                </div>
            </header>

            <main className="lc-container" role="main">
                {/* Tab Bar */}
                <nav className="lc-tabs" role="tablist" aria-label="Law type selector">
                    {TAB_CONFIG.map((tab) => (
                        <button
                            key={tab.key}
                            role="tab"
                            aria-selected={activeTab === tab.key}
                            className={`lc-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                            id={`tab-${tab.key}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Search */}
                <section className="lc-search-section" aria-label="Search and filter">
                    <div className="lc-search-wrapper">
                        <span className="lc-search-icon">🔍</span>
                        <input
                            ref={searchInputRef}
                            type="search"
                            className="lc-search-input"
                            placeholder={`Search by section number or keyword (e.g. "302", "murder", "theft")...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Search law sections"
                            id="law-search-input"
                        />
                    </div>

                    <div className="lc-direction-bar">
                        {DIRECTION_OPTIONS.map((opt) => (
                            <button
                                key={opt.key}
                                className={`lc-direction-btn ${direction === opt.key ? 'active' : ''}`}
                                onClick={() => setDirection(opt.key)}
                                id={`direction-${opt.key}`}
                            >
                                {opt.key === 'old_to_new'
                                    ? `${activeTabConfig.oldName} → ${activeTabConfig.newName}`
                                    : opt.key === 'new_to_old'
                                        ? `${activeTabConfig.newName} → ${activeTabConfig.oldName}`
                                        : opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Status filter pills */}
                    {activeStats && activeStats.status_breakdown && (
                        <div className="lc-status-filters">
                            {Object.entries(activeStats.status_breakdown).map(([key, count]) => (
                                <button
                                    key={key}
                                    className={`lc-status-pill ${statusFilter === key ? 'active' : ''}`}
                                    onClick={() => handleStatusFilter(key)}
                                    id={`status-filter-${key}`}
                                >
                                    {STATUS_EMOJI[key]} {STATUS_LABELS[key] || key}{' '}
                                    <span className="pill-count">({count})</span>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Stats Bar */}
                {activeStats && (
                    <div className="lc-stats-bar" role="status" aria-label="Statistics">
                        <div className="lc-stat-item">
                            <span className="lc-stat-number">{activeStats.total_mappings}</span>
                            <span>Total Sections</span>
                        </div>
                        <div className="lc-stat-divider" />
                        {activeStats.status_breakdown?.direct > 0 && (
                            <>
                                <div className="lc-stat-item">
                                    <span className="lc-stat-number" style={{ color: 'var(--lc-green)' }}>
                                        {activeStats.status_breakdown.direct}
                                    </span>
                                    <span>Direct</span>
                                </div>
                                <div className="lc-stat-divider" />
                            </>
                        )}
                        {activeStats.status_breakdown?.modified > 0 && (
                            <div className="lc-stat-item">
                                <span className="lc-stat-number" style={{ color: 'var(--lc-yellow)' }}>
                                    {activeStats.status_breakdown.modified}
                                </span>
                                <span>Modified</span>
                            </div>
                        )}
                        {activeStats.status_breakdown?.new > 0 && (
                            <>
                                <div className="lc-stat-divider" />
                                <div className="lc-stat-item">
                                    <span className="lc-stat-number" style={{ color: 'var(--lc-blue)' }}>
                                        {activeStats.status_breakdown.new}
                                    </span>
                                    <span>New Provisions</span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Results */}
                {loading ? (
                    <div className="lc-loading" aria-live="polite">
                        <div className="lc-spinner" />
                        <span>Loading sections...</span>
                    </div>
                ) : mappings.length === 0 ? (
                    <div className="lc-empty">
                        <div className="lc-empty-icon">📭</div>
                        <h3 className="lc-empty-title">No sections found</h3>
                        <p className="lc-empty-desc">
                            {search
                                ? `No results for "${search}". Try a different section number or keyword.`
                                : 'No data available for this filter combination.'}
                        </p>
                    </div>
                ) : (
                    <div className="lc-results" role="list" aria-label="Search results">
                        {mappings.map((m) => (
                            <article
                                key={m.id}
                                className={`lc-result-card ${expandedId === m.id ? 'expanded' : ''}`}
                                onClick={() => toggleExpand(m.id)}
                                role="listitem"
                                aria-expanded={expandedId === m.id}
                                id={`mapping-${m.id}`}
                            >
                                {/* Card Header */}
                                <div className="lc-card-header">
                                    <div className="lc-section-pair">
                                        <div className="lc-section-old">
                                            <span className="lc-section-label">{m.old_law_name}</span>
                                            <span className="lc-section-number">
                                                {m.old_section_number || '—'}
                                            </span>
                                            <span className="lc-section-title">{m.old_section_title}</span>
                                        </div>
                                        <span className="lc-arrow">→</span>
                                        <div className="lc-section-new">
                                            <span className="lc-section-label">{m.new_law_name}</span>
                                            <span className="lc-section-number">
                                                {m.new_section_number || '—'}
                                            </span>
                                            <span className="lc-section-title">{m.new_section_title}</span>
                                        </div>
                                    </div>
                                    <span className={`lc-status-badge lc-status-${m.status}`}>
                                        {STATUS_EMOJI[m.status]} {m.status_display}
                                    </span>
                                    <span className={`lc-expand-icon ${expandedId === m.id ? 'rotated' : ''}`}>
                                        ▼
                                    </span>
                                </div>

                                {/* Expanded Detail */}
                                <div className={`lc-detail-panel ${expandedId === m.id ? 'open' : ''}`}>
                                    <div className="lc-detail-content">
                                        {m.summary && (
                                            <div className="lc-detail-summary">
                                                <strong>Summary of Changes:</strong> {m.summary}
                                            </div>
                                        )}
                                        <div className="lc-comparison">
                                            <div className="lc-comparison-card lc-comparison-old">
                                                <div className="lc-comparison-label">
                                                    {m.old_law_name} (Old)
                                                </div>
                                                <div className="lc-comparison-section">
                                                    Section {m.old_section_number || '—'}
                                                </div>
                                                <div className="lc-comparison-title">{m.old_section_title || 'N/A'}</div>
                                            </div>
                                            <div className="lc-comparison-card lc-comparison-new">
                                                <div className="lc-comparison-label">
                                                    {m.new_law_name} (New)
                                                </div>
                                                <div className="lc-comparison-section">
                                                    Section {m.new_section_number || '—'}
                                                </div>
                                                <div className="lc-comparison-title">{m.new_section_title || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <nav className="lc-pagination" role="navigation" aria-label="Pagination">
                        <button
                            className="lc-page-btn"
                            disabled={page === 1}
                            onClick={() => setPage(1)}
                            aria-label="First page"
                        >
                            ««
                        </button>
                        <button
                            className="lc-page-btn"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            aria-label="Previous page"
                        >
                            ‹
                        </button>
                        {pageNumbers.map((p) => (
                            <button
                                key={p}
                                className={`lc-page-btn ${page === p ? 'active' : ''}`}
                                onClick={() => setPage(p)}
                                aria-label={`Page ${p}`}
                                aria-current={page === p ? 'page' : undefined}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            className="lc-page-btn"
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            aria-label="Next page"
                        >
                            ›
                        </button>
                        <button
                            className="lc-page-btn"
                            disabled={page === totalPages}
                            onClick={() => setPage(totalPages)}
                            aria-label="Last page"
                        >
                            »»
                        </button>
                        <span className="lc-page-info">
                            Page {page} of {totalPages} ({totalCount} results)
                        </span>
                    </nav>
                )}
            </main>

            {/* Footer */}
            <footer className="lc-footer">
                <p>
                    Data sourced from official BPRD comparison summaries.
                    This tool is for informational purposes only — always verify with official gazette notifications.
                </p>
                <p>
                    © {new Date().getFullYear()} Law Management System | Free Public Tool
                </p>
            </footer>
        </div>
    );
}
