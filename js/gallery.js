// 风采展示轮播组件

const galleryData = {
    "open": {
        label: "公开赛",
        photos: [
            {src: "images/gallery/open/nb-debate-open/1.jpg", alt: "外研社英语辩论公开赛·宁波站", activity: "外研社英语辩论公开赛"}
        ]
    },
    "2023": {
        label: "2023年",
        photos: [
            {src: "images/gallery/2023/national-competition/1.jpg", alt: "2023全国大学生英语竞赛·银川", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2023/national-competition/2.jpg", alt: "2023全国大学生英语竞赛·银川", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2023/national-competition/3.png", alt: "2023全国大学生英语竞赛·银川", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2023/speech-contest/1.png", alt: "2023外研社国才杯演讲比赛", activity: "外研社国才杯演讲比赛"}
        ]
    },
    "2024": {
        label: "2024年",
        photos: [
            {src: "images/gallery/2024/national-competition/1.jpg", alt: "2024全国大学生英语竞赛·桂林", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2024/national-competition/2.jpg", alt: "2024全国大学生英语竞赛·桂林", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2024/national-competition/3.png", alt: "2024全国大学生英语竞赛·桂林", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2024/national-competition/4.png", alt: "2024全国大学生英语竞赛·桂林", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2024/national-competition/5.png", alt: "2024全国大学生英语竞赛·桂林", activity: "全国大学生英语竞赛"}
        ]
    },
    "2025": {
        label: "2025年",
        photos: [
            {src: "images/gallery/2025/national-competition/1.jpg", alt: "2025全国大学生英语竞赛·郑州", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2025/national-competition/2.jpg", alt: "2025全国大学生英语竞赛·郑州", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2025/national-competition/3.jpg", alt: "2025全国大学生英语竞赛·郑州", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2025/national-competition/4.jpg", alt: "2025全国大学生英语竞赛·郑州", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2025/national-competition/5.jpg", alt: "2025全国大学生英语竞赛·郑州", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2025/national-competition/6.jpg", alt: "2025全国大学生英语竞赛·郑州", activity: "全国大学生英语竞赛"}
        ]
    },
    "2026": {
        label: "2026年",
        photos: [
            {src: "images/gallery/2026/national-competition/1.jpg", alt: "2026全国大学生英语竞赛·合肥", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2026/national-competition/2.jpg", alt: "2026全国大学生英语竞赛·合肥", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2026/national-competition/3.jpg", alt: "2026全国大学生英语竞赛·合肥", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2026/national-competition/4.jpg", alt: "2026全国大学生英语竞赛·合肥", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2026/national-competition/5.jpg", alt: "2026全国大学生英语竞赛·合肥", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2026/national-competition/6.jpg", alt: "2026全国大学生英语竞赛·合肥", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2026/national-competition/7.jpg", alt: "2026全国大学生英语竞赛·合肥", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2026/national-competition/8.jpg", alt: "2026全国大学生英语竞赛·合肥", activity: "全国大学生英语竞赛"},
            {src: "images/gallery/2026/national-competition/9.jpg", alt: "2026全国大学生英语竞赛·合肥", activity: "全国大学生英语竞赛"}
        ]
    }
};

class GalleryCarousel {
    constructor() {
        this.currentYear = "open"; // 默认显示含金量最高的公开赛
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.isHovering = false;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;

        this.init();
    }

    init() {
        this.renderCarousel();
        this.attachEventListeners();
        this.startAutoPlay();
    }

    renderCarousel() {
        const track = document.querySelector('.carousel-track');
        const indicators = document.querySelector('.carousel-indicators');

        if (!track || !indicators) return;

        // 清空现有内容
        track.innerHTML = '';
        indicators.innerHTML = '';

        // 获取当前年份的照片
        const photos = galleryData[this.currentYear].photos;

        // 渲染图片
        photos.forEach((photo, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `
                <img src="${photo.src}" alt="${photo.alt}" draggable="false">
                <div class="carousel-caption">${photo.activity}</div>
            `;
            track.appendChild(slide);

            // 渲染指示器
            const indicator = document.createElement('div');
            indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
            indicator.addEventListener('click', () => this.goToSlide(index));
            indicators.appendChild(indicator);
        });

        // 重置索引
        this.currentIndex = 0;
        this.updateCarousel();
    }

    updateCarousel() {
        const track = document.querySelector('.carousel-track');
        const indicators = document.querySelectorAll('.carousel-indicator');

        if (!track) return;

        // 移动轮播
        track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

        // 更新指示器
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }

    nextSlide() {
        const photos = galleryData[this.currentYear].photos;
        this.currentIndex = (this.currentIndex + 1) % photos.length;
        this.updateCarousel();
    }

    prevSlide() {
        const photos = galleryData[this.currentYear].photos;
        this.currentIndex = (this.currentIndex - 1 + photos.length) % photos.length;
        this.updateCarousel();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
        this.resetAutoPlay();
    }

    switchYear(year) {
        if (this.currentYear === year) return;

        this.currentYear = year;
        this.renderCarousel();
        this.resetAutoPlay();

        // 更新年份标签状态
        document.querySelectorAll('.year-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.year === year);
        });
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            if (!this.isHovering && !this.isDragging) {
                this.nextSlide();
            }
        }, 7000); // 7秒自动切换
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }

    attachEventListeners() {
        // 箭头按钮
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');

        if (prevBtn) prevBtn.addEventListener('click', () => {
            this.prevSlide();
            this.resetAutoPlay();
        });

        if (nextBtn) nextBtn.addEventListener('click', () => {
            this.nextSlide();
            this.resetAutoPlay();
        });

        // 年份标签
        document.querySelectorAll('.year-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchYear(tab.dataset.year);
            });
        });

        // 悬停暂停
        const carouselContainer = document.querySelector('.carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => {
                this.isHovering = true;
            });

            carouselContainer.addEventListener('mouseleave', () => {
                this.isHovering = false;
            });

            // 鼠标拖拽
            carouselContainer.addEventListener('mousedown', (e) => this.handleDragStart(e));
            carouselContainer.addEventListener('mousemove', (e) => this.handleDragMove(e));
            carouselContainer.addEventListener('mouseup', (e) => this.handleDragEnd(e));
            carouselContainer.addEventListener('mouseleave', (e) => this.handleDragEnd(e));
        }
    }

    handleDragStart(e) {
        this.isDragging = true;
        this.startX = e.pageX;
        this.currentX = e.pageX;
    }

    handleDragMove(e) {
        if (!this.isDragging) return;
        this.currentX = e.pageX;
    }

    handleDragEnd(e) {
        if (!this.isDragging) return;

        this.isDragging = false;
        const diff = this.startX - this.currentX;

        // 拖拽距离大于50px才切换
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
            this.resetAutoPlay();
        }
    }
}

// 页面加载完成后初始化轮播
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.showcase-gallery')) {
        new GalleryCarousel();
    }
});
