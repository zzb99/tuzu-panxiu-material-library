# 土族盘绣纹样开放素材库

## 项目介绍

本项目是一套本地可运行的土族盘绣数字文化资源平台。前台提供首页展陈、五类资源检索、详情阅读和免登录直接下载；管理后台维护内容、上下架状态、首页推荐、分类、标签、页面与附件；全部正式内容来自 NestJS + MySQL 真实接口。

项目借鉴数字敦煌开放素材库的公开页面结构、检索方式与文化平台气质，代码、接口、数据库和视觉组件均独立实现。不包含普通用户、订单、支付、评论、授权申请或下载审核。

## 技术栈

- 前台：Vue 3 + Vite + TypeScript
- 后台：Vue 3 + Vite + TypeScript + Element Plus
- 后端：Node.js + NestJS + TypeORM
- 数据库：MySQL 8.0+
- 文件存储：项目根目录 `uploads/`

## 目录结构

```text
frontend/   前台展示网站
admin/      内容管理后台
backend/    NestJS 接口服务
database/   schema.sql 与 seed.sql
uploads/    本地上传文件
docs/       中文设计、接口和验收文档
```

## Windows 本地运行步骤

下面的命令都在项目根目录 `D:\桌面\tuzu-panxiu-material-library` 的 PowerShell 中执行。首次运行请严格按顺序操作。

### 1. 安装基础软件

1. 从 Node.js 官网安装 Node.js LTS（建议 20 或 22），安装后重新打开 PowerShell，执行 `node -v` 检查。
2. 执行 `npm install -g pnpm` 安装 pnpm，再执行 `pnpm -v` 检查。
3. 安装 MySQL 8，并记住安装时设置的 root 密码。确认 MySQL 服务已启动，执行 `mysql --version` 检查命令是否可用。

### 2. 创建本地环境变量

复制三个示例文件：

```powershell
Copy-Item .env.example .env
Copy-Item admin/.env.example admin/.env
Copy-Item frontend/.env.example frontend/.env
```

用记事本打开根目录 `.env`，把 `DATABASE_PASSWORD` 填成你自己的 MySQL root 密码，并把 `JWT_SECRET` 改为一段仅本机使用的随机长字符串。不要修改或提交三个 example 文件中的示例值，也不要把真实密码提交到仓库。

后台和前台的 `VITE_API_BASE_URL` 默认都是 `http://localhost:3000/api`。`MAX_UPLOAD_SIZE` 支持 `50mb` 这种写法，也支持纯字节数。

### 3. 安装三端依赖

```powershell
pnpm --dir backend install
pnpm --dir admin install
pnpm --dir frontend install
```

也可以执行根目录辅助命令：

```powershell
pnpm install:all
```

### 4. 初始化 MySQL 数据库

在项目根目录执行：

```powershell
mysql -u root -p < database/schema.sql
mysql -u root -p tuzu_panxiu < database/seed.sql
```

必须先执行 `schema.sql`，再执行 `seed.sql`。注意：PowerShell 7 通常不能直接使用 `<`；遇到重定向报错时，先执行 `mysql -u root -p` 进入 MySQL 客户端，再执行：

```sql
SOURCE D:/桌面/tuzu-panxiu-material-library/database/schema.sql;
SOURCE D:/桌面/tuzu-panxiu-material-library/database/seed.sql;
```

路径中的 `/` 是正确写法。`schema.sql` 会重建 14 张项目表，仅用于初始化空环境；不要对需要保留数据的数据库重复执行。`seed.sql` 只需导入一次。正式数据升级不能重复执行 `schema.sql`，应使用增量迁移或后台维护。

### 5. 启动后端、后台和前台

当前电脑已经完成本地环境配置时，可以直接双击项目根目录的 `启动项目.cmd`。它会启动 MySQL 和三端服务，并打开前台与后台。

确认 MySQL 服务正在运行，然后打开三个 PowerShell 窗口，每个窗口只执行一条启动命令：

```powershell
pnpm --dir backend start:dev
```

```powershell
pnpm --dir admin dev
```

