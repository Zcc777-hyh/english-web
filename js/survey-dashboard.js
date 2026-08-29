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

    // 头像：按用户代号哈希取色，保证同一用户每次渲染颜色一致
    const AVATAR_PALETTE = ['#60A5FA', '#34D399', '#FBBF24', '#F472B6', '#A78BFA', '#FB923C', '#38BDF8', '#4ADE80'];

    function avatarColor(code) {
        const str = String(code || '');
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
        return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
    }

    function avatarInitials(code) {
        const match = String(code || '').match(/[A-Za-z0-9]+$/);
        const tail = match ? match[0] : String(code || '');
        return tail.slice(-2).toUpperCase() || '匿';
    }

    // 评分标签：不同分段配色区分，但都用同一套柔和色板，避免突兀
    function ratingTagInfo(rating) {
        const r = Number(rating) || 0;
        if (r >= 5) return { cls: 'tag-5', label: '力荐' };
        if (r === 4) return { cls: 'tag-4', label: '推荐' };
        if (r === 3) return { cls: 'tag-3', label: '一般' };
        return { cls: 'tag-low', label: '吐槽' };
    }

    // 真实感排序：按评分分桶，用「剩余占比最高者优先」的公平调度算法交叉排列，
    // 保证不会连续多条同评分扎堆，5 星之间至少间隔 1 条其他评分。
    function interleaveByRating(list) {
        if (list.length <= 2) return list.slice();

        const buckets = {};
        list.forEach(q => {
            const r = Number(q.rating) || 0;
            if (!buckets[r]) buckets[r] = [];
            buckets[r].push(q);
        });
        const ratings = Object.keys(buckets).map(Number);
        const cursors = {};
        ratings.forEach(r => { cursors[r] = 0; });

        const result = [];
        let lastRating = null;

        while (result.length < list.length) {
            const candidates = ratings
                .filter(r => cursors[r] < buckets[r].length)
                .sort((a, b) => {
                    const remainA = (buckets[a].length - cursors[a]) / buckets[a].length;
                    const remainB = (buckets[b].length - cursors[b]) / buckets[b].length;
                    if (remainB !== remainA) return remainB - remainA;
                    return b - a; // 占比相同时评分高的适当靠前
                });

            let pick = candidates.find(r => r !== lastRating);
            if (pick === undefined) pick = candidates[0];

            // 5 星评论强制间隔：不允许与上一条同为 5 星
            if (pick === 5 && lastRating === 5) {
                const alt = candidates.find(r => r !== 5);
                if (alt !== undefined) pick = alt;
            }

            const bucket = buckets[pick];
            result.push(bucket[cursors[pick]]);
            cursors[pick] += 1;
            lastRating = pick;
        }

        return result;
    }

    // 展示优先级：3星及以上优先呈现并交叉排列；2星及以下（占比很低，仅作真实感点缀）
    // 整体靠后但分散插入，不扎堆堆在最末尾。
    function arrangeForDisplay(list) {
        const high = list.filter(q => (Number(q.rating) || 0) >= 3);
        const low = list.filter(q => (Number(q.rating) || 0) < 3);

        const ordered = interleaveByRating(high);
        if (low.length === 0) return ordered;

        const startIdx = Math.min(ordered.length, Math.ceil(ordered.length * 0.6));
        const span = Math.max(1, ordered.length - startIdx);
        low.forEach((q, i) => {
            const basePos = startIdx + Math.round((i * span) / Math.max(1, low.length));
            const pos = Math.min(ordered.length, basePos + i);
            ordered.splice(pos, 0, q);
        });

        return ordered;
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

            const avatar = el('div', 'survey-quote-avatar', avatarInitials(q.code));
            avatar.style.background = avatarColor(q.code);
            card.appendChild(avatar);

            const body = el('div', 'survey-quote-body');
            const head = el('div', 'survey-quote-head');
            head.appendChild(el('span', 'survey-quote-name', q.code));
            const tag = ratingTagInfo(q.rating);
            head.appendChild(el('span', 'survey-quote-tag ' + tag.cls, tag.label));
            head.appendChild(el('span', 'survey-quote-stars', starString(q.rating)));
            body.appendChild(head);
            body.appendChild(el('p', 'survey-quote-text', q.text));
            const time = formatDate(q.time);
            if (time) body.appendChild(el('div', 'survey-quote-time', time));
            card.appendChild(body);

            wall.appendChild(card);
        });

        loadMoreWrap.hidden = quotesShown >= allQuotes.length;
    }

    // 评论区默认只展示高分（4-5星）真实反馈，营造友好的展示氛围；
    // 按分数从高到低排序，同分再按时间从新到旧排序。
    const FRIENDLY_RATING_THRESHOLD = 4;

    function mergeQuotes(stats) {
        const debateQuotes = (stats.debate && stats.debate.quotes || []).map(q => Object.assign({ platform: 'debate' }, q));
        const speechQuotes = (stats.speech && stats.speech.quotes || []).map(q => Object.assign({ platform: 'speech' }, q));
        const byRecency = debateQuotes.concat(speechQuotes).sort((a, b) => {
            if (!a.time && !b.time) return 0;
            if (!a.time) return 1;
            if (!b.time) return -1;
            return new Date(b.time) - new Date(a.time);
        });
        // 同评分内保留新→旧顺序，评分之间按真实感交叉排列；低分（2星及以下）整体靠后展示
        return arrangeForDisplay(byRecency);
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

