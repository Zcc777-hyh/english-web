// 主题数据（前10个作为示例）
const topics = [
    {
        id: 1,
        titleEN: 'When Socrates Meets Confucius',
        titleCN: '当苏格拉底遇见孔子',
        category: 'philosophy',
        categoryName: '哲学思想',
        difficulty: 'intermediate',
        difficultyLabel: '★★☆',
        emoji: '📚',
        background: 'linear-gradient(135deg, #FFF5F5, #FFE5E9)',
        description: 'This fascinating topic explores the philosophical dialogue between Eastern and Western thought through the lens of two great thinkers: Socrates and Confucius.'
    },
    {
        id: 2,
        titleEN: 'Huizi and Zhuangzi',
        titleCN: '惠子与庄子',
        category: 'philosophy',
        categoryName: '哲学思想',
        difficulty: 'advanced',
        difficultyLabel: '★★★',
        emoji: '📚',
        background: 'linear-gradient(135deg, #FFF5F5, #FFE5E9)',
        description: 'The friendship and philosophical debates between Huizi and Zhuangzi represent one of the most fascinating intellectual relationships in ancient Chinese philosophy.'
    },
    {
        id: 3,
        titleEN: 'My Big Story in 2049',
        titleCN: '我在2049年的故事',
        category: 'modern',
        categoryName: '现代传承',
        difficulty: 'beginner',
        difficultyLabel: '★☆☆',
        emoji: '🌟',
        background: 'linear-gradient(135deg, #F0F8FF, #E6F3FF)',
        description: 'Imagine yourself in 2049, the centenary of the founding of the PRC. What story will you tell about your life and contributions?'
    },
    {
        id: 4,
        titleEN: 'The Charm of Chinese Calligraphy',
        titleCN: '中国书法之美',
        category: 'arts',
        categoryName: '传统艺术',
        difficulty: 'intermediate',
        difficultyLabel: '★★☆',
        emoji: '🎨',
        background: 'linear-gradient(135deg, #FFF0F5, #FFE4E1)',
        description: 'Chinese calligraphy is more than just writing - it is an art form that embodies Chinese culture, philosophy, and aesthetic principles.'
    },
    {
        id: 5,
        titleEN: 'Dujiangyan: Ancient Engineering Marvel',
        titleCN: '都江堰：古代工程奇迹',
        category: 'architecture',
        categoryName: '建筑工程',
        difficulty: 'intermediate',
        difficultyLabel: '★★☆',
        emoji: '🏯',
        background: 'linear-gradient(135deg, #FFFAF0, #FFF8DC)',
        description: 'Built over 2,000 years ago, the Dujiangyan irrigation system demonstrates the wisdom and ingenuity of ancient Chinese water management.'
    },
    {
        id: 6,
        titleEN: 'The Beauty of 24 Solar Terms',
        titleCN: '二十四节气之美',
        category: 'festivals',
        categoryName: '节日民俗',
        difficulty: 'beginner',
        difficultyLabel: '★☆☆',
        emoji: '🏮',
        background: 'linear-gradient(135deg, #FFF5E6, #FFE5CC)',
        description: 'The 24 Solar Terms represent ancient Chinese wisdom about nature, agriculture, and the harmony between humans and the environment.'
    },
    {
        id: 7,
        titleEN: 'The Chinese Dragon Is Good',
        titleCN: '中国龙是善良的',
        category: 'symbols',
        categoryName: '文化符号',
        difficulty: 'beginner',
        difficultyLabel: '★☆☆',
        emoji: '🐉',
        background: 'linear-gradient(135deg, #FFE5E5, #FFD6D6)',
        description: 'Unlike Western dragons, the Chinese dragon symbolizes power, wisdom, and good fortune, representing an entirely different cultural perspective.'
    },
    {
        id: 8,
        titleEN: 'Traditional Chinese Medicine',
        titleCN: '中医文化',
        category: 'heritage',
        categoryName: '非遗传承',
        difficulty: 'advanced',
        difficultyLabel: '★★★',
        emoji: '🎭',
        background: 'linear-gradient(135deg, #F5F0FF, #E8DAFF)',
        description: 'Traditional Chinese Medicine offers a holistic approach to health that has been refined over thousands of years.'
    },
    {
        id: 9,
        titleEN: 'The Philosophy Behind Tai Chi',
        titleCN: '太极背后的哲学',
        category: 'symbols',
        categoryName: '文化符号',
        difficulty: 'intermediate',
        difficultyLabel: '★★☆',
        emoji: '☯️',
        background: 'linear-gradient(135deg, #F0FFF0, #E0FFE0)',
        description: 'Tai Chi embodies the principles of yin and yang, balance, and harmony that are central to Chinese philosophy.'
    },
    {
        id: 10,
        titleEN: 'How Hanfu Reflects Cultural Confidence',
        titleCN: '汉服与文化自信',
        category: 'heritage',
        categoryName: '非遗传承',
        difficulty: 'beginner',
        difficultyLabel: '★☆☆',
        emoji: '👘',
        background: 'linear-gradient(135deg, #FFF0F8, #FFE0F0)',
        description: 'The revival of Hanfu among young Chinese people represents a growing sense of cultural identity and confidence.'
    }
];

// 渲染主题卡片
function renderTopics(filteredTopics) {
    const grid = document.getElementById('topicsGrid');
    const resultCount = document.getElementById('resultCount');

    resultCount.textContent = filteredTopics.length;

    if (filteredTopics.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #6B7280; padding: 60px 0;">没有找到相关主题</p>';
        return;
    }

    grid.innerHTML = filteredTopics.map(topic => `
        <div class="topic-card" onclick="navigateToSpeechQRCode()">
            <div class="topic-card-header" style="background: ${topic.background}">
                <span class="topic-emoji">${topic.emoji}</span>
                <div class="topic-tags">
                    <span class="topic-category ${topic.category}">${topic.categoryName}</span>
                    <span class="topic-difficulty">${topic.difficultyLabel}</span>
                </div>
            </div>
            <div class="topic-card-body">
                <h3 class="topic-title">${topic.titleEN}</h3>
                <p class="topic-title-cn">${topic.titleCN}</p>
                <p class="topic-description">${topic.description}</p>
                <div class="topic-footer">
                    <span class="topic-action">查看详情 →</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 筛选逻辑
function filterTopics() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const difficultyFilter = document.getElementById('difficultyFilter').value;

    let filtered = topics.filter(topic => {
        const matchesSearch = !searchQuery ||
            topic.titleEN.toLowerCase().includes(searchQuery) ||
            topic.titleCN.includes(searchQuery) ||
            topic.description.toLowerCase().includes(searchQuery);

        const matchesCategory = categoryFilter === 'all' || topic.category === categoryFilter;
        const matchesDifficulty = difficultyFilter === 'all' || topic.difficulty === difficultyFilter;

        return matchesSearch && matchesCategory && matchesDifficulty;
    });

    renderTopics(filtered);
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始渲染所有主题
    renderTopics(topics);

    // 绑定筛选事件
    document.getElementById('searchInput').addEventListener('input', filterTopics);
    document.getElementById('categoryFilter').addEventListener('change', filterTopics);
    document.getElementById('difficultyFilter').addEventListener('change', filterTopics);
});
