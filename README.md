<div align="center">

# 🍲 家庭版菜单 · Family Menu

> **「厨房是我们的小宇宙，菜单是我们的情书。」**

一个安装在微信上的**私人点单小程序**——TA 用手机点单，你的后台秒级实时接单。可以一起添加爱吃的菜、配上照片，记录每一道菜背后的故事。

**Built with 💛 for every couple who loves cooking together.**

`微信小程序` · `微信云开发 · CloudBase` · `本地零服务器部署`

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![WeChat](https://img.shields.io/badge/%E5%BE%AE%E4%BF%A1-Mini%20Program-07c160.svg)](#)
[![CloudBase](https://img.shields.io/badge/CloudBase-%E4%BA%91%E5%BC%80%E5%8F%91-3468AE.svg)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#)

<img src="assets/banner.png" width="700" alt="Family Menu banner"/>

</div>

---

## ✨ 这是什么

你平时来不及或懒得讲「今天想吃什么」？那就让 TA 在手机上自己点单吧 🧡

- 👧 **TA（顾客端）**：浏览图文菜单 → 加入点单 → 一秒提交 → 随时看订单进度。
- 👦 **你（老板端）**：后台**实时**冒出 TA 的新订单，点一下「完成/取消」，TA 那边立刻同步。
- 🌈 **你们的专属菜单**：添加爱吃的菜、传照片（最多 9 张）、写下这道菜的小故事。

> 技术方案基于 **微信云开发（CloudBase）**：不需要买服务器、不需要域名备案、不需要会运维。买菜一样的简单。

## 🎬 界面预览

| TA 的菜单 | TA 的点单 | 你的实时接单 |
|:---:|:---:|:---:|
| <img src="assets/placeholder.png" width="120"/> | <img src="assets/placeholder.png" width="120"/> | <img src="assets/placeholder.png" width="120"/> |

> 本地跑起来后，在 `pages/` 下有全部页面的真实效果；也可以打开本仓库的同名预览页查看交互原型。

---

## 🚀 快速开始

### 你需要准备的
1. 微信开发者工具（稳定版）
2. 一个微信小程序账号（个人主体即可，免费）拿到 **AppID**
3. 一杯奶茶，和 TA 一起布置菜单 🥤

### 5 步上手

<details>
<summary><b>① 导入项目</b>（点开看详细）</summary>

微信开发者工具 → 导入项目 → 选择本仓库根目录 → 填入你的 **AppID** → 导入。
</details>

<details>
<summary><b>② 开通云开发并填入环境 ID</b></summary>

工具栏点「云开发」→ 创建环境（如 `family-menu`）→ 把 [miniprogram/app.js](miniprogram/app.js) 第 13 行的 `env: 'YOUR-ENV-ID'` 换成你的环境 ID。
</details>

<details>
<summary><b>③ 创建 3 个数据集合</b></summary>

云开发控制台 → 数据库 → 新建：`admins` / `dishes` / `orders`。
`dishes` 和 `orders` 的权限都选「**所有用户可读，仅创建者可写**」。
</details>

<details>
<summary><b>④ 部署 5 个云函数</b></summary>

在 `cloudfunctions/` 下对 `login` / `addAdmin` / `createOrder` / `saveDish` / `updateOrderStatus` 依次右键 →「**上传并部署：云端安装依赖**」。
</details>

<details>
<summary><b>⑤ 让 TA 也能一起用 & 认领老板</b></summary>

点开发者工具「预览」，生成二维码让 TA 扫。**你自己先**打开小程序 →「我的」→「授权我成为老板」。因为新环境的 `admins` 是空的，**第一个点的人就是老板** —— 手快才有老板当 😉
</details>

之后：进「商家后台 → 菜品管理」添加第一道菜、传上照片，开始经营你们的小食堂吧！

---

## 🧩 项目结构

```
家庭版菜单/
├─ miniprogram/            # 小程序前端
│  ├─ app.js / app.json    # 入口 & 全局配置
│  ├─ pages/
│  │  ├─ index/            # 菜单首页（顾客）
│  │  ├─ dish-detail/      # 菜品详情
│  │  ├─ cart/             # 点单车
│  │  ├─ orders/           # 我的订单
│  │  ├─ mine/             # 我的（含老板授权）
│  │  ├─ admin/            # 商家后台 · 实时接单 + 菜品管理
│  │  └─ dish-form/        # 添加/编辑菜品
│  └─ utils/               # 工具函数
├─ cloudfunctions/         # 云函数
│  ├─ login                # 登录 & 权限判断
│  ├─ addAdmin             # 首次授权老板
│  ├─ createOrder          # 创建订单（服务端二次校验价格）
│  ├─ saveDish             # 菜品增删改/上架
│  └─ updateOrderStatus    # 处理订单状态
├─ assets/                 # 文档资源
├─ README.md
└─ LICENSE
```

---

## 📬 给 TA 的信息传达（实时接单原理）

不是"刷新才看到"，而是用微信云数据库的 **实时监听（`watch`）**：

```js
db.collection('orders').where({ status: 0 }).watch({
  onChange: snapshot => /* 新订单立刻上屏 */
})
```

所以 TA 的手指刚离开屏幕，你的接单看板就已经弹出这单了。

---

## 🛠 技术栈

- **框架**：原生微信小程序（无构建工具，克隆即可用）
- **后端**：微信云开发（云函数 + 云数据库 + 云存储）
- **实时**：云数据库 `watch` 实时监听
- **权限**：管理员由 `admins` 集合 + 云函数二次校验

---

## 🤝 参与贡献

欢迎任何形式的贡献 —— 修 bug、加功能、优化样式、写文档都超棒！

1. Fork 本仓库
2. 创建分支：`git checkout -b feature/xxx`
3. 提交改动
4. 发起 Pull Request

如果你觉得这个小项目可爱，给个 ⭐ 也是对我们最大的鼓励 💕

---

## 💬 常见问题

- **报错「环境不存在」** → `app.js` 里的 `env` 是否已改成你的环境 ID？
- **云函数调用失败** → 重新「上传并部署：云端安装依赖」。
- **传照片失败** → 确认云开发已开通、当前功能在云开发环境范围内。
- **收不到实时单** → 确认 `orders` 集合权限为「所有用户可读」；也可下拉刷新兜底。

---

## 📝 License

[MIT](LICENSE) © Family Menu Project

<div align="center">
<br/>
<sub>Made with 🍳 &amp; 💛 for the two of you</sub>
</div>