```powershell
pnpm --dir frontend dev
```

也可以分别使用根目录辅助命令 `pnpm dev:backend`、`pnpm dev:admin`、`pnpm dev:frontend`。

### 6. 打开并检查

- 前台：`http://localhost:5173`
- 后台：`http://localhost:5174/login`
- 后端接口：`http://localhost:3000/api`
- 上传文件静态地址：`http://localhost:3000/uploads/...`

默认管理员账号：`admin`

默认管理员密码：`password`

这是本地联调账号。首次登录后请在“管理员管理”中立即修改密码；正式使用前还应创建独立管理员并停用默认弱密码账号。

接口文档：`http://localhost:3000/api/docs`

### 7. Windows 常见报错处理

- 提示找不到 `node`、`pnpm` 或 `mysql`：关闭并重新打开 PowerShell；仍失败时，把对应安装目录加入 Windows PATH。
- 提示数据库连接失败：确认 MySQL 服务已启动，并检查根目录 `.env` 中的端口、用户名、密码和数据库名。
- PowerShell 提示 `<` 不受支持：使用上面的 `SOURCE` 方式导入 SQL，或在传统 `cmd.exe` 中执行两条重定向命令。
- 提示端口被占用：先关闭占用 3000、5173 或 5174 的旧进程。若修改后端端口，必须同步修改 admin 与 frontend 的 API 地址。
- 修改 `.env` 后没有生效：停止对应服务，再重新执行启动命令。
- 页面提示无法连接接口：先确认后端窗口没有报错，再检查浏览器请求是否访问 `http://localhost:3000/api`。
- 上传文件无法访问：确认根目录 `uploads/` 存在且当前 Windows 用户有写权限。
- 种子图片显示不出来：种子数据库中的媒体路径是联调引用，仓库可能没有对应真实文件；请登录后台上传已授权素材，不能用前端假数据替代。

## 上传与直接下载

图片、PDF、DOC/DOCX、ZIP 等文件写入根目录 `uploads/`，数据库只保存相对 URL 和文件元数据。服务端检查扩展名、文件签名、大小和 SVG 危险内容；`MAX_UPLOAD_SIZE` 不应高于服务端 50MB 硬限制。后台上传并绑定为 `download_file` 后，前台详情页才显示“直接下载”；无附件时不显示下载区。下载不要求访客登录、申请、确认或审核。

## 构建验证

```powershell
pnpm --dir backend typecheck
pnpm --dir backend build
pnpm --dir admin typecheck
pnpm --dir admin build
pnpm --dir frontend typecheck
pnpm --dir frontend build
```

完整联调步骤见 [docs/09-本地运行与联调说明.md](docs/09-本地运行与联调说明.md)，逐项验收见 [docs/08-测试验收清单.md](docs/08-测试验收清单.md)。

## 常见问题

- **后端提示数据库连接失败**：确认 MySQL 已启动、`.env` 密码正确，且已按顺序导入 `schema.sql`、`seed.sql`。
- **后台或前台提示无法连接内容服务**：确认 backend 正在 `3000` 端口运行，两个 Vite `.env` 都包含 `/api`，修改环境变量后重启 Vite。
- **5173/5174 端口被占用**：执行 `pnpm --dir frontend dev -- --port 5183` 或 `pnpm --dir admin dev -- --port 5184` 临时换端口。
- **图片显示占位图**：数据库种子路径不等于真实文件；请通过后台上传授权清晰的文件并保存对应 URL。
- **上传失败**：检查管理员登录状态、扩展名、`MAX_UPLOAD_SIZE` 和 `uploads/` 写权限。
- **下载按钮不显示**：内容必须已上架，且后台已为该内容绑定 `download_file`。
- **下架后前台仍显示旧页面**：刷新前台并确认请求的是当前后端；公开接口会固定过滤非 `published` 内容。
- **PowerShell 找不到 node/pnpm/mysql**：将对应安装目录加入 PATH，关闭并重新打开终端后验证 `node -v`、`pnpm -v`、`mysql --version`。
