# WeChat Mate

一个基于 Node.js 的微信机器人项目，支持 Docker 部署。

## 功能特点

- 基于 TypeScript 开发
- PostgreSQL 数据存储（自动保存聊天记录）
- Docker 容器化部署
- 时区自动配置为 Asia/Shanghai

## 部署方式

### 方式一：使用预构建的 Docker 镜像（推荐）

最简单的方式是使用已经构建好的 Docker 镜像：

```bash
# 1. 下载 docker-compose.yml
wget https://raw.githubusercontent.com/thinkthinking/wechat-mate/master/docker-compose.yml

# 2. 创建并启动容器
docker-compose up -d
```

服务启动后会自动：
- 创建并初始化数据库
- 创建聊天记录存储表
- 配置正确的时区和编码

## 本地开发指南

### 前置条件

- Node.js 18+
- PostgreSQL 17
- pnpm
- Docker 和 Docker Compose

### 开发环境设置

1. 克隆仓库：
```bash
git clone https://github.com/thinkthinking/wechat-mate.git
cd wechat-mate
```

2. 安装项目依赖：
```bash
pnpm install
```

3. 启动开发环境的数据库（仅运行 PostgreSQL）：
```bash
pnpm run dev:db
```

4. 启动开发服务器：
```bash
pnpm run dev
```

### 开发工具和调试

1. 常用命令：
   ```bash
   # 启动开发数据库
   pnpm run dev:db
   
   # 停止开发数据库
   docker-compose -f docker-compose.dev.yml down
   
   # 清除开发数据库数据
   docker-compose -f docker-compose.dev.yml down -v
   
   # 启动开发服务器
   pnpm run dev
   ```

2. 调试方式：
   - 使用 console.log 打印调试信息
   - 使用 Node.js 调试模式：
     ```bash
     NODE_OPTIONS='--loader ts-node/esm --inspect' pnpm run dev
     ```
     然后可以使用 Chrome DevTools 或 VS Code 连接到调试端口
   - 直接在 VS Code 中添加断点进行调试

### 项目结构

```
.
├── src/                # 源代码目录
├── Dockerfile         # 生产环境 Docker 配置
├── docker-compose.yml # 生产环境服务编排配置
├── docker-compose.dev.yml # 开发环境服务编排配置
├── install.postgres.sql  # 数据库初始化脚本
└── package.json       # 项目配置和依赖
```

## 环境变量说明

项目使用以下环境变量：

- `DATABASE_URL`: PostgreSQL 连接字符串
  - 开发环境默认值：`postgresql://chatbot:chatbot123@localhost:5432/chatbot`
  - 生产环境在 docker-compose.yml 中配置
- `NODE_ENV`: 运行环境 (development/production)
- `TZ`: 时区设置，默认 Asia/Shanghai

## 数据持久化

Docker 部署会创建以下数据卷：

- 生产环境：
  - `wechat_mate_postgres_data`: PostgreSQL 数据存储
  - `./data`: 应用数据目录
- 开发环境：
  - `wechat_mate_postgres_data_dev`: 开发环境 PostgreSQL 数据存储

## 许可证

[MIT License](LICENSE)
