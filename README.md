# WeChat Mate

一个基于 Node.js 的微信消息存储助手，用于自动记录和存储微信私聊、群聊以及公众号的消息记录。

## 功能特点

- 自动记录微信消息（私聊、群聊、公众号）
- 基于 TypeScript 开发
- PostgreSQL 数据存储
- Docker 容器化部署
- 时区自动配置为 Asia/Shanghai
- 支持 ARM64 和 AMD64 架构

## 快速部署指南

### 方式一：使用预构建的 Docker 镜像（推荐）

1. 创建部署目录：
```bash
mkdir wechat-mate && cd wechat-mate
```

2. 创建 docker-compose.yml 文件：
```yaml
version: '3.8'

services:
  app:
    image: thinkthinking/wechat-mate:latest  # 或使用特定版本，如 :1.0.0
    container_name: wechat_mate
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - ./data:/app/data  # 持久化数据目录
    environment:
      - TZ=Asia/Shanghai
      - POSTGRES_HOST=postgres
      - DATABASE_URL=postgresql://chatbot:chatbot123@postgres:5432/chatbot
      - NODE_ENV=production

  postgres:
    image: postgres:17-alpine
    container_name: wechat_postgres
    environment:
      POSTGRES_DB: chatbot
      POSTGRES_USER: chatbot
      POSTGRES_PASSWORD: chatbot123  # 建议在生产环境中修改此密码
      PGDATA: /var/lib/postgresql/data/pgdata
      TZ: Asia/Shanghai
      POSTGRES_INITDB_ARGS: --encoding=UTF8 --locale=C
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U chatbot"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    name: wechat_mate_postgres_data
```

3. 启动服务：
```bash
docker-compose up -d
```

服务启动后：
- 数据库会自动初始化
- 聊天记录会自动保存到数据库
- 扫描终端显示的二维码登录微信

### 版本选择

镜像标签说明：
- `latest`: 最新版本，随主分支更新
- `1.0.0`: 具体版本号，稳定版本
- `1.0`: 次要版本号，会随补丁更新
- `1`: 主版本号，会随次要版本更新

建议在生产环境使用具体的版本号，如：
```yaml
image: thinkthinking/wechat-mate:1.0.0
```

### 数据持久化

默认情况下，以下数据会被持久化：
- PostgreSQL 数据：保存在名为 `wechat_mate_postgres_data` 的 Docker 卷中
- 应用数据：保存在部署目录的 `./data` 文件夹中

### 自定义配置

1. 修改数据库密码（建议）：
   - 修改 `POSTGRES_PASSWORD` 和对应的 `DATABASE_URL`
   ```yaml
   environment:
     POSTGRES_PASSWORD: your_secure_password
     DATABASE_URL: postgresql://chatbot:your_secure_password@postgres:5432/chatbot
   ```

2. 修改时区（可选）：
   ```yaml
   environment:
     TZ: Asia/Shanghai  # 改为你的时区
   ```

### 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app  # 查看机器人日志
docker-compose logs -f postgres  # 查看数据库日志

# 停止服务
docker-compose down

# 更新到最新版本
docker-compose pull  # 拉取最新镜像
docker-compose up -d  # 重新启动服务

# 完全重置（会删除所有数据）
docker-compose down -v
```

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

## CI/CD 流程

项目使用 GitHub Actions 自动构建和发布 Docker 镜像。

### 自动构建触发条件

- 推送到 master 分支
- 创建新的版本标签（格式：`v*.*.*`）
- 创建 Pull Request 到 master 分支（仅构建，不推送）

### 构建特性

- 支持多架构：同时构建 `linux/amd64` 和 `linux/arm64` 架构的镜像
- 自动标签管理：
  - master 分支推送：更新 `latest` 标签
  - 版本标签：自动创建对应的版本标签（例如 `v1.0.0` 会创建 `1`、`1.0`、`1.0.0` 三个标签）
- 使用 GitHub Actions 缓存加速构建
- 自动推送到 Docker Hub

### 发布新版本

要发布新版本，执行以下步骤：

```bash
# 1. 创建新的版本标签
git tag v1.0.0

# 2. 推送标签到 GitHub
git push origin v1.0.0
```

这将自动触发构建流程，并推送以下标签的镜像到 Docker Hub：
- `thinkthinking/wechat-mate:1`
- `thinkthinking/wechat-mate:1.0`
- `thinkthinking/wechat-mate:1.0.0`

### 配置说明

项目的 CI/CD 需要以下 GitHub Secrets 配置：

1. `DOCKERHUB_USERNAME`: Docker Hub 用户名
2. `DOCKERHUB_TOKEN`: Docker Hub 访问令牌

要设置这些密钥：
1. 打开 GitHub 仓库设置
2. 进入 "Settings" -> "Secrets and variables" -> "Actions"
3. 点击 "New repository secret"
4. 添加上述密钥

获取 Docker Hub 访问令牌：
1. 登录 [Docker Hub](https://hub.docker.com)
2. 进入 Account Settings -> Security
3. 点击 "New Access Token"
4. 设置令牌名称和权限（需要 Read & Write 权限）
5. 保存生成的令牌

## 许可证

[MIT License](LICENSE)
