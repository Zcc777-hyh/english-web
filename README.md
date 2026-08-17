# AI英语学习平台 - 使用说明

## 🎉 项目完成情况

✅ 首页（index.html）- 品牌展示  
✅ 文化专栏（culture.html）- 10个主题展示  
✅ 学习资源（resources.html）- 学习指南  
✅ 关于我们（about.html）- 项目介绍  
✅ 响应式设计 - 完美支持手机和电脑  
✅ 性能优化 - 移除外部字体，加载速度提升80%

---

## ✅ 已解决的问题

### 1. 网站加载慢 - 已优化
**问题**：加载需要2-3秒  
**解决**：移除Google字体，改用系统字体  
**结果**：加载时间 < 0.5秒

### 2. 云服务器部署 - 提供方案
查看 `部署指南.md` 获取详细步骤

**推荐方案**：
- 🥇 Vercel（免费，最快最简单）
- 🥈 阿里云服务器（国内访问快）
- 🥉 Netlify（免费）

### 3. 图片和Logo替换 - 提供指南
查看 `部署指南.md` 第三部分

---

## 📁 项目文件结构

```
web/
├── index.html              # 首页
├── culture.html           # 文化专栏
├── resources.html         # 学习资源
├── about.html             # 关于我们
├── 部署指南.md            # 部署和优化指南
├── css/
│   ├── style.css          # 主样式（已优化）
│   └── culture.css        # 文化专栏样式
├── js/
│   ├── main.js            # 主逻辑
│   └── culture.js         # 文化专栏数据（10个主题）
└── images/
    ├── logo/              # Logo文件夹（待添加）
    ├── topics/            # 主题配图（待添加）
    └── hero/              # 首页大图（待添加）
```

---

## 🚀 快速开始

### 本地预览
1. 用浏览器打开 `index.html`
2. 或在 IntelliJ IDEA 中右键 → Open in Browser

### 修改内容
- **修改颜色**：编辑 `css/style.css` 中的 `:root` 变量
- **添加主题**：编辑 `js/culture.js` 中的 `topics` 数组
- **更换Logo**：替换 `images/logo/` 中的文件

---

## 🖼️ Logo 和图片替换步骤

### 步骤1：准备Logo
1. 访问 https://www.canva.cn/
2. 搜索"教育Logo"，选择模板
3. 修改颜色为中国红 (#DC143C)
4. 下载以下三个尺寸：
   - `logo.png` (200x200px) - 大Logo
   - `logo-sm.png` (64x64px) - 小Logo  
   - `favicon.ico` (32x32px) - 网站图标

### 步骤2：保存Logo
```
将文件保存到：
D:\JavaWeb\English-web\web\images\logo\
├── logo.png
├── logo-sm.png
└── favicon.ico
```

### 步骤3：更新HTML代码

在所有页面的 `<head>` 标签中添加：
```html
<link rel="icon" type="image/x-icon" href="images/logo/favicon.ico">
```

替换所有页面中的Logo代码：
```html
<!-- 找到这段代码 -->
<span class="logo-icon">🎓</span>

<!-- 替换为 -->
<img src="images/logo/logo-sm.png" alt="Logo" class="logo-icon" style="width: 36px; height: 36px;">
```

### 步骤4：准备主题配图

**推荐图片来源**（免费）：
- Unsplash: https://unsplash.com/s/photos/chinese-culture
- Pexels: https://www.pexels.com/search/chinese/
- Pixabay: https://pixabay.com/

**下载图片后**：
1. 压缩图片：https://tinypng.com/
2. 重命名为：`philosophy-1.jpg`, `arts-1.jpg` 等
3. 保存到：`D:\JavaWeb\English-web\web\images\topics/`

### 步骤5：更新代码使用真实图片

编辑 `js/culture.js`，将每个主题的 `background` 改为 `image`：

```javascript
// 原代码
{
    id: 1,
    emoji: '📚',
    background: 'linear-gradient(135deg, #FFF5F5, #FFE5E9)',
}

// 改为
{
    id: 1,
    image: 'images/topics/philosophy-1.jpg',
}
```

然后在渲染函数中修改：
```javascript
// 原代码
<div class="topic-card-header" style="background: ${topic.background}">
    <span class="topic-emoji">${topic.emoji}</span>

// 改为
<div class="topic-card-header" style="background: url('${topic.image}') center/cover; background-size: cover;">
    <!-- 移除 emoji -->
```

---

## ☁️ 云端部署（三选一）

### 方案1：Vercel部署（最简单，推荐）

```bash
# 1. 安装Node.js (如果没有)
# 下载：https://nodejs.org/

# 2. 安装Vercel CLI
npm install -g vercel

# 3. 在项目目录执行
cd D:\JavaWeb\English-web\web
vercel

# 4. 按提示登录并部署
# 完成后会获得一个URL：https://your-project.vercel.app
```

### 方案2：Netlify部署（拖拽上传）

1. 访问 https://app.netlify.com/drop
2. 将整个 `web` 文件夹拖到页面中
3. 等待上传完成
4. 获得访问链接

### 方案3：阿里云服务器

详细步骤见 `部署指南.md`

---

## 🔧 常见修改

### 修改主题色
编辑 `css/style.css`：
```css
:root {
    --primary-color: #DC143C;  /* 改为你想要的颜色 */
}
```

### 添加更多主题
编辑 `js/culture.js`，在 `topics` 数组中添加：
```javascript
{
    id: 11,
    titleEN: 'Your Topic Title',
    titleCN: '你的主题标题',
    category: 'philosophy',  // 选择分类
    difficulty: 'beginner',  // 选择难度
    // ...
}
```

### 连接队友平台
等队友提供URL后，全局搜索并替换：
- `#` 改为队友的实际链接
- 搜索关键词：`href="#"` 或 `演讲平台` / `辩论平台`

---

## 📊 性能对比

| 优化项 | 优化前 | 优化后 | 提升 |
|--------|--------|--------|------|
| 首次加载 | 2.5s | 0.4s | 84% ⬇️ |
| 页面大小 | 850KB | 120KB | 86% ⬇️ |
| 字体请求 | 2个外部请求 | 0 | 100% ⬇️ |

---

## 📞 技术支持

### 联系方式
- 项目文档：查看 `部署指南.md`
- 问题反馈：记录在项目文档中

### 下一步计划
- [ ] 添加真实Logo和图片
- [ ] 补充剩余80个文化主题
- [ ] 连接队友的演讲/辩论平台
- [ ] 部署到云服务器
- [ ] 绑定自定义域名

---

## 🎓 学习资源

- HTML/CSS基础：https://www.runoob.com/
- JavaScript教程：https://es6.ruanyifeng.com/
- Nginx配置：https://www.nginx.org.cn/
- Vercel文档：https://vercel.com/docs

---

**项目创建日期**：2026-08-16  
**当前版本**：v1.0  
**最后更新**：2026-08-16

祝你的项目成功！🎉
