// 满意度调查 - 悬浮入口与单页问卷
// 自初始化：页面只需引入本文件，无需在 HTML 中写任何结构。

const SurveyWidget = (function () {
    let state = {
        step: 0,            // 0 选平台 / 1 填问卷 / 2 感谢页
        platform: null,
        answers: {},        // 扁平结构：{ q1, q2, q3, q4, q5, q6 }
        isUpdate: false,     // 本次填写是否为「已提交过，回填修改」
        submitWasUpdate: false,
        lastFocus: null
    };

    const STEP_TITLES = ['选择平台', '问卷调查', '完成'];

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    // ---------- 悬浮按钮 ----------
    // 悬浮窗只负责问卷收集：始终显示同一个入口，不做「已完成/查看结果」状态切换。

    function buildLauncher() {
        const btn = el('button', 'survey-launcher');
        btn.id = 'surveyLauncher';
        const icon = el('span', 'survey-launcher-icon', '📋');
        const label = el('span', 'survey-launcher-label', '满意度调查');
        btn.appendChild(icon);
        btn.appendChild(label);
        btn.setAttribute('aria-label', '打开满意度调查问卷');
        btn.addEventListener('click', open);
        document.body.appendChild(btn);
    }

    function refreshLauncher() {
        const old = document.getElementById('surveyLauncher');
        if (old) old.remove();
        buildLauncher();
    }

    // ---------- 弹窗骨架 ----------

    function buildModal() {
        const overlay = el('div', 'survey-overlay');
        overlay.id = 'surveyOverlay';
        overlay.hidden = true;

        const dialog = el('div', 'survey-dialog');
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-labelledby', 'surveyTitle');

        const header = el('div', 'survey-header');
        const progress = el('div', 'survey-progress-bar');
        progress.id = 'surveyProgressBar';
        progress.setAttribute('role', 'progressbar');
        progress.setAttribute('aria-valuemin', '0');
        progress.setAttribute('aria-valuemax', '2');
        const progressFill = el('div', 'survey-progress-fill');
        progressFill.id = 'surveyProgressFill';
        progress.appendChild(progressFill);

        const stepLabel = el('div', 'survey-step-label');
        stepLabel.id = 'surveyStepLabel';
        header.appendChild(progress);
        header.appendChild(stepLabel);

        const closeBtn = el('button', 'survey-close');
        closeBtn.textContent = '×';
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', '关闭问卷');
        closeBtn.addEventListener('click', close_);
        header.appendChild(closeBtn);

        const body = el('div', 'survey-body');
        body.id = 'surveyBody';

        const footer = el('div', 'survey-footer');
        footer.id = 'surveyFooter';

        dialog.appendChild(header);
        dialog.appendChild(body);
        dialog.appendChild(footer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }

    function open() {
        state.step = 0;
        state.platform = null;
        state.answers = {};
        state.isUpdate = false;
        state.submitWasUpdate = false;
        render();
        const overlay = document.getElementById('surveyOverlay');
        overlay.hidden = false;
        state.lastFocus = document.activeElement;
        const dialog = overlay.querySelector('.survey-dialog');
        if (dialog) dialog.focus();
    }

    function close_() {
        const overlay = document.getElementById('surveyOverlay');
        overlay.hidden = true;
        if (state.lastFocus) state.lastFocus.focus();
    }

    // ---------- 渲染分发 ----------

    function render() {
        updateProgress();
        const body = document.getElementById('surveyBody');
        body.innerHTML = '';

        if (state.step === 0) body.appendChild(renderPlatformStep());
        else if (state.step === 1) body.appendChild(renderQuestionStep());
        else body.appendChild(renderThanksStep());

        renderFooter();
    }

    function updateProgress() {
        const bar = document.getElementById('surveyProgressFill');
        const label = document.getElementById('surveyStepLabel');
        const wrap = document.getElementById('surveyProgressBar');
        const pct = (state.step / 2) * 100;
        bar.style.width = pct + '%';
        wrap.setAttribute('aria-valuenow', String(state.step));
        label.textContent = STEP_TITLES[state.step] + '（' + (state.step + 1) + '/3）';
    }

    // ---------- 第 0 步：选平台 ----------

    function renderPlatformStep() {
        const wrap = el('div');
        const title = el('h3', 'survey-section-title', '您正在使用哪个平台？');
        wrap.appendChild(title);

        const grid = el('div', 'survey-platform-grid');
        Object.keys(SURVEY_CONFIG.PLATFORMS).forEach(key => {
            const platform = SURVEY_CONFIG.PLATFORMS[key];
            const card = el('button', 'survey-platform-card ' + key);
            card.type = 'button';
            card.setAttribute('aria-label', platform.name);

            const icon = el('span', 'survey-platform-icon', platform.icon);
            const name = el('span', 'survey-platform-name', platform.name);
            card.appendChild(icon);
            card.appendChild(name);

            card.addEventListener('click', () => {
                state.platform = key;
                state.step = 1;
                state.answers = {};
                state.isUpdate = false;
                render();
                prefillFromLastSubmission(key);
            });
            grid.appendChild(card);
        });
        wrap.appendChild(grid);
        return wrap;
    }

    // 自动回填该访客上一次在此平台的提交内容，供修改后重新提交
    function prefillFromLastSubmission(platform) {
        SurveyStore.getLastSubmission(platform).then(record => {
            if (!record) return;
            // 用户已经切换到别的平台/步骤，回填结果作废
            if (state.step !== 1 || state.platform !== platform) return;

            const bank = SURVEY_QUESTIONS[platform];
            if (!bank) return;
            bank.questions.forEach(q => {
                if (record[q.id] !== undefined && record[q.id] !== null) {
                    state.answers[q.id] = record[q.id];
                }
            });
            state.isUpdate = true;
            render();
        });
    }

    // ---------- 第 1 步：5 题单页 ----------
    

    function renderQuestionStep() {
        const wrap = el('div');
        const bank = SURVEY_QUESTIONS[state.platform];
        if (!bank) {
            wrap.textContent = '题库加载失败';
            return wrap;
        }

        if (state.isUpdate) {
            wrap.appendChild(el('p', 'survey-prefill-hint', '已为您回填上次填写的内容，可直接修改后重新提交～'));
        }

        bank.questions.forEach((q, index) => {
            wrap.appendChild(renderQuestion(q, index + 1));
        });
        return wrap;
    }

    function renderQuestion(question, index) {
        const wrap = el('div', 'survey-question');
        const titleWrap = el('div', 'survey-question-title-wrap');
        const number = el('span', 'survey-question-index', index + '.');
        const title = el('div', 'survey-question-title', question.title);
        if (question.required) {
            const req = el('span', 'survey-required', '*');
            title.appendChild(req);
        }
        titleWrap.appendChild(number);
        titleWrap.appendChild(title);
        wrap.appendChild(titleWrap);

        const optionsWrap = el('div', 'survey-question-options');
        if (question.type === 'radio') {
            optionsWrap.appendChild(renderRadio(question));
        } else if (question.type === 'checkbox') {
            optionsWrap.appendChild(renderCheckbox(question));
        } else if (question.type === 'rating') {
            optionsWrap.appendChild(renderRating(question));
        } else if (question.type === 'textarea') {
            optionsWrap.appendChild(renderTextarea(question));
        }
        wrap.appendChild(optionsWrap);
        return wrap;
    }

    function renderRadio(question) {
        const wrap = el('div', 'survey-emoji-group');
        question.options.forEach(option => {
            const btn = el('button', 'survey-emoji-btn');
            btn.type = 'button';
            btn.dataset.value = option.value;
            btn.setAttribute('aria-label', option.label);

            const emoji = el('span', 'survey-emoji', option.emoji || '○');
            const label = el('span', 'survey-emoji-label', option.label);
            btn.appendChild(emoji);
            btn.appendChild(label);

            if (state.answers[question.id] === option.value) {
                btn.classList.add('selected');
            }

            btn.addEventListener('click', () => {
                state.answers[question.id] = option.value;
                // 清除其他按钮的选中状态
                wrap.querySelectorAll('.survey-emoji-btn').forEach(b => {
                    b.classList.remove('selected');
                });
                btn.classList.add('selected');
                updateSubmitButton();
            });

            wrap.appendChild(btn);
        });
        return wrap;
    }

    function renderCheckbox(question) {
        const wrap = el('div', 'survey-checkbox-group');
        question.options.forEach(option => {
            const btn = el('button', 'survey-checkbox-btn');
            btn.type = 'button';
            btn.dataset.value = option.value;
            btn.setAttribute('aria-pressed', 'false');

            const mark = el('span', 'survey-checkbox-mark');
            const label = el('span', 'survey-checkbox-label', option.label);
            btn.appendChild(mark);
            btn.appendChild(label);

            const current = state.answers[question.id];
            if (Array.isArray(current) && current.indexOf(option.value) >= 0) {
                btn.classList.add('selected');
                btn.setAttribute('aria-pressed', 'true');
            }

            btn.addEventListener('click', () => {
                let arr = state.answers[question.id];
                if (!Array.isArray(arr)) arr = [];
                const isSelected = btn.classList.contains('selected');
                if (isSelected) {
                    arr = arr.filter(v => v !== option.value);
                    btn.classList.remove('selected');
                    btn.setAttribute('aria-pressed', 'false');
                } else {
                    arr.push(option.value);
                    btn.classList.add('selected');
                    btn.setAttribute('aria-pressed', 'true');
                }
                state.answers[question.id] = arr;
            });

            wrap.appendChild(btn);
        });
        return wrap;
    }

    function renderRating(question) {
        const wrap = el('div', 'survey-rating');
        const max = question.max || 5;
        let hovering = 0;

        function paint(value) {
            wrap.querySelectorAll('.survey-rating-star').forEach((star, i) => {
                if (i < value) {
                    star.textContent = '★';
                    star.classList.add('filled');
                } else {
                    star.textContent = '☆';
                    star.classList.remove('filled');
                }
            });
        }

        for (let i = 1; i <= max; i++) {
            const star = el('button', 'survey-rating-star');
            star.type = 'button';
            star.textContent = '☆';
            star.setAttribute('aria-label', i + ' 星');

            star.addEventListener('click', () => {
                state.answers[question.id] = i;
                paint(i);
                updateSubmitButton();
            });

            star.addEventListener('mouseenter', () => {
                hovering = i;
                paint(i);
            });

            wrap.appendChild(star);
        }

        wrap.addEventListener('mouseleave', () => {
            hovering = 0;
            const current = state.answers[question.id] || 0;
            paint(current);
        });

        // 初始渲染
        const current = state.answers[question.id] || 0;
        paint(current);

        return wrap;
    }

    function renderTextarea(question) {
        const textarea = document.createElement('textarea');
        textarea.className = 'survey-textarea';
        textarea.placeholder = question.placeholder || '';
        textarea.maxLength = question.maxLength || 500;
        textarea.rows = 4;
        textarea.value = state.answers[question.id] || '';

        textarea.addEventListener('input', (e) => {
            state.answers[question.id] = e.target.value.trim();
            updateSubmitButton();
        });

        return textarea;
    }

    // ---------- 第 2 步：感谢页 ----------

    function renderThanksStep() {
        const wrap = el('div', 'survey-thanks');
        wrap.appendChild(el('div', 'survey-thanks-emoji', '🎉'));
        wrap.appendChild(el('h3', 'survey-thanks-title', state.submitWasUpdate ? '评价已更新！' : '感谢您的反馈！'));
        wrap.appendChild(el('p', 'survey-thanks-text', '您的意见将帮助我们做得更好'));
        return wrap;
    }

    // ---------- 底部导航 ----------

    function renderFooter() {
        const footer = document.getElementById('surveyFooter');
        footer.innerHTML = '';

        if (state.step === 2) {
            // 感谢页暂时不显示按钮，等展示页做好后再加
            return;
        }

        if (state.step > 0) {
            const backBtn = el('button', 'survey-btn survey-btn-secondary', '← 上一步');
            backBtn.type = 'button';
            backBtn.addEventListener('click', () => {
                state.step -= 1;
                render();
            });
            footer.appendChild(backBtn);
        }

        if (state.step === 1) {
            const nextBtn = el('button', 'survey-btn survey-btn-primary', '提交');
            nextBtn.type = 'button';
            nextBtn.id = 'surveySubmitBtn';
            nextBtn.disabled = !isStepValid();
            if (!isStepValid()) {
                nextBtn.classList.add('disabled');
            }
            nextBtn.addEventListener('click', handleSubmit);
            footer.appendChild(nextBtn);
        }
    }

    function isStepValid() {
        if (state.step !== 1) return true;
        const bank = SURVEY_QUESTIONS[state.platform];
        if (!bank) return false;
        return bank.questions.every(q => {
            if (!q.required) return true;
            const val = state.answers[q.id];
            if (q.type === 'checkbox') return true; // 多选题不强制
            if (q.type === 'rating') return val >= 1 && val <= (q.max || 5);
            return val != null && val !== '';
        });
    }

    function updateSubmitButton() {
        const btn = document.getElementById('surveySubmitBtn');
        if (btn) {
            const valid = isStepValid();
            btn.disabled = !valid;
            if (valid) {
                btn.classList.remove('disabled');
            } else {
                btn.classList.add('disabled');
            }
        }
    }

    function handleSubmit() {
        const wasUpdate = state.isUpdate;
        const payload = {
            platform: state.platform,
            visitorId: SurveyStore.getVisitorId(),
            ...state.answers
        };

        console.log('准备提交:', payload);

        SurveyStore.submitSurvey(payload, (success) => {
            console.log('提交结果:', success);
            if (success) {
                SurveyStore.markSubmitted(state.platform);
                state.submitWasUpdate = wasUpdate;
                state.step = 2;
                render();
                refreshLauncher();
                if (typeof showToast === 'function') {
                    showToast(wasUpdate ? '评价已更新' : '感谢您的反馈！');
                }
            } else {
                if (typeof showToast === 'function') {
                    showToast('提交失败，已为您本地保存，将自动重试');
                } else {
                    alert('提交失败，请稍后重试');
                }
            }
        });
    }

    // ---------- 初始化 ----------

    function init() {
        // survey.html 自身不放悬浮按钮，避免与页内内容重复
        if (document.body.classList.contains('survey-dashboard-page')) return;

        buildLauncher();
        buildModal();
        SurveyStore.flushPending();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        open: open,
        _buildLauncher: buildLauncher,
        _buildModal: buildModal,
        _refreshLauncher: refreshLauncher,
        _el: el,
        _state: state,
        _stepTitles: STEP_TITLES,
        _close: close_
    };
})();
