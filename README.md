# AI英语学习推广网站

> 讲好中国故事，用世界语言传播中华文明

## 🌟 项目介绍

这是一个专注于推广AI英语学习的宣传网站，特色是融合了**90个中国文化主题**，帮助学习者提升英语演讲和辩论能力的同时，传播中华文化。

### 项目分工
- **本网站（你负责）**：推广宣传、文化展示、学习资源
- **演讲平台（队友负责）**：AI智能演讲训练和评分
- **辩论平台（队友负责）**：AI辩论对战和点评

---

## 🚀 快速开始

1. 直接打开浏览器访问：
aidb.net.cn
---

## 📦 部署到Vercel

### 方式1：通过GitHub（推荐）

1. **创建GitHub仓库**
   ```bash
   # 在GitHub上创建新仓库：ai-english-learning-web
   
   # 推送代码
   git remote add origin https://github.com/你的用户名/ai-english-learning-web.git
   git branch -M main
   git push -u origin main
   ```

2. **部署到Vercel**
   - 访问 https://vercel.com
   - 使用GitHub登录
   - 点击 "Import Project"
   - 选择你的仓库
   - 点击 "Deploy"
   - 完成！✅

3. **获取访问地址**
   ```
   https://你的项目名.vercel.app
   ```

### 方式2：通过Vercel CLI

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
cd D:/JavaWeb/English-web/web
vercel --prod
```

📖 **详细教程**：查看 [Vercel部署完整指南.md](./Vercel部署完整指南.md)

---

## 🎯 网站功能

### ✅ 已完成功能

1. **首页**
   - Hero区域（背景图片 + 标题）
   - 树状结构导航（三个平台入口）
   - 平台介绍
   - 使用流程

2. **中国文化专栏** ⭐ 核心特色
   - 90个演讲主题（基于文档《中国文化演讲题目(1).docx》）
   - 7大分类：
     - 哲学思想（12题）
     - 传统艺术（15题）
     - 建筑工程（8题）
     - 节日民俗（10题）
     - 文化符号（12题）
     - 非遗传承（18题）
     - 现代传承（15题）

3. **学习资源中心**
   - 演讲技巧指南
   - 辩论技巧指南
   - 核心词汇库

4. **赛事资讯**
   - 演讲比赛信息
   - 辩论赛事预告

5. **关于我们**
   - 项目介绍
   - 核心功能
   - 联系方式

### 🔗 外部链接（需要队友提供）

- 演讲平台URL（Header导航 + 首页树状图）
- 辩论平台URL（Header导航 + 首页树状图）
- 用户登录URL（Header "登录/注册" 按钮）


**开发周期**：4-5周

📖 **详细规划**：查看 [微信小程序开发规划.md](./微信小程序开发规划.md)

### 快速启动

```bash
# 方法1：使用HBuilderX（推荐新手）
# 下载：https://www.dcloud.io/hbuilderx.html
# 创建 → uni-app项目

# 方法2：使用Vue CLI
npm install -g @vue/cli
npx degit dcloudio/uni-preset-vue#vite ai-english-miniprogram
cd ai-english-miniprogram
npm install
npm run dev:mp-weixin
```

---

## 🛠️ 技术栈

### 当前网站（纯HTML版本）
- HTML5
- CSS3（响应式布局）
- JavaScript（原生）
- 部署：Vercel

### 未来小程序版本
- uni-app (Vue 3)
- uView UI 2.0
- 微信小程序API

---

## 📂 项目结构

```
web/
├── index.html              # 首页
├── culture.html            # 文化专栏
├── resources.html          # 学习资源
├── news.html              # 赛事资讯
├── about.html             # 关于我们
│
├── css/
│   ├── style.css          # 全局样式
│   └── home.css           # 首页专用样式
│
├── images/
│   └── background/
│       └── 首页背景.png    # 首页背景图
│
├── js/
│   └── script.js          # 全局脚本
│
├── documents/
│   └── 中国文化演讲题目(1).docx  # 90个主题来源
│
├── vercel.json            # Vercel配置
├── .gitignore             # Git忽略文件
│
├── Vercel部署完整指南.md   # 部署教程
├── 微信小程序开发规划.md    # 小程序规划
└── README.md              # 本文件
```

---

## 🎨 设计特色

### 视觉风格
- **中国元素**：中国红(#DC143C)、金色(#FFD700)
- **现代简洁**：响应式设计、流畅动画
- **文化融合**：传统与现代结合

### 核心配色
```css
--primary-color: #DC143C;    /* 中国红 */
--secondary-color: #4169E1;  /* 宝石蓝 */
--accent-color: #FFD700;     /* 金色 */
--text-color: #2C3E50;       /* 墨色 */
```

---

## 🔗 与队友平台对接

### 当前方案：简单跳转

网站通过链接按钮跳转到队友的云平台：

```html
<!-- 演讲平台 -->
<a href="https://speech.example.com">🎤 演讲平台</a>

<!-- 辩论平台 -->
<a href="https://debate.example.com">🗣️ 辩论平台</a>

