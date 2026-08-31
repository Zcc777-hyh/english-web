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
            { code: '用户A3F1', rating: 5, text: '用了大半个月，明显感觉自己敢开口反驳了。AI给的论据漏洞提示特别准，像有个教练在旁边盯着。', time: '2026-08-27T21:14:00.000Z' },
            { code: '用户7C2E', rating: 4, text: '整体挺好，就是偶尔AI打分我自己都没看出问题在哪，得多看几遍反馈才明白。', time: '2026-08-25T13:02:00.000Z' },
            { code: '用户D91B', rating: 5, text: '论点组织这块进步肉眼可见，以前写论证东一句西一句，现在会先搭框架了。', time: '2026-08-23T19:40:00.000Z' },
            { code: '用户44AA', rating: 4, text: '题库更新挺快，中国文化主题的辩题很有意思，"传统与创新"那道题让我认真想了好久。', time: '2026-08-20T10:18:00.000Z' },
            { code: '用户B0F7', rating: 3, text: '功能是齐全的，但节奏偏慢，一场下来花的时间比预期长不少。', time: '2026-08-17T22:05:00.000Z' },
            { code: '用户E2C9', rating: 4, text: '语音识别偶尔跟不上语速，说快了会漏字，不过整体不影响使用。', time: '2026-08-14T15:33:00.000Z' },
            { code: '用户K7Y3', rating: 5, text: '最爱临场应变模块，系统给的追问跟真人反问很像，练完真敢跟人对线了。', time: '2026-08-11T08:47:00.000Z' },
            { code: '用户P2M6', rating: 4, text: '自信心确实涨了，但反驳能力这项自己感觉一般，可能还得多练几场。', time: '2026-08-07T20:26:00.000Z' },
            { code: '用户W9T4', rating: 3, text: '整体不错，不过希望能加个语音语调的实时提示，光看文字反馈还是差点意思。', time: '2026-08-03T11:10:00.000Z' },
            { code: '用户H5D8', rating: 4, text: '界面挺清爽，上手没花多少时间，评分细则写得也算清楚。', time: '2026-07-30T16:55:00.000Z' },
            { code: '用户Q1L0', rating: 2, text: '这几天总是提交后卡在评分页面，刷新好几次才出结果，体验有点影响心情。', time: '2026-07-26T09:38:00.000Z' }
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
            { code: '用户9K3P', rating: 5, text: '声音语调的反馈特别细，一条条列出哪里语速快了，改完自己录音回听真的顺多了。', time: '2026-08-26T18:22:00.000Z' },
            { code: '用户1M6Q', rating: 4, text: '内容组织的建议挺实用，讲中国故事更有条理了，不过有时候建议有点笼统。', time: '2026-08-24T09:15:00.000Z' },
            { code: '用户X5T8', rating: 3, text: '肢体表达这项提升还不明显，光靠文字提示感觉不够直观，希望能有示范视频。', time: '2026-08-21T20:48:00.000Z' },
            { code: '用户R7L2', rating: 5, text: 'AI打分和我自己听录音的感受基本一致，没有那种"算法瞎打分"的违和感。', time: '2026-08-18T14:30:00.000Z' },
            { code: '用户G0V4', rating: 4, text: '自信心提升挺明显的，敢在同学面前完整讲完一段了，就是偶尔卡壳系统提示不够及时。', time: '2026-08-15T11:05:00.000Z' },
            { code: '用户Y3B7', rating: 4, text: '语速节奏这块帮我改掉了赶稿式念稿的毛病，现在讲话会自然停顿了。', time: '2026-08-11T21:37:00.000Z' },
            { code: '用户F8N2', rating: 3, text: '总体还行，但每次训练时长有点长，中途容易分心，建议能拆成小节。', time: '2026-08-08T16:14:00.000Z' },
            { code: '用户C4J9', rating: 5, text: '真的挺惊喜，讲了三次之后老师都说我台风稳多了，这个AI反馈是真的有用。', time: '2026-08-04T10:52:00.000Z' },
            { code: '用户T6R1', rating: 4, text: '内容组织建议挺细，但界面偶尔卡顿，提交完等半天才出结果。', time: '2026-07-31T19:20:00.000Z' },
            { code: '用户V0S5', rating: 2, text: '这周用感觉评分标准前后不太一致，同样的稿子两次给分差挺多，有点摸不着头脑。', time: '2026-07-27T13:44:00.000Z' }
        ]
    }
};

// 底部宣传区演示数值（真实模式下不编造训练时长，仅演示模式展示）
const SURVEY_MOCK_CTA = {
    totalUsers: 320,
    totalHours: 1860,
    avgImprovement: 0.8
};
