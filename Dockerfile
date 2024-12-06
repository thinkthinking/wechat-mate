FROM --platform=$TARGETPLATFORM node:20-alpine

WORKDIR /app

# 复制 package 相关文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖
RUN apk add --no-cache python3 make g++ && \
    npm install -g pnpm && \
    pnpm install && \
    apk del python3 make g++

# 复制源代码
COPY . .

# 设置时区
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

CMD ["npm", "start"]
