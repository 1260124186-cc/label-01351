# 乡村文化库小程序

## How to Run

### 方式一：微信开发者工具（推荐）

1. 安装微信开发者工具
2. 打开微信开发者工具，导入项目，选择 `frontend-mp` 目录
3. 在项目设置中关闭"ES6 转 ES5"、"增强编译"等选项（如遇兼容问题可开启）
4. 点击编译即可预览

### 方式二：Docker 部署 Mock 服务

```bash
# 启动 Mock 服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f frontend-mp

# 停止服务
docker-compose down
```

服务启动后，Mock API 地址为：`http://localhost:8081`

## Services

| 服务 | 说明 | 端口 |
|------|------|------|
| 微信小程序前端 | 乡村文化库主应用 | - |
| Mock Server | 本地模拟后端服务 | 8081 (Docker) / 3000 (本地) |

### 前后端分离架构说明

本项目采用完整的前后端分离架构设计，API 层支持双模式运行：

- **本地存储模式（默认）**：使用 `wx.setStorageSync` 模拟后端，无需启动服务即可运行
- **远程服务模式**：通过 `wx.request` 调用真实后端 API，支持 Mock Server 或实际后端服务

两种模式共享相同的 API 接口签名，可无缝切换。当远程服务不可用时会自动降级到本地存储模式。

### Mock Server 接入说明

**启动 Mock Server：**

```bash
cd frontend-mp
npm install
npm run mock
# 服务运行在 http://localhost:3000
```

**Docker 启动：**
```bash
docker-compose up -d
# 服务运行在 http://localhost:8081
```

**接入小程序（开启远程模式）：**

修改 `frontend-mp/app.js` 中的配置：
```javascript
globalData: {
  baseUrl: 'http://localhost:8081',  // Docker 部署
  // baseUrl: 'http://localhost:3000',  // 本地启动
  useRemote: true  // 开启远程服务模式
}
```

**运行时动态切换：**
```javascript
// 在代码中动态切换数据源
const app = getApp();
app.switchDataSource(true);   // 切换到远程服务
app.switchDataSource(false);  // 切换到本地存储
app.setBaseUrl('http://your-api-server.com');  // 动态修改 baseUrl
```

**Mock API 接口列表：**

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/health | GET | 健康检查 |
| /api/article/list | GET | 获取文章列表 |
| /api/article/detail/:id | GET | 获取文章详情 |
| /api/article/publish | POST | 发布文章 |
| /api/article/my | GET | 获取我的文章 |
| /api/article/like/:id | POST | 点赞文章 |
| /api/article/unlike/:id | POST | 取消点赞 |
| /api/article/like/:id | GET | 检查点赞状态 |
| /api/article/favorite/:id | POST | 收藏文章 |
| /api/article/unfavorite/:id | POST | 取消收藏 |
| /api/article/favorite/:id | GET | 检查收藏状态 |
| /api/article/favorites | GET | 获取收藏列表 |
| /api/category/list | GET | 获取分类列表 |
| /api/user/info | GET | 获取用户信息 |
| /api/user/update | POST | 更新用户信息 |
| /api/user/stats | GET | 获取用户统计 |

**API 配置说明：**

`utils/api.js` 提供了完整的配置能力：
```javascript
const api = require('./utils/api');

// 设置配置
api.setConfig({
  useRemote: true,
  baseUrl: 'http://localhost:3000',
  timeout: 10000
});

// 获取当前配置
const config = api.getConfig();
```

## 测试账号

本项目使用本地存储模拟登录，无需真实账号。

- 打开小程序后点击"我的"或"投稿"页面
- 输入任意昵称（至少2个字）即可登录
- 登录后可进行投稿、点赞、查看文章详情等操作

## 题目内容

帮我编写一个微信小程序，主题是传承乡村文化，传递银龄力量。旨在发扬乡村文化发扬老一辈的智慧，小程序名字为：乡村文化库。该小程序可以上传文章。需要三个页面，分别为：首页（浏览已上传的作品）、投稿页（投稿作品）、我的（用户的账号信息）。不需要图片和视频。
---

## 项目介绍

乡村文化库是一个记录和传承乡村文化的微信小程序平台，旨在让更多人了解和分享乡村的民俗故事、农耕智慧、传统技艺和乡土记忆。

### 功能特性

- **首页浏览**：展示文章列表，支持按分类（民俗故事、农耕智慧、传统技艺、乡土记忆）筛选，支持关键词搜索
- **文章详情**：查看文章完整内容，显示作者、阅读量、点赞数
- **点赞功能**：支持点赞和取消点赞
- **投稿功能**：登录后可发布文章，选择分类，填写标题和内容
- **个人中心**：展示用户头像、昵称、投稿数、获赞数、阅读数，以及我的投稿列表
- **登录系统**：简单的昵称登录，点赞、投稿、查看详情需要登录

### 技术栈

- 微信小程序原生开发
- 本地存储（wx.setStorageSync）模拟数据持久化
- Express.js Mock Server（可选）

### 目录结构

```
frontend-mp/
├── app.js                          # 小程序入口，全局状态管理
├── app.json                        # 小程序配置
├── app.wxss                        # 全局样式
├── Dockerfile                      # Docker 配置文件
├── package.json                    # 项目依赖配置
├── project.config.json             # 项目配置
├── project.private.config.json     # 项目私有配置
├── sitemap.json                    # 小程序索引配置
├── assets/                         # 静态资源
│   └── icons/                      # 图标资源
│       ├── home.png                # 首页图标
│       ├── home-active.png         # 首页选中图标
│       ├── publish.png             # 投稿图标
│       ├── publish-active.png      # 投稿选中图标
│       ├── mine.png                # 我的图标
│       ├── mine-active.png         # 我的选中图标
│       └── README.md               # 图标说明
├── mock/                           # Mock 服务
│   └── server.js                   # Mock 服务器
├── pages/                          # 页面目录
│   ├── index/                      # 首页 - 文章列表
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── detail/                     # 文章详情页
│   │   ├── detail.js
│   │   ├── detail.json
│   │   ├── detail.wxml
│   │   └── detail.wxss
│   ├── publish/                    # 投稿页
│   │   ├── publish.js
│   │   ├── publish.json
│   │   ├── publish.wxml
│   │   └── publish.wxss
│   ├── mine/                       # 我的页面
│   │   ├── mine.js
│   │   ├── mine.json
│   │   ├── mine.wxml
│   │   └── mine.wxss
│   └── login/                      # 登录页
│       ├── login.js
│       ├── login.json
│       ├── login.wxml
│       └── login.wxss
├── scripts/                        # 脚本目录
│   └── generate-icons.js           # 图标生成脚本
└── utils/                          # 工具函数
    ├── api.js                      # API 接口封装
    ├── icons.js                    # 图标工具
    └── util.js                     # 通用工具函数
```
