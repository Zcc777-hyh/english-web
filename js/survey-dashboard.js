// 首页 - 用户满意度概览展示区
// 依赖：survey-config.js, survey-questions.js, survey-stats.js, survey-store.js, survey-mock.js

const SurveyDashboard = (function () {
    const PLATFORM_META = SURVEY_CONFIG.PLATFORMS;
    const QUOTES_PAGE_SIZE = 5;
    let quotesShown = QUOTES_PAGE_SIZE;
    let allQuotes = [];
    let charts = [];

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function hasEcharts() {
        return typeof echarts !== 'undefined';
    }

    function starString(rating) {
        const full = Math.max(0, Math.min(5, Math.round(rating || 0)));
        return '★'.repeat(full) + '☆'.repeat(5 - full);
    }

    function formatDate(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        const pad = n => String(n).padStart(2, '0');
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    // ---------- 顶部对比卡片 ----------

    function renderCompareCards(stats) {
        const wrap = document.getElementById('surveyCompareCards');
        wrap.innerHTML = '';
        ['debate', 'speech'].forEach(key => {
            const meta = PLATFORM_META[key];
            const data = stats[key] || { avgScore: 0, count: 0 };
            const card = el('div', 'survey-compare-card ' + key);
            card.appendChild(el('div', 'survey-compare-icon', meta.icon));
            card.appendChild(el('h3', null, meta.name + '综合满意度'));
            card.appendChild(el('div', 'survey-compare-score', (data.avgScore || 0).toFixed(1) + '/5 ⭐'));
            card.appendChild(el('div', 'survey-compare-count', (data.count || 0) + ' 人参与'));
            wrap.appendChild(card);
        });
    }

    // ---------- 雷达图 ----------

    function renderRadarBlock(stats) {
        const grid = document.getElementById('surveyRadarGrid');
        grid.innerHTML = '';
        charts = charts.filter(c => {
            if (c._block === 'radar') { c.dispose(); return false; }
            return true;
        });

        ['debate', 'speech'].forEach(key => {
            const meta = PLATFORM_META[key];
            const data = stats[key] || { radar: [] };
            const item = el('div', 'survey-radar-item');
            item.appendChild(el('div', 'survey-radar-label ' + key, meta.name));

            if (hasEcharts() && data.radar && data.radar.length) {
                const chartEl = el('div', 'survey-radar-chart');
                item.appendChild(chartEl);
                grid.appendChild(item);

                const chart = echarts.init(chartEl);
                chart._block = 'radar';
                charts.push(chart);
                chart.setOption({
                    color: [meta.color],
                    tooltip: {},
                    radar: {
                        indicator: data.radar.map(r => ({ name: r.label, max: 5 })),
                        radius: '65%'
                    },
                    series: [{
                        type: 'radar',
                        data: [{
                            value: data.radar.map(r => r.value),
                            name: meta.name,
                            areaStyle: { opacity: 0.25 }
                        }]
                    }]
                });
            } else {
                item.appendChild(buildFallbackTable(
                    (data.radar || []).map(r => [r.label, r.value.toFixed(1) + ' / 5'])
                ));
                grid.appendChild(item);
            }
        });
    }

    // ---------- 环形图 ----------

    function renderDonutBlock(stats) {
        const grid = document.getElementById('surveyDonutGrid');
        grid.innerHTML = '';
        charts = charts.filter(c => {
            if (c._block === 'donut') { c.dispose(); return false; }
            return true;
        });

        ['debate', 'speech'].forEach(key => {
            const meta = PLATFORM_META[key];
            const data = stats[key] || { reasonable: { reasonable: 0, neutral: 0, unreasonable: 0 } };
            const r = data.reasonable || { reasonable: 0, neutral: 0, unreasonable: 0 };
            const item = el('div', 'survey-donut-item');
            item.appendChild(el('div', 'survey-donut-label ' + key, meta.name));

            const pieData = [
                { name: '合理', value: r.reasonable || 0 },
                { name: '一般', value: r.neutral || 0 },
                { name: '不合理', value: r.unreasonable || 0 }
            ];

            if (hasEcharts()) {
                const chartEl = el('div', 'survey-donut-chart');
                item.appendChild(chartEl);
                grid.appendChild(item);

                const chart = echarts.init(chartEl);
                chart._block = 'donut';
                charts.push(chart);
                chart.setOption({
                    color: ['#16A34A', '#FBBF24', '#DC2626'],
                    tooltip: { trigger: 'item' },
                    legend: { bottom: 0 },
                    series: [{
                        type: 'pie',
                        radius: ['40%', '68%'],
                        center: ['50%', '45%'],
                        data: pieData,
                        label: { formatter: '{b}\n{d}%' }
                    }]
                });
            } else {
                item.appendChild(buildFallbackTable(pieData.map(d => [d.name, String(d.value)])));
                grid.appendChild(item);
            }
        });
    }

    function buildFallbackTable(rows) {
        const table = el('table', 'survey-fallback-table');
        rows.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
        return table;
    }
    // ---------- 反馈卡片墙 ----------

    function renderQuotesWall() {
        const wall = document.getElementById('surveyQuotesWall');
        const loadMoreWrap = document.getElementById('surveyLoadMoreWrap');
        wall.innerHTML = '';

        if (allQuotes.length === 0) {
            wall.appendChild(el('div', 'survey-quote-empty', '暂时还没有用户留下文字反馈～'));
            loadMoreWrap.hidden = true;
            return;
        }

        const visible = allQuotes.slice(0, quotesShown);
        visible.forEach(q => {
            const card = el('div', 'survey-quote-card ' + q.platform);
            const head = el('div', 'survey-quote-head');
            head.appendChild(el('span', 'survey-quote-name', q.code));
            head.appendChild(el('span', 'survey-quote-stars', starString(q.rating)));
            card.appendChild(head);
            card.appendChild(el('p', 'survey-quote-text', q.text));
            const time = formatDate(q.time);
            if (time) card.appendChild(el('div', 'survey-quote-time', time));
            wall.appendChild(card);
        });

        loadMoreWrap.hidden = quotesShown >= allQuotes.length;
    }

    function mergeQuotes(stats) {
        const debateQuotes = (stats.debate && stats.debate.quotes || []).map(q => Object.assign({ platform: 'debate' }, q));
        const speechQuotes = (stats.speech && stats.speech.quotes || []).map(q => Object.assign({ platform: 'speech' }, q));
        return debateQuotes.concat(speechQuotes).sort((a, b) => {
            if (!a.time && !b.time) return 0;
            if (!a.time) return 1;
            if (!b.time) return -1;
            return new Date(b.time) - new Date(a.time);
        });
    }

    function bindLoadMore() {
        const btn = document.getElementById('surveyLoadMoreBtn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            quotesShown += QUOTES_PAGE_SIZE;
            renderQuotesWall();
        });
    }

    // ---------- 底部宣传区 ----------

    function renderCtaBand(demo) {
        const wrap = document.getElementById('surveyCtaStats');
        wrap.innerHTML = '';

        if (demo) {
            const stat1 = el('div', 'survey-cta-stat');
            stat1.appendChild(el('div', 'survey-cta-stat-number', SURVEY_MOCK_CTA.totalUsers + '+'));
            stat1.appendChild(el('div', 'survey-cta-stat-label', '累计服务用户数'));
            const stat2 = el('div', 'survey-cta-stat');
            stat2.appendChild(el('div', 'survey-cta-stat-number', SURVEY_MOCK_CTA.totalHours + '+'));
            stat2.appendChild(el('div', 'survey-cta-stat-label', '总训练时长(小时)'));
            const stat3 = el('div', 'survey-cta-stat');
            stat3.appendChild(el('div', 'survey-cta-stat-number', Math.round(SURVEY_MOCK_CTA.avgImprovement * 100) + '%'));
            stat3.appendChild(el('div', 'survey-cta-stat-label', '平均能力提升率'));
            wrap.appendChild(stat1);
            wrap.appendChild(stat2);
            wrap.appendChild(stat3);
        } else {
            const rate = ((SurveyDashboardData.debate.improvementRate || 0) + (SurveyDashboardData.speech.improvementRate || 0)) / 2;
            const totalCount = (SurveyDashboardData.debate.count || 0) + (SurveyDashboardData.speech.count || 0);
            const stat1 = el('div', 'survey-cta-stat');
            stat1.appendChild(el('div', 'survey-cta-stat-number', totalCount));
            stat1.appendChild(el('div', 'survey-cta-stat-label', '累计参与调查用户数'));
            const stat2 = el('div', 'survey-cta-stat');
            stat2.appendChild(el('div', 'survey-cta-stat-number', Math.round(rate * 100) + '%'));
            stat2.appendChild(el('div', 'survey-cta-stat-label', '平均能力提升率'));
            wrap.appendChild(stat1);
            wrap.appendChild(stat2);
        }
    }

    // ---------- 主渲染 ----------

    let SurveyDashboardData = { debate: {}, speech: {} };

    function renderAll(stats) {
        const demo = Boolean(stats.demo);
        const banner = document.getElementById('surveyDemoBanner');
        if (banner) banner.hidden = !demo;

        SurveyDashboardData = { debate: stats.debate || {}, speech: stats.speech || {} };

        renderCompareCards(stats);
        renderRadarBlock(stats);
        renderDonutBlock(stats);

        allQuotes = mergeQuotes(stats);
        quotesShown = QUOTES_PAGE_SIZE;
        renderQuotesWall();

        renderCtaBand(demo);
    }

    function loadAndRender() {
        SurveyStore.fetchStats(function (stats) {
            const useReal = stats && stats.ok && !stats.demo;
            renderAll(useReal ? stats : SURVEY_MOCK_STATS);
        });
    }

    function handleResize() {
        charts.forEach(c => {
            try { c.resize(); } catch (e) {}
        });
    }

    function init() {
        const section = document.getElementById('surveyDashboardSection');
        if (!section) return;

        bindLoadMore();
        loadAndRender();
        window.addEventListener('resize', handleResize);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        _renderAll: renderAll,
        _loadAndRender: loadAndRender
    };
})();

