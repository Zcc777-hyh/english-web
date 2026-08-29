// 满意度调查 云函数 - CloudBase PostgreSQL（HTTP RESTful API 版本）
// 体验版是共享集群，不提供内网/外网直连地址，只能走 PostgREST 风格的 HTTP API。
// POST  写入/更新一条问卷记录（按 visitorId + platform 幂等，可重填）
// GET   返回聚合统计（不返回 visitorId）

const ENV_ID = process.env.CLOUDBASE_ENV_ID || 'aidb-d0gz3mv23cba42047';
const API_KEY = process.env.CLOUDBASE_API_KEY;
const REST_BASE = `https://${ENV_ID}.api.tcloudbasegateway.com/v1/rdb/rest`;
const TABLE = 'survey_data';

async function pgRequest(method, path, { headers = {}, body } = {}) {
    if (!API_KEY) {
        throw new Error('缺少 CLOUDBASE_API_KEY 环境变量，请在控制台创建 API Key 并配置到云函数');
    }

    const res = await fetch(`${REST_BASE}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            ...headers
        },
        body: body !== undefined ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`PostgreSQL HTTP API ${method} ${path} 失败(${res.status}): ${text}`);
    }

    if (res.status === 204) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

const DEMO_THRESHOLD = 5;
const TEXT_MAX_LENGTH = 500;

const ALLOWED_ORIGINS = [
    'https://aidb.net.cn',
    'https://www.aidb.net.cn',
    'http://localhost:8000',
    'http://localhost:63342',
    'http://127.0.0.1:8000'
];

// ---------- 题库白名单 ----------

const SCALES = {
    satisfaction: ['very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied'],
    improvement: ['significant', 'some', 'little', 'none', 'regressed'],
    reasonable: ['very_reasonable', 'reasonable', 'neutral', 'unreasonable', 'very_unreasonable']
};

const PLATFORMS = ['debate', 'speech'];

const ABILITIES = {
    debate: ['logic', 'expression', 'adaptability', 'evidence', 'rebuttal', 'confidence'],
    speech: ['structure', 'expression', 'voice', 'pace', 'gesture', 'confidence']
};

// 与 js/survey-questions.js 的 q3 选项 label 保持一致，供雷达图轴名使用
const ABILITY_LABELS = {
    logic: '逻辑思维', expression: '语言表达', adaptability: '临场应变',
    evidence: '论点论据组织', rebuttal: '反驳能力', confidence: '自信心',
    structure: '内容组织', voice: '声音语调', pace: '语速节奏', gesture: '肢体表达'
};

// ---------- 校验 ----------

function isString(val) {
    return typeof val === 'string';
}

function isValidEnum(val, enumList) {
    return isString(val) && enumList.indexOf(val) >= 0;
}

function isValidRating(val) {
    return Number.isInteger(val) && val >= 1 && val <= 5;
}

function isValidAbilityArray(val, platform) {
    if (!Array.isArray(val)) return false;
    if (val.length === 0) return true;
    const allowed = ABILITIES[platform] || [];
    return val.every(v => isString(v) && allowed.indexOf(v) >= 0);
}

function validatePayload(payload) {
    if (!payload || typeof payload !== 'object') {
        return { valid: false, error: '请求体必须是对象' };
    }

    const { platform, visitorId, q1, q2, q3, q4, q5, q6 } = payload;

    if (!isValidEnum(platform, PLATFORMS)) {
        return { valid: false, error: 'platform 必须是 debate 或 speech' };
    }

    if (!isString(visitorId) || visitorId.length < 5 || visitorId.length > 50) {
        return { valid: false, error: 'visitorId 不合法' };
    }

    if (!isValidEnum(q1, SCALES.satisfaction)) {
        return { valid: false, error: 'q1 不合法' };
    }

    if (!isValidEnum(q2, SCALES.improvement)) {
        return { valid: false, error: 'q2 不合法' };
    }

    if (!isValidAbilityArray(q3, platform)) {
        return { valid: false, error: 'q3 不合法' };
    }

    if (!isValidEnum(q4, SCALES.reasonable)) {
        return { valid: false, error: 'q4 不合法' };
    }

    if (!isValidRating(q5)) {
        return { valid: false, error: 'q5 必须是 1-5 的整数' };
    }

    if (q6 !== undefined && q6 !== null && q6 !== '') {
        if (!isString(q6) || q6.length > TEXT_MAX_LENGTH) {
            return { valid: false, error: 'q6 超长或格式不合法' };
        }
    }

    return { valid: true };
}

// ---------- 打分与聚合（与前端 survey-stats.js 保持一致）----------

const SCORE_TABLE = {
    q1: SCALES.satisfaction,
    q2: SCALES.improvement,
    q4: SCALES.reasonable
};

const SCORED_QUESTIONS = ['q1', 'q2', 'q4'];

function round1(n) {
    return Math.round(n * 10) / 10;
}

function mean(values) {
    if (!values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function scoreOf(questionId, value) {
    const order = SCORE_TABLE[questionId];
    if (!order) return null;
    const index = order.indexOf(value);
    return index === -1 ? null : 5 - index;
}

function avgScore(records, questionId) {
    const scores = records
        .map(r => scoreOf(questionId, r[questionId]))
        .filter(s => s !== null);
    return round1(mean(scores));
}

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

function checkboxRatio(records, questionId) {
    const ratio = {};
    if (!records.length) return ratio;
    records.forEach(r => {
        const picked = r[questionId];
        let arr = picked;
        if (typeof picked === 'string') {
            try {
                arr = JSON.parse(picked);
            } catch (e) {
                arr = [];
            }
        }
        if (!Array.isArray(arr)) return;
        arr.forEach(v => {
            ratio[v] = (ratio[v] || 0) + 1;
        });
    });
    Object.keys(ratio).forEach(k => {
        ratio[k] = ratio[k] / records.length;
    });
    return ratio;
}

function radarValues(records, platform) {
    const dimensions = ABILITIES[platform] || [];
    const ratio = checkboxRatio(records, 'q3');
    return dimensions.map(dim => ({
        key: dim,
        label: ABILITY_LABELS[dim] || dim,
        value: round1((ratio[dim] || 0) * 5)
    }));
}

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

function improvementRate(records) {
    if (!records.length) return 0;
    const improved = records.filter(r => {
        const v = r.q2;
        return v === 'significant' || v === 'some';
    }).length;
    return Math.round((improved / records.length) * 100);
}

// 由 visitorId 生成匿名展示代号，不暴露真实访客标识（与前端 survey-stats.js 保持一致）
function anonCode(visitorId) {
    const str = String(visitorId || '');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    const code = hash.toString(36).toUpperCase().slice(-4).padStart(4, '0');
    return '用户' + code;
}

function buildQuotes(records) {
    return records
        .filter(r => r.q6 && String(r.q6).trim())
        .map(r => ({
            code: anonCode(r.visitorId),
            rating: Number(r.q5) || 0,
            text: String(r.q6).trim(),
            time: r.timestamp || null
        }))
        .sort((a, b) => {
            if (!a.time && !b.time) return 0;
            if (!a.time) return 1;
            if (!b.time) return -1;
            return new Date(b.time) - new Date(a.time);
        });
}

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

// ---------- 数据库操作（通过 CloudBase PostgreSQL HTTP RESTful API）----------

function eqFilter(column, value) {
    return `${column}=eq.${encodeURIComponent(value)}`;
}

async function upsertRecord(payload) {
    const { platform, visitorId, q1, q2, q3, q4, q5, q6 } = payload;
    const q3Json = JSON.stringify(q3 || []);
    const q6Text = (q6 || '').trim();
    const createdAt = new Date().toISOString();

    const filter = `${eqFilter('visitor_id', visitorId)}&${eqFilter('platform', platform)}`;
    const existing = await pgRequest('GET', `/${TABLE}?select=id&${filter}`);

    if (Array.isArray(existing) && existing.length > 0) {
        await pgRequest('PATCH', `/${TABLE}?${filter}`, {
            body: { q1, q2, q3: q3Json, q4, q5, q6: q6Text, created_at: createdAt }
        });
    } else {
        await pgRequest('POST', `/${TABLE}`, {
            headers: { Prefer: 'return=minimal' },
            body: {
                visitor_id: visitorId,
                platform,
                q1, q2, q3: q3Json, q4, q5, q6: q6Text,
                created_at: createdAt
            }
        });
    }
}

async function fetchAllRecords() {
    const rows = await pgRequest('GET', `/${TABLE}?select=*`);

    return (rows || []).map(row => {
        let q3Arr = [];
        if (row.q3) {
            try {
                q3Arr = JSON.parse(row.q3);
            } catch (e) {
                q3Arr = [];
            }
        }
        return {
            platform: row.platform,
            visitorId: row.visitor_id,
            q1: row.q1,
            q2: row.q2,
            q3: q3Arr,
            q4: row.q4,
            q5: row.q5,
            q6: row.q6,
            timestamp: row.created_at
        };
    });
}

// ---------- 请求处理 ----------

async function handleSubmit(body, origin) {
    const validation = validatePayload(body);
    if (!validation.valid) {
        return respond(400, origin, { ok: false, error: validation.error });
    }

    try {
        await upsertRecord(body);
        return respond(200, origin, { ok: true });
    } catch (error) {
        console.error('写入数据库失败:', error);
        return respond(500, origin, { ok: false, error: '数据库写入失败: ' + error.message });
    }
}

// 查询当前访客在指定平台的最近一次提交（用于问卷回填，不暴露给其他访客）
async function handleGetOne(visitorId, platform, origin) {
    if (!isString(visitorId) || visitorId.length < 5 || visitorId.length > 50) {
        return respond(400, origin, { ok: false, error: 'visitorId 不合法' });
    }
    if (!isValidEnum(platform, PLATFORMS)) {
        return respond(400, origin, { ok: false, error: 'platform 必须是 debate 或 speech' });
    }

    try {
        const filter = `${eqFilter('visitor_id', visitorId)}&${eqFilter('platform', platform)}`;
        const rows = await pgRequest('GET', `/${TABLE}?select=*&${filter}`);
        if (!Array.isArray(rows) || rows.length === 0) {
            return respond(200, origin, { ok: true, record: null });
        }
        const row = rows[0];
        let q3Arr = [];
        if (row.q3) {
            try {
                q3Arr = JSON.parse(row.q3);
            } catch (e) {
                q3Arr = [];
            }
        }
        return respond(200, origin, {
            ok: true,
            record: {
                platform: row.platform,
                q1: row.q1, q2: row.q2, q3: q3Arr, q4: row.q4, q5: row.q5, q6: row.q6
            }
        });
    } catch (error) {
        console.error('查询单条记录失败:', error);
        return respond(500, origin, { ok: false, error: '查询失败: ' + error.message });
    }
}

async function handleStats(origin) {
    try {
        const records = await fetchAllRecords();
        const total = records.length;
        const result = {
            ok: true,
            demo: total < DEMO_THRESHOLD,
            total: total
        };

        PLATFORMS.forEach(platform => {
            result[platform] = aggregate(
                records.filter(r => r.platform === platform),
                platform
            );
        });

        return respond(200, origin, result);
    } catch (error) {
        console.error('查询统计失败:', error);
        return respond(500, origin, { ok: false, error: '查询失败: ' + error.message });
    }
}

function respond(status, origin, data) {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (origin && ALLOWED_ORIGINS.indexOf(origin) >= 0) {
        headers['Access-Control-Allow-Origin'] = origin;
    } else if (origin && origin.indexOf('localhost') >= 0) {
        headers['Access-Control-Allow-Origin'] = origin;
    } else {
        headers['Access-Control-Allow-Origin'] = ALLOWED_ORIGINS[0];
    }

    return {
        statusCode: status,
        headers: headers,
        body: JSON.stringify(data)
    };
}

// ---------- 入口 ----------

exports.main = async (event) => {
    const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
    const method = event.httpMethod || 'GET';

    if (method === 'OPTIONS') {
        return respond(204, origin, {});
    }

    try {
        if (method === 'POST') {
            let body = event.body;
            if (typeof body === 'string') {
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    return respond(400, origin, { ok: false, error: '请求体不是合法 JSON' });
                }
            }
            return await handleSubmit(body, origin);
        }

        if (method === 'GET') {
            const query = event.queryStringParameters || {};
            if (query.visitor_id && query.platform) {
                return await handleGetOne(query.visitor_id, query.platform, origin);
            }
            return await handleStats(origin);
        }

        return respond(405, origin, { ok: false, error: '不支持的请求方法' });
    } catch (error) {
        console.error('云函数异常:', error);
        return respond(500, origin, { ok: false, error: '服务器内部错误: ' + error.message });
    }
};
