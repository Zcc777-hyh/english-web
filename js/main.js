// 移动端菜单切换
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'block';
    }
}

// 点击页面其他地方关闭移动端菜单
document.addEventListener('click', function(event) {
    const menu = document.getElementById('mobileMenu');
    const menuBtn = document.querySelector('.mobile-menu-btn');

    if (menu && menuBtn && !menu.contains(event.target) && !menuBtn.contains(event.target)) {
        menu.style.display = 'none';
    }
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Toast 消息提示
function showToast(message, duration = 2500) {
    // 创建 toast 元素
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 显示动画
    setTimeout(() => toast.classList.add('show'), 10);

    // 自动消失
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// 跳转到演讲平台二维码
function navigateToSpeechQRCode() {
    // 存储标记到 sessionStorage
    sessionStorage.setItem('showSpeechToast', 'true');
    window.location.href = 'index.html#speech-platform';
}

// 跳转到辩论平台二维码
function navigateToDebateQRCode() {
    // 存储标记到 sessionStorage
    sessionStorage.setItem('showDebateToast', 'true');
    window.location.href = 'index.html#debate-platform';
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI英语学习平台已加载');

    // 检查是否需要显示 Toast
    if (sessionStorage.getItem('showSpeechToast') === 'true') {
        sessionStorage.removeItem('showSpeechToast');
        setTimeout(() => {
            showToast('📱 打开微信小程序，精彩内容等你体验');
        }, 500);
    }

    if (sessionStorage.getItem('showDebateToast') === 'true') {
        sessionStorage.removeItem('showDebateToast');
        setTimeout(() => {
            showToast('📱 打开微信小程序，精彩内容等你体验');
        }, 500);
    }

    // 添加滚动效果
    let lastScroll = 0;
    const header = document.querySelector('.header');

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > lastScroll && currentScroll > 100) {
            // 向下滚动
            header.style.transform = 'translateY(-100%)';
        } else {
            // 向上滚动
            header.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });
});
