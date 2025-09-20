#!/bin/zsh

# Claude 主项目目录
PROJECT_DIR="$HOME/ClaudeProjects"

# 若目录不存在则创建
if [ ! -d "$PROJECT_DIR" ]; then
  mkdir -p "$PROJECT_DIR"
  echo "✅ 已创建项目目录: $PROJECT_DIR"
fi

# 进入目录并启动 Claude
cd "$PROJECT_DIR" || exit 1
echo "🚀 正在 Claude 项目目录启动: $PROJECT_DIR"
claude
