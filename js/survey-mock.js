// 满意度调查 - 演示数据
// 仅当真实提交数不足 SURVEY_CONFIG.DEMO_THRESHOLD 条时，由 survey-dashboard.js 整页切换使用。
// 不与真实数据混算，纯粹用于展示区域的效果演示。

const SURVEY_MOCK_STATS = {
    ok: true,
    demo: true,
    total: 42,
    debate: {
        count: 24,
        avgScore: 4.3,
        q1: 4.4,
        q2: 4.2,
        q4: 4.1,
        radar: [
            { key: 'logic', label: '逻辑思维', value: 4.4 },
            { key: 'expression', label: '语言表达', value: 4.0 },
            { key: 'adaptability', label: '临场应变', value: 3.8 },
            { key: 'evidence', label: '论点论据组织', value: 4.1 },
            { key: 'rebuttal', label: '反驳能力', value: 3.9 },
            { key: 'confidence', label: '自信心', value: 4.3 }
        ],
        reasonable: { reasonable: 18, neutral: 4, unreasonable: 2 },
        improvementRate: 0.83,
        quotes: [
            { code: '用户A3F1', rating: 5, text: '辩论智能体的反驳很犀利，逼着我把论据想得更周全，逻辑思维提升明显。', time: '2026-08-20T09:12:00.000Z' },
            { code: '用户7C2E', rating: 4, text: 'AI 评分整体合理，偶尔在临场应变的打分上感觉偏严格。', time: '2026-08-18T14:30:00.000Z' },
            { code: '用户D91B', rating: 5, text: '用了两周，感觉自己敢开口反驳了，自信心提升很大。', time: '2026-08-15T20:05:00.000Z' },
            { code: '用户44AA', rating: 4, text: '题库很丰富，中国文化主题的辩题很有意思。', time: '2026-08-10T11:47:00.000Z' },
            { code: '用户B0F7', rating: 3, text: '整体不错，希望能增加更多实时语音反馈的细节提示。', time: '2026-08-05T08:22:00.000Z' },
            { code: '用户E2C9', rating: 5, text: '论点论据组织这块进步最大，AI 会指出我逻辑链条里的漏洞。', time: '2026-07-28T16:10:00.000Z' }
        ]
    },
    speech: {
        count: 18,
        avgScore: 4.1,
        q1: 4.2,
        q2: 4.0,
        q4: 4.0,
        radar: [
            { key: 'structure', label: '内容组织', value: 4.2 },
            { key: 'expression', label: '语言表达', value: 4.0 },
            { key: 'voice', label: '声音语调', value: 3.7 },
            { key: 'pace', label: '语速节奏', value: 3.9 },
            { key: 'gesture', label: '肢体表达', value: 3.5 },
            { key: 'confidence', label: '自信心', value: 4.1 }
        ],
        reasonable: { reasonable: 12, neutral: 4, unreasonable: 2 },
        improvementRate: 0.78,
        quotes: [
            { code: '用户9K3P', rating: 5, text: '演讲智能体对声音语调的反馈很细致，帮我改掉了语速太快的问题。', time: '2026-08-22T10:00:00.000Z' },
            { code: '用户1M6Q', rating: 4, text: '内容组织建议很实用，讲中国故事更有条理了。', time: '2026-08-19T13:20:00.000Z' },
            { code: '用户X5T8', rating: 4, text: '肢体表达这项提升还不明显，期待后续能有更直观的示范。', time: '2026-08-12T09:40:00.000Z' },
            { code: '用户R7L2', rating: 5, text: 'AI 打分和我自己听录音的感受基本一致，评分合理。', time: '2026-08-07T17:55:00.000Z' },
            { code: '用户G0V4', rating: 4, text: '自信心提升明显，敢在同学面前完整讲完一段演讲了。', time: '2026-07-30T12:15:00.000Z' }
        ]
    }
};

// 底部宣传区演示数值（真实模式下不编造训练时长，仅演示模式展示）
const SURVEY_MOCK_CTA = {
    totalUsers: 320,
    totalHours: 1860,
    avgImprovement: 0.8
};
