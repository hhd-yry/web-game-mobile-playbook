# 网页游戏手机化 · 通用方法 (Web Game to Mobile Playbook)

把"网页内核"的电脑游戏（Cocos / Unity WebGL / HTML5 / Electron 套壳）部署成本地网页，用手机浏览器直接玩。记录踩坑经验与可复用代码。

> 原理一句话：**找到游戏真正监听的"事件通道"，从那个通道喂事件。**

## 适用对象

游戏安装目录里有网页特征文件的：
- `index.html`
- `cocos2d-js*.js` + `assets/`（Cocos Creator 2.x web）
- `Build/` + `*.unityweb`（Unity WebGL）
- `resources/app/`、`*.pak`、`icudtl.dat`（Electron 套壳）

纯 C++/Unreal/原生 exe 不适用（那种只能串流：Steam Link / Moonlight / 向日葵）。

## 四步核心思路

1. **判断**：是不是网页内核
2. **跑起来**：静态服务器托管（`python3 -m http.server 8010 --bind 0.0.0.0`）
3. **模拟鼠标**：手机触摸 → 翻译成游戏的鼠标事件（改按钮组件）
4. **模拟键盘**：虚拟按键 → 灌进引擎键盘通道（如 `cc.systemEvent.emit`）

## 目录结构

```
.
├── README.md              本文件
├── 通用方法手册.md         完整方法论（判断/服务器/存档/模拟输入/引擎速查/FAQ）
└── examples/
    ├── 触摸转鼠标-按钮组件补丁.js   Cocos 2.x：给按钮加触摸支持
    ├── 虚拟按键-模拟键盘.js         Cocos 2.x：虚拟方向键/Shift
    ├── 读取Electron存档.js         Node.js classic-level 读 Chromium localStorage
    └── 静态服务器启动.bat          一键启动脚本模板
```

## 核心要点速记

| 问题 | 正解 |
|---|---|
| 手机点按钮没反应 | 给按钮组件加触摸监听，触摸=悬停+点击；触摸对象补 `getButton()` |
| 手机虚拟键没反应 | 别发 DOM KeyboardEvent；走引擎事件总线（`cc.systemEvent.emit`） |
| 改了存档不生效 | 游戏可能读 localStorage 优先，改对存储位置 |
| 改完把原按钮搞坏 | 别给全局鼠标层转发触摸，只改具体组件，每步手机验证 |

## 免责声明

- 本仓库只包含**方法论与通用代码示例**（引擎 API 用法），**不包含任何游戏本体、资源或反编译代码**；
- 请仅用于自己本地游玩/学习，尊重游戏版权，勿公开分发改造后的游戏文件；
- 修改任何游戏文件前**务必先备份**。

## License

MIT
