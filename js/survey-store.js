// 满意度调查 - 数据层
// 把「后端是否就绪」完全封装在这里：SURVEY_CONFIG.API_BASE 为空时走 localStorage，
// 填上之后自动切到 CloudBase 云函数，上层代码无需改动。

const SurveyStore = (function () {
    const KEYS = SURVEY_CONFIG.STORAGE_KEYS;

    function isCloudEnabled() {
        return Boolean(SURVEY_CONFIG.API_BASE);
    }

    function apiUrl() {
        return SURVEY_CONFIG.API_BASE.replace(/\/$/, '') + SURVEY_CONFIG.API_PATH;
    }

    function readJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function writeJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            // 隐私模式或配额耗尽
            return false;
        }
    }

    function getVisitorId() {
        let id = readJSON(KEYS.visitorId, null);
        if (!id) {
            id = 'v_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
            writeJSON(KEYS.visitorId, id);
        }
        return id;
    }

    function hasSubmitted(platform) {
        const submitted = readJSON(KEYS.submitted, []);
        return submitted.indexOf(platform) >= 0;
    }

    function submittedPlatforms() {
        return readJSON(KEYS.submitted, []);
    }

    function markSubmitted(platform) {
        const submitted = readJSON(KEYS.submitted, []);
        if (submitted.indexOf(platform) < 0) {
            submitted.push(platform);
            writeJSON(KEYS.submitted, submitted);
        }
    }

    // 提交一份问卷（payload: { platform, visitorId, q1, q2, q3, q4, q5 }）
    function submitSurvey(payload, callback) {
        if (isCloudEnabled()) {
            submitToCloud(payload, callback);
        } else {
            submitToLocal(payload, callback);
        }
    }

    // 把提交内容写入 localStorage 缓存（云端/本地模式都会调用），
    // 保证刷新页面或关闭窗口后，下次打开问卷仍能从本地立即回填，不必等网络请求。
    function cacheLocalRecord(payload) {
        const records = readJSON(KEYS.records, []);
        const existing = records.findIndex(r =>
            r.visitorId === payload.visitorId && r.platform === payload.platform
        );
        if (existing >= 0) {
            records[existing] = payload;
        } else {
            records.push(payload);
        }
        return writeJSON(KEYS.records, records);
    }

    function submitToCloud(payload, callback) {
        fetch(apiUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    cacheLocalRecord(payload);
                    callback(true);
                } else {
                    console.error('云端提交失败:', data.error);
                    queueForRetry(payload);
                    callback(false);
                }
            })
            .catch(err => {
                console.error('云端提交失败:', err);
                queueForRetry(payload);
                callback(false);
            });
    }

    function submitToLocal(payload, callback) {
        const success = cacheLocalRecord(payload);
        callback(success);
    }

    function queueForRetry(payload) {
        const queue = readJSON(KEYS.pending, []);
        const existing = queue.findIndex(r =>
            r.visitorId === payload.visitorId && r.platform === payload.platform
        );
        if (existing >= 0) {
            queue[existing] = payload;
        } else {
            queue.push(payload);
        }
        writeJSON(KEYS.pending, queue);
    }

    function flushPending() {
        if (!isCloudEnabled()) return;
        const queue = readJSON(KEYS.pending, []);
        if (queue.length === 0) return;

        queue.forEach(payload => {
            fetch(apiUrl(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.ok) {
                        const updated = readJSON(KEYS.pending, []);
                        const remain = updated.filter(r =>
                            !(r.visitorId === payload.visitorId && r.platform === payload.platform)
                        );
                        writeJSON(KEYS.pending, remain);
                    }
                })
                .catch(() => {});
        });
    }

    // 获取聚合统计
    function fetchStats(callback) {
        if (isCloudEnabled()) {
            fetch(apiUrl(), { method: 'GET' })
                .then(res => res.json())
                .then(data => callback(data))
                .catch(err => {
                    console.error('获取统计失败:', err);
                    callback(aggregateLocal(readJSON(KEYS.records, [])));
                });
        } else {
            callback(aggregateLocal(readJSON(KEYS.records, [])));
        }
    }

    function aggregateLocal(records) {
        const total = records.length;
        const result = {
            ok: true,
            demo: total < SURVEY_CONFIG.DEMO_THRESHOLD,
            total: total
        };
        Object.keys(SURVEY_CONFIG.PLATFORMS).forEach(platform => {
            result[platform] = SurveyStats.aggregate(
                records.filter(r => r.platform === platform),
                platform
            );
        });
        return result;
    }

    function getLocalRecords() {
        return readJSON(KEYS.records, []);
    }

    function findLocalRecord(visitorId, platform) {
        const records = readJSON(KEYS.records, []);
        return records.find(r =>
            r.visitorId === visitorId && r.platform === platform
        ) || null;
    }

    // 获取当前访客指定平台的最近一次提交记录（用于回填问卷）
    // 优先读取 localStorage 本地缓存，保证刷新/重开窗口后立即回填；
    // 本地没有记录时（例如换设备）再尝试云端兜底查询。
    function getLastSubmission(platform) {
        const visitorId = getVisitorId();
        const local = findLocalRecord(visitorId, platform);
        if (local) {
            return Promise.resolve(local);
        }

        if (!isCloudEnabled()) {
            return Promise.resolve(null);
        }

        return new Promise((resolve) => {
            fetch(apiUrl() + '?visitor_id=' + encodeURIComponent(visitorId) + '&platform=' + encodeURIComponent(platform), {
                method: 'GET'
            })
                .then(res => res.json())
                .then(data => {
                    if (data.ok && data.record) {
                        cacheLocalRecord(data.record);
                        resolve(data.record);
                    } else {
                        resolve(null);
                    }
                })
                .catch(() => resolve(null));
        });
    }

    return {
        isCloudEnabled: isCloudEnabled,
        getVisitorId: getVisitorId,
        hasSubmitted: hasSubmitted,
        submittedPlatforms: submittedPlatforms,
        markSubmitted: markSubmitted,
        submitSurvey: submitSurvey,
        flushPending: flushPending,
        fetchStats: fetchStats,
        getLocalRecords: getLocalRecords,
        getLastSubmission: getLastSubmission
    };
})();
