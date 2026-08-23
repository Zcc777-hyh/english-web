# 网站全面升级实施计划

## 项目概述
对"AI英语学习平台"进行三大模块的全面升级：
1. **需求一**：统一 resources/news/about 三个页面的卡片组件样式（毛玻璃+悬浮动效）
2. **需求二**：修复所有页面页脚的"快速链接"（补充缺失的"赛事资讯"链接）
3. **需求三**：首页新增"风采展示"图片轮播组件（按年份+活动分类的相册轮播）

## 背景调研结论

### 1. 现有页面结构
- **首页 (index.html)**：已有毛玻璃效果（`.branch-card`, `.feature-card`, `.step-item-h`），使用 `home.css`
- **文化专栏 (culture.html)**：使用 `culture.css`，卡片由JS动态生成（`.topic-card`）
- **学习资源 (resources.html)**：只用 `style.css`，所有卡片都是 inline style，无CSS类
- **赛事资讯 (news.html)**：只用 `style.css`，所有卡片都是 inline style，无CSS类
- **关于我们 (about.html)**：只用 `style.css`，所有卡片都是 inline style，无CSS类

### 2. 首页毛玻璃样式参考（标准）
```css
background: rgba(255, 255, 255, 0.15-0.25);
backdrop-filter: blur(18px-25px);
border: 1px solid rgba(255, 255, 255, 0.25-0.3);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2-0.3);
transition: all 0.3s-0.4s cubic-bezier(0.4, 0, 0.2, 1);

hover状态:
transform: translateY(-12px to -20px) [可选scale(1.02-1.03)];
box-shadow: 0 16px 56px rgba(0, 0, 0, 0.3-0.35);
background: rgba(255, 255, 255, 0.2-0.22);
```

### 3. 页脚快速链接现状
| 页面 | 缺失/错误 |
|---|---|
| index.html | "赛事资讯"链接指向错误（href="about.html" 应改为 "news.html"） |
| culture.html | 缺少"赛事资讯"链接 |
| resources.html | 缺少"赛事资讯"链接 |
| news.html | ✅ 完整正确 |
| about.html | 缺少"赛事资讯"链接 |

### 4. 照片素材整理结果
已将所有照片复制并重命名到 `web/images/gallery/` 目录：
- **2023年**：全国大学生英语竞赛（3张）+ 演讲比赛校赛（1张，来自2022文件夹）
- **2024年**：全国大学生英语竞赛（5张）
- **2025年**：全国大学生英语竞赛（6张）
- **2026年**：全国大学生英语竞赛（9张）
- **公开赛**：外研社英语辩论公开赛·宁波站（1张）

## 实施方案

---

## 需求一：统一卡片组件样式

### 方案：创建通用毛玻璃CSS类 + 替换inline style

**1. 新建 `common-cards.css` 文件**
定义以下通用卡片类（参考首页毛玻璃效果）：
- `.glass-card` - 基础毛玻璃卡片
- `.glass-card-hover` - 带悬浮动效的毛玻璃卡片
- `.glass-card-accent-left` - 左侧带彩色边框的卡片（用于resources/news页）
- `.glass-card-gradient` - 渐变背景卡片（用于特殊提示区块）

**2. 修改三个页面的HTML**
- **resources.html**：
  - 第60/69/79行：演讲技巧卡片 → `.glass-card-accent-left accent-red`
  - 第95/105/115行：辩论技巧卡片 → `.glass-card-accent-left accent-blue`
  - 第130行：词汇库卡片 → `.glass-card`
  - 第176行：学习建议区块 → `.glass-card-gradient`

- **news.html**：
  - 第61/79/97行：近期赛事卡片 → `.glass-card-accent-left` + 不同accent颜色
  - 第122/133/144行：往期精彩卡片 → `.glass-card-hover`
  - 第161行：报名须知区块 → `.glass-card-gradient`

- **about.html**：
  - 第97/102/107行：项目特色卡片 → `.glass-card-hover`
  - 第68行：核心功能容器 → `.glass-card`
  - 第117行：联系我们区块 → 保持红色渐变背景，但加上 `.glass-card-contact` 类统一圆角/阴影

**3. 引入CSS文件**
在 resources.html, news.html, about.html 的 `<head>` 中，在 `style.css` 之后引入：
```html
<link rel="stylesheet" href="css/common-cards.css">
```

---

## 需求二：修复页脚快速链接

### 方案：统一所有页面的页脚HTML

**标准快速链接列表**（参考news.html的正确版本）：
```html
<ul>
    <li><a href="culture.html">文化专栏</a></li>
    <li><a href="resources.html">学习资源</a></li>
    <li><a href="news.html">赛事资讯</a></li>
    <li><a href="about.html">关于我们</a></li>
</ul>
```

**修改清单**：
1. **index.html 第187行**：`<li><a href="about.html">赛事资讯</a></li>` 改为 `<li><a href="news.html">赛事资讯</a></li>`
2. **culture.html 第103-108行**：在 `resources.html` 和 `关于我们` 之间插入 `<li><a href="news.html">赛事资讯</a></li>`
3. **resources.html 第200-204行**：在 `resources.html` 和 `关于我们` 之间插入 `<li><a href="news.html">赛事资讯</a></li>`
4. **about.html 第143-148行**：在 `resources.html` 和 `关于我们` 之间插入 `<li><a href="news.html">赛事资讯</a></li>`

---

## 需求三：首页新增"风采展示"轮播组件

### 插入位置
在 **index.html 第95行**（`</section>` hero-new结束）之后、第98行（`<section class="features">` 平台介绍开始）之前，插入新的 `<section class="showcase-gallery">`。

### 轮播组件功能设计

