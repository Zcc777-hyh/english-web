// 满意度调查 - 统计与聚合逻辑
// 云函数 cloud/survey/index.js 内有一份等价实现，两边修改需同步。

const SurveyStats = (function () {
    // 单选题分值表：5 级 → 5/4/3/2/1 分，顺序即分值
    const SCORE_TABLE = {
        q1: ['very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied'],
        q2: ['significant', 'some', 'little', 'none', 'regressed'],
        q4: ['very_reasonable', 'reasonable', 'neutral', 'unreasonable', 'very_unreasonable']
    };

    // 参与综合满意度计算的题目（3道单选 + 1道星级）
    const SCORED_QUESTIONS = ['q1', 'q2', 'q4'];

    function round1(n) {
        return Math.round(n * 10) / 10;
    }

    function mean(values) {
        if (!values.length) return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    // 单选题打分：在白名单中的位置 → 5/4/3/2/1
    function scoreOf(questionId, value) {
        const order = SCORE_TABLE[questionId];
        if (!order) return null;
        const index = order.indexOf(value);
        return index === -1 ? null : 5 - index;
    }

    // 单道题的平均分（跨所有记录）
    function avgScore(records, questionId) {
        const scores = records
            .map(r => scoreOf(questionId, r[questionId]))
            .filter(s => s !== null);
        return round1(mean(scores));
    }

    // 综合满意度：q1/q2/q4 的平均分 + q5 星级，两者再平均
    function overallScore(records) {
        if (!records.length) return 0;
        const singleScores = [];
        records.forEach(r => {
            SCORED_QUESTIONS.forEach(q => {
                const s = scoreOf(q, r[q]);
                if (s !== null) singleScores.push(s);
            });
        });
        const stars = records
            .map(r => Number(r.q5))
            .filter(n => n >= 1 && n <= 5);

        const parts = [];
        if (singleScores.length) parts.push(mean(singleScores));
        if (stars.length) parts.push(mean(stars));
        return round1(mean(parts));
    }

    // 多选题勾选比例（某选项被勾选次数 / 总记录数）
    function checkboxRatio(records, questionId) {
        const ratio = {};
        if (!records.length) return ratio;
        records.forEach(r => {
            const picked = r[questionId];
            if (!Array.isArray(picked)) return;
            picked.forEach(v => {
                ratio[v] = (ratio[v] || 0) + 1;
            });
        });
        Object.keys(ratio).forEach(k => {
            ratio[k] = ratio[k] / records.length;
        });
        return ratio;
    }

    // 雷达图：q3 全部选项的勾选比例 × 5
    function radarValues(records, platform) {
        const bank = SURVEY_QUESTIONS[platform];
        if (!bank) return [];
        const dimensions = bank.radar || [];
        const ratio = checkboxRatio(records, 'q3');
        return dimensions.map(dim => {
            const option = bank.questions
                .find(q => q.id === 'q3')
                ?.options.find(o => o.value === dim);
            return {
                key: dim,
                label: option ? option.label : dim,
                value: round1((ratio[dim] || 0) * 5)
            };
        });
    }

    // AI评分合理度分布（q4 三档：合理/一般/不合理）
    function reasonableSplit(records) {
        const split = { reasonable: 0, neutral: 0, unreasonable: 0 };
        records.forEach(r => {
            const v = r.q4;
            if (v === 'very_reasonable' || v === 'reasonable') split.reasonable += 1;
            else if (v === 'neutral') split.neutral += 1;
            else if (v === 'unreasonable' || v === 'very_unreasonable') split.unreasonable += 1;
        });
        return split;
    }

    // 能力提升率（q2 选「提升非常明显」或「有一定提升」的占比）
    function improvementRate(records) {
        if (!records.length) return 0;
        const improved = records.filter(r => {
            const v = r.q2;
            return v === 'significant' || v === 'some';
        }).length;
        return Math.round((improved / records.length) * 100);
    }

    // 由 visitorId 生成匿名展示代号，不暴露真实访客标识
    function anonCode(visitorId) {
        const str = String(visitorId || '');
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
        }
        const code = hash.toString(36).toUpperCase().slice(-4).padStart(4, '0');
        return '用户' + code;
    }

    // 提取带文字反馈的记录，供展示页卡片墙使用（按时间新到旧）
    function buildQuotes(records) {
        return records
            .filter(r => r.q6 && String(r.q6).trim())
            .map(r => ({
                code: anonCode(r.visitorId),
                rating: Number(r.q5) || 0,
                text: String(r.q6).trim(),
                time: r.timestamp || r.created_at || null
            }))
            .sort((a, b) => {
                if (!a.time && !b.time) return 0;
                if (!a.time) return 1;
                if (!b.time) return -1;
                return new Date(b.time) - new Date(a.time);
            });
    }

    // 单平台聚合
    function aggregate(records, platform) {
        return {
            count: records.length,
            avgScore: overallScore(records),
            q1: avgScore(records, 'q1'),
            q2: avgScore(records, 'q2'),
            q4: avgScore(records, 'q4'),
            radar: radarValues(records, platform),
            reasonable: reasonableSplit(records),
            improvementRate: improvementRate(records),
            quotes: buildQuotes(records)
        };
    }

    return {
        scoreOf: scoreOf,
        avgScore: avgScore,
        overallScore: overallScore,
        checkboxRatio: checkboxRatio,
        radarValues: radarValues,
        reasonableSplit: reasonableSplit,
        improvementRate: improvementRate,
        anonCode: anonCode,
        buildQuotes: buildQuotes,
        aggregate: aggregate,
        round1: round1
    };
})();
