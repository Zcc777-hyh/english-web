// 满意度调查 - 后端配置
// API_BASE 留空时，数据层自动回退到 localStorage，前端可独立开发验收。
// CloudBase 环境开通后，填入 HTTP 访问服务域名即可切到云端。
const SURVEY_CONFIG = {
    // CloudBase 环境 ID: aidb-d0gz3mv23cba42047
    API_BASE: 'https://aidb-d0gz3mv23cba42047-1475639132.ap-shanghai.app.tcloudbase.com',

    // 云函数绑定的 HTTP 访问路径
    API_PATH: '/survey',

    // 真实数据少于该条数时，展示页整页切换为演示模式
    DEMO_THRESHOLD: 5,

    // localStorage 键名
    STORAGE_KEYS: {
        records: 'survey_data',
        submitted: 'survey_submitted',
        visitorId: 'survey_visitor_id',
        pending: 'survey_pending'
    },

    // 平台标识
    PLATFORMS: {
        debate: { key: 'debate', name: '辩论平台', icon: '🟦', color: '#2563EB' },
        speech: { key: 'speech', name: '演讲平台', icon: '🟧', color: '#EA580C' }
    }
};