**1. HTML结构**
```html
<section class="showcase-gallery">
    <div class="container">
        <div class="section-header">
            <h2>风采展示</h2>
            <p>历年活动精彩瞬间</p>
        </div>
        
        <!-- 年份标签 -->
        <div class="year-tabs">
            <button class="year-tab active" data-year="2023">2023年</button>
            <button class="year-tab" data-year="2024">2024年</button>
            <button class="year-tab" data-year="2025">2025年</button>
            <button class="year-tab" data-year="2026">2026年</button>
            <button class="year-tab" data-year="open">公开赛</button>
        </div>
        
        <!-- 轮播容器 -->
        <div class="carousel-wrapper">
            <button class="carousel-btn carousel-prev">←</button>
            <div class="carousel-container">
                <div class="carousel-track">
                    <!-- 图片由JS动态插入 -->
                </div>
            </div>
            <button class="carousel-btn carousel-next">→</button>
        </div>
        
        <!-- 指示器 -->
        <div class="carousel-indicators"></div>
    </div>
</section>
```

**2. CSS样式（写入 `home.css`）**
- `.showcase-gallery` - 区块容器（padding, 背景）
- `.year-tabs` - 年份标签横向排列，选中态高亮（中国红填充/金色描边）
- `.carousel-wrapper` - 轮播外层，flex布局包含左右箭头
- `.carousel-container` - 轮播可视区域，overflow: hidden
- `.carousel-track` - 图片轨道，transform: translateX() 切换
- `.carousel-btn` - 圆形毛玻璃按钮，hover浮起
- `.carousel-indicators` - 底部小圆点指示器

**3. JavaScript逻辑（新建 `js/gallery.js`）**

**数据结构**：
```javascript
const galleryData = {
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
      // ... 5张
    ]
  },
  "2025": { label: "2025年", photos: [...] },  // 6张
  "2026": { label: "2026年", photos: [...] },  // 9张
  "open": {
    label: "公开赛",
    photos: [
      {src: "images/gallery/open/nb-debate-open/1.jpg", alt: "外研社英语辩论公开赛·宁波站", activity: "外研社英语辩论公开赛"}
    ]
  }
};
```

**核心功能**：
- 页面加载时随机选择一个年份展示（`Math.random()`）
- 点击年份标签切换年份，轮播从该年份第一张开始
- 左右箭头点击切换图片（`currentIndex++` / `--`，循环处理边界）
- 鼠标拖拽滑动切换（监听 `mousedown` / `mousemove` / `mouseup`，计算拖拽距离）
- 自动播放：默认每7秒切换，鼠标悬停在轮播区域时暂停（`clearInterval` / `setInterval`）
- 切换动画：`transition: transform 0.5s ease-in-out`
- 小圆点指示器：当前图片高亮，点击跳转到对应图片

**4. 在 index.html 引入JS**
在 `<script src="js/main.js"></script>` 之后添加：
```html
<script src="js/gallery.js"></script>
```

---

## 实施步骤（按顺序）

### 第一步：修复页脚（最简单，先完成）
1. 修改 index.html 第187行
2. 修改 culture.html、resources.html、about.html 的页脚快速链接

### 第二步：统一卡片样式
1. 创建 `css/common-cards.css`
2. 修改 resources.html 替换所有inline style为CSS类
3. 修改 news.html 替换所有inline style为CSS类
4. 修改 about.html 替换所有inline style为CSS类
5. 在三个HTML文件中引入 `common-cards.css`

### 第三步：新增轮播组件
1. 在 `css/home.css` 末尾添加轮播组件CSS
2. 创建 `js/gallery.js` 实现轮播逻辑
3. 在 index.html 第95-98行之间插入轮播HTML结构
4. 在 index.html 引入 `gallery.js`
5. 测试轮播功能（拖拽、点击、自动播放、年份切换）

---

## 预期效果

### 需求一效果
- resources/news/about 三个页面的所有卡片拥有和首页一样的毛玻璃质感
- 鼠标悬停时卡片向上浮动6-8px，阴影加深
- 视觉风格统一，高级感提升

### 需求二效果
- 所有5个页面的页脚"快速链接"都包含完整的4个链接（文化专栏、学习资源、赛事资讯、关于我们）
- 链接目标正确，点击跳转无误

### 需求三效果
- 首页出现新的"风采展示"区块，位于"三个分支"和"平台介绍"之间
- 默认随机显示一个年份的照片
- 用户可点击年份标签切换照片组
- 轮播支持左右箭头点击、鼠标拖拽、自动播放（悬停暂停）
- 底部小圆点指示当前位置，可点击跳转
- 组件样式符合首页毛玻璃风格，美观大气

---

## 风险与注意事项

1. **CSS优先级冲突**：新的 `common-cards.css` 需要在 `style.css` 之后引入，确保能覆盖原有的默认样式
2. **轮播拖拽兼容性**：鼠标拖拽需要处理边界情况（拖拽距离过小不切换、循环边界）
3. **图片加载性能**：25张图片全部加载可能较慢，可考虑懒加载（首次只加载当前年份）
4. **移动端适配**：轮播组件需要响应式设计，小屏幕下调整图片大小和按钮位置

---

## 待用户确认的问题

1. **轮播图片尺寸**：固定高度（如500px）等比缩放宽度，还是固定宽高（会裁剪）？
2. **自动播放间隔**：7-8秒合适吗？还是更短/更长？
3. **年份标签颜色**：选中态用中国红填充+白字，还是金色描边+红字？
4. **首次显示**：真的要随机年份，还是默认显示2026年（最新）？

以上问题将在实施时根据实际效果调整，或询问用户偏好。