<!-- 登录页面 -->
<a href="https://login.example.com">登录/注册</a>
```

### 可选方案：URL参数传递

如果队友平台支持，可以传递主题参数：

```html
<a href="https://speech.example.com?topic=confucius">
  练习此主题
</a>
```

### 需要队友提供

1. **平台URL**
   - 演讲平台：`https://???`
   - 辩论平台：`https://???`
   - 用户登录：`https://???`

2. **可选：API接口**（小程序需要）
   - 用户认证API
   - 获取练习记录API
   - 提交分享数据API

---

## 📊 90个文化主题分类

### 1. 哲学思想 (12题)
- When Socrates Meets Confucius
- The Unity of Knowledge and Action
- Benevolence (Ren): a timeless Chinese virtue
- ...

### 2. 传统艺术 (15题)
- The charm of Chinese calligraphy in a digital age
- Chinese embroidery: beauty passed through generations
- The cultural spirit of Chinese landscape painting
- ...

### 3. 建筑与工程 (8题)
- Dujiangyan
- The spirit of the Great Wall beyond military defense
- Tulou: a treasure of Chinese communal wisdom
- ...

### 4. 节日与民俗 (10题)
- The beauty of Chinese seasonal culture and the 24 Solar Terms
- The meaning of reunion in Chinese culture
- Chinese lanterns: light, hope and cultural memory
- ...

### 5. 文化符号 (12题)
- The Chinese Dragon Is Good
- Chopsticks: small objects carrying great Chinese values
- The philosophy behind Tai Chi
- ...

### 6. 非遗传承 (18题)
- Traditional Chinese medicine and its cross-cultural acceptance
- How young people revitalize local traditional crafts
- The inheritance of Chinese operas among Gen Z
- ...

### 7. 现代传承与国际传播 (15题)
- How is modern China shaped by its traditional culture?
- How can youth become bridge builders for Chinese-foreign cultural exchange?
- The Story of Us: The Chineseness
- ...

📄 **完整列表**：查看 `documents/中国文化演讲题目(1).docx`

---

## ✅ 开发路线图

### Phase 1: 网站部署 ✅ 已完成
- [x] 完成HTML网站开发
- [x] 初始化Git仓库
- [x] 创建Vercel配置
- [ ] 推送到GitHub
- [ ] 部署到Vercel
- [ ] 获取测试URL给用户体验

### Phase 2: 内容优化（进行中）
- [ ] 从队友获取平台URL
- [ ] 更新所有跳转链接
- [ ] 整理90个主题详细内容
- [ ] 添加主题详情页（可选）
- [ ] 图片优化（压缩大小）

### Phase 3: 微信小程序开发（未开始）
- [ ] 注册微信小程序账号
- [ ] 安装uni-app开发环境
- [ ] 创建小程序项目
- [ ] 开发核心页面
- [ ] 对接队友API
- [ ] 提交审核上线

### Phase 4: 迭代优化
- [ ] 根据用户反馈优化
- [ ] 添加更多学习资源
- [ ] SEO优化（网站）
- [ ] 性能优化

---

## 💰 成本预算

### 网站版本
- 开发：已完成
- 域名：¥50/年（可选）
- 托管：Vercel免费
- **总计**：¥0-50/年

### 小程序版本
- 开发：4-5周工作量
- 认证：¥300/年（企业）或免费（个人，功能受限）
- 服务器：使用队友API，¥0
- **总计**：¥0-300/年

---

## 🤝 协作事项

### 需要与队友确认

1. **平台URL**
   - [ ] 演讲平台的正式URL
   - [ ] 辩论平台的正式URL
   - [ ] 用户登录/注册URL

2. **品牌统一**
   - [ ] 统一的项目Logo
   - [ ] 统一的项目名称
   - [ ] 是否需要统一设计风格

3. **小程序对接**
   - [ ] 队友是否也开发小程序？
   - [ ] 是否提供API接口？
   - [ ] 如何实现用户登录？

---

## 📞 联系方式

- **项目地址**：`D:/JavaWeb/English-web/web`
- **部署地址**：即将部署到Vercel
- **团队协作**：与队友的演讲/辩论平台配合


---

## 🎯 下一步行动

### 立即完成
1. 创建GitHub仓库
2. 推送代码到GitHub
3. 部署到Vercel
4. 获取访问URL并测试

### 本周完成
1. 从队友获取平台URL
2. 更新网站中的所有链接
3. 图片优化（压缩背景图）
4. 邀请用户测试体验

### 两周内完成
1. 根据反馈优化网站
2. 决定是否开发小程序
3. 如果开发小程序，注册账号并学习uni-app

---

## 📝 更新日志

### v1.0 (2026-08-16)
- ✅ 完成纯HTML网站开发
- ✅ 初始化Git仓库
- ✅ 创建Vercel部署配置
- ✅ 编写部署和小程序开发文档

### 待发布 v1.1
- ⏳ 部署到Vercel
- ⏳ 更新队友平台链接
- ⏳ 用户测试反馈

---

**项目版本**: v1.0  
**最后更新**: 2026-08-16  
**开发者**: AI英语学习团队
