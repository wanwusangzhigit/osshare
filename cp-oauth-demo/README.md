# CP OAuth 登录演示

基于 OAuth 2.0 + PKCE 协议的完整登录系统，集成 CP OAuth 获取用户全部数据。

## 功能特性

- 🔐 **PKCE 安全认证** - 防止授权码拦截攻击
- 📊 **完整数据获取** - 支持所有权限范围（openid, profile, email, cp:linked, cp:summary, cp:details）
- 🎮 **平台关联展示** - 显示洛谷、AtCoder、Codeforces、GitHub 等关联账号
- 🎨 **响应式 UI** - 现代化设计，适配各种设备
- 🔄 **Token 管理** - 支持刷新令牌和撤销令牌

## 前置要求

1. Node.js 18+ 
2. 在 [CP OAuth](https://www.cpoauth.com/) 注册应用获取 Client ID 和 Client Secret

## 快速开始

### 1. 安装依赖

```bash
cd cp-oauth-demo
npm install
```

### 2. 配置环境变量

复制示例配置文件并填写你的应用信息：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
CLIENT_ID=your_actual_client_id
CLIENT_SECRET=your_actual_client_secret
REDIRECT_URI=http://localhost:13450/callback
PORT=13450
```

### 3. 配置前端 Client ID

编辑 `public/index.html`，找到以下行并替换为你的 Client ID：

```javascript
const CLIENT_ID = 'YOUR_CLIENT_ID'; // 替换为实际的 Client ID
```

### 4. 在 CP OAuth 平台注册应用

1. 访问 https://www.cpoauth.com/
2. 进入开发者设置创建新应用
3. 设置回调地址为：`http://localhost:13450/callback`
4. 获取 Client ID 和 Client Secret

### 5. 启动服务

```bash
npm start
```

访问 http://localhost:13450 即可看到登录界面。

## 项目结构

```
cp-oauth-demo/
├── server/
│   └── index.js          # Express 后端服务器
├── public/
│   └── index.html        # 前端登录界面和用户信息展示
├── .env.example          # 环境变量示例
├── package.json          # 项目配置
└── README.md             # 说明文档
```

## API 端点

### 后端接口

- `POST /api/login` - 交换授权码获取访问令牌和用户信息
- `POST /api/refresh` - 刷新访问令牌
- `POST /api/revoke` - 撤销令牌

### CP OAuth 接口

- `GET /api/oauth/authorize` - 发起授权
- `POST /api/oauth/token` - 交换/刷新令牌
- `GET /api/oauth/userinfo` - 获取用户信息
- `POST /api/oauth/revoke` - 撤销令牌

## 权限范围

本演示请求以下权限范围以获取全部数据：

| 范围 | 描述 |
|------|------|
| `openid` | 用户 ID |
| `profile` | 用户名、显示名称、头像、简介 |
| `email` | 邮箱地址及验证状态 |
| `cp:linked` | 所有关联的竞赛平台账号 |
| `cp:summary` | 竞赛概要数据 |
| `cp:details` | 竞赛详细数据 |
| `link:*` | 各平台具体链接信息 |

## 安全说明

⚠️ **重要提示**：

1. 永远不要将 `.env` 文件提交到版本控制
2. Client Secret 必须保存在后端，绝不能暴露在前端代码中
3. 生产环境请使用 HTTPS
4. Token 存储应使用更安全的机制（如 HttpOnly Cookie）
5. 本演示中的 localStorage 存储仅用于学习目的

## 技术栈

- **后端**: Node.js + Express
- **前端**: 原生 HTML/CSS/JavaScript
- **协议**: OAuth 2.0 + PKCE (RFC 7636)
- **HTTP 客户端**: node-fetch

## 开发模式

启用自动重载的开发模式：

```bash
npm run dev
```

## 许可证

MIT License

## 参考资源

- [CP OAuth 文档](https://www.cpoauth.com/)
- [OAuth 2.0 规范](https://oauth.net/2/)
- [PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
