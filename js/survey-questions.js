// 满意度调查 - 题库（纯数据）
// 每个平台固定 5 题：整体满意度 / 使用效果 / 能力提升 / AI评分合理性 / 推荐意愿。
// 所有选项使用英文枚举 value 存储，中文文案仅存在于此文件，
// 便于后续修改文案而不污染历史数据。

const SURVEY_SCALE_SATISFACTION = [
    { value: 'very_satisfied', label: '非常满意', score: 5, emoji: '😄' },
    { value: 'satisfied', label: '满意', score: 4, emoji: '😊' },
    { value: 'neutral', label: '一般', score: 3, emoji: '😐' },
    { value: 'dissatisfied', label: '不满意', score: 2, emoji: '😞' },
    { value: 'very_dissatisfied', label: '非常不满意', score: 1, emoji: '😡' }
];

const SURVEY_SCALE_IMPROVEMENT = [
    { value: 'significant', label: '提升非常明显', score: 5, emoji: '💪' },
    { value: 'some', label: '有一定提升', score: 4, emoji: '👍' },
    { value: 'little', label: '变化不大', score: 3, emoji: '😐' },
    { value: 'none', label: '没有提升', score: 2, emoji: '👎' },
    { value: 'regressed', label: '反而退步了', score: 1, emoji: '😓' }
];

const SURVEY_SCALE_REASONABLE = [
    { value: 'very_reasonable', label: '非常合理', score: 5, emoji: '😄' },
    { value: 'reasonable', label: '比较合理', score: 4, emoji: '😊' },
    { value: 'neutral', label: '一般', score: 3, emoji: '😐' },
    { value: 'unreasonable', label: '不太合理', score: 2, emoji: '😞' },
    { value: 'very_unreasonable', label: '完全不合理', score: 1, emoji: '😡' }
];

const SURVEY_DEBATE = {
    questions: [
        {
            id: 'q1', type: 'radio', required: true,
            title: '您对辩论智能体的整体使用体验满意吗？',
            options: SURVEY_SCALE_SATISFACTION
        },
        {
            id: 'q2', type: 'radio', required: true,
            title: '使用辩论智能体后，您的辩论能力有提升吗？',
            options: SURVEY_SCALE_IMPROVEMENT
        },
        {
            id: 'q3', type: 'checkbox', required: false,
            title: '您认为辩论智能体主要提升了您的哪些能力？',
            options: [
                { value: 'logic', label: '逻辑思维' },
                { value: 'expression', label: '语言表达' },
                { value: 'adaptability', label: '临场应变' },
                { value: 'evidence', label: '论点论据组织' },
                { value: 'rebuttal', label: '反驳能力' },
                { value: 'confidence', label: '自信心' }
            ]
        },
        {
            id: 'q4', type: 'radio', required: true,
            title: '您认为辩论智能体的 AI 评分和反馈是否合理？',
            options: SURVEY_SCALE_REASONABLE
        },
        {
            id: 'q5', type: 'rating', required: true, max: 5,
            title: '您愿意把这个辩论智能体推荐给同学吗？'
        },
        {
            id: 'q6', type: 'textarea', required: false, maxLength: 500,
            title: '分享一下您的真实体验吧',
            placeholder: '快来分享一下你的真实体验吧~'
        }
    ],
    // 雷达图直接用 q3 全部选项，勾选比例 × 5
    radar: ['logic', 'expression', 'adaptability', 'evidence', 'rebuttal', 'confidence']
};

const SURVEY_SPEECH = {
    questions: [
        {
            id: 'q1', type: 'radio', required: true,
            title: '您对演讲智能体的整体使用体验满意吗？',
            options: SURVEY_SCALE_SATISFACTION
        },
        {
            id: 'q2', type: 'radio', required: true,
            title: '使用演讲智能体后，您的演讲能力有提升吗？',
            options: SURVEY_SCALE_IMPROVEMENT
        },
        {
            id: 'q3', type: 'checkbox', required: false,
            title: '您认为演讲智能体主要提升了您的哪些能力？',
            options: [
                { value: 'structure', label: '内容组织' },
                { value: 'expression', label: '语言表达' },
                { value: 'voice', label: '声音语调' },
                { value: 'pace', label: '语速节奏' },
                { value: 'gesture', label: '肢体表达' },
                { value: 'confidence', label: '自信心' }
            ]
        },
        {
            id: 'q4', type: 'radio', required: true,
            title: '您认为演讲智能体的 AI 评分和反馈是否合理？',
            options: SURVEY_SCALE_REASONABLE
        },
        {
            id: 'q5', type: 'rating', required: true, max: 5,
            title: '您愿意把这个演讲智能体推荐给同学吗？'
        },
        {
            id: 'q6', type: 'textarea', required: false, maxLength: 500,
            title: '分享一下您的真实体验吧',
            placeholder: '快来分享一下你的真实体验吧~'
        }
    ],
    radar: ['structure', 'expression', 'voice', 'pace', 'gesture', 'confidence']
};

const SURVEY_QUESTIONS = {
    debate: SURVEY_DEBATE,
    speech: SURVEY_SPEECH
};

// 展示页柱状图对比维度：整体满意度 / AI评分合理度 / 综合满意度
const SURVEY_BAR_DIMENSIONS = [
    { key: 'q1', label: '整体满意度' },
    { key: 'q4', label: 'AI评分合理度' },
    { key: 'overall', label: '综合满意度' }
];

// 由 value 反查 label / score / emoji，供数据层校验与展示页使用
function surveyFindOption(platform, questionId, value) {
    const bank = SURVEY_QUESTIONS[platform];
    if (!bank) return null;
    const question = bank.questions.find(q => q.id === questionId);
    if (!question || !question.options) return null;
    return question.options.find(o => o.value === value) || null;
}

// 取某题的中文标签（雷达图轴名、展示页等处使用）
function surveyOptionLabel(platform, questionId, value) {
    const option = surveyFindOption(platform, questionId, value);
    return option ? option.label : value;
}
