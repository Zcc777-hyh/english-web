#!/bin/bash

# AI英语学习网站 - Vercel部署快速脚本
# 执行前请确保已安装Git和配置GitHub账号

echo "========================================="
echo "  AI英语学习网站 - 部署到Vercel"
echo "========================================="
echo ""

# 步骤1：检查Git状态
echo "📝 步骤1/4: 检查Git状态..."
cd "D:/JavaWeb/English-web/web"
git status

echo ""
echo "✅ Git仓库已初始化"
echo ""

# 步骤2：提示创建GitHub仓库
echo "========================================="
echo "📝 步骤2/4: 创建GitHub仓库"
echo "========================================="
echo ""
echo "请按以下步骤操作："
echo ""
echo "1. 访问: https://github.com/new"
echo "2. 仓库名称: ai-english-learning-web"
echo "3. 设置为: Public (公开)"
echo "4. 不要勾选任何初始化选项"
echo "5. 点击 'Create repository'"
echo ""
read -p "完成后按Enter继续..."

# 步骤3：获取GitHub用户名
echo ""
echo "========================================="
echo "📝 步骤3/4: 推送到GitHub"
echo "========================================="
echo ""
read -p "请输入你的GitHub用户名: " GITHUB_USERNAME

# 添加远程仓库
echo ""
echo "添加远程仓库..."
git remote add origin "https://github.com/$GITHUB_USERNAME/ai-english-learning-web.git"

# 推送代码
echo ""
echo "推送代码到GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ 代码已推送到GitHub"
echo ""

# 步骤4：部署到Vercel
echo "========================================="
echo "📝 步骤4/4: 部署到Vercel"
echo "========================================="
echo ""
echo "请按以下步骤操作："
echo ""
echo "1. 访问: https://vercel.com"
echo "2. 点击 'Sign Up' 或 'Login'"
echo "3. 使用GitHub账号登录（推荐）"
echo "4. 点击 'Add New...' → 'Project'"
echo "5. 选择 'Import Git Repository'"
echo "6. 找到 'ai-english-learning-web' 仓库"
echo "7. 点击 'Import'"
echo "8. 项目配置："
echo "   - Framework Preset: Other"
echo "   - Root Directory: ./"
echo "   - Build Command: (留空)"
echo "   - Output Directory: ./"
echo "9. 点击 'Deploy'"
echo "10. 等待1-2分钟..."
echo ""
echo "✅ 部署完成！"
echo ""
echo "你会得到一个URL，类似："
echo "https://ai-english-learning-web.vercel.app"
echo ""
echo "========================================="
echo "🎉 恭喜！部署成功！"
echo "========================================="
echo ""
echo "下一步："
echo "1. 访问你的Vercel URL测试网站"
echo "2. 从队友获取演讲/辩论平台URL"
echo "3. 更新网站中的链接"
echo "4. 邀请用户测试体验"
echo ""
