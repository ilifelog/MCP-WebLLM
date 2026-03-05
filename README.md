# 🌉 MCP-WebLLM (MCP Multi Bridge)

<div align="center">
  <p>一个轻量级、零依赖的 Chrome 浏览器扩展，无缝将本地 <b>MCP (Model Context Protocol)</b> 服务器连接到各大网页版 AI 助手。</p>
</div>

---

## 📖 项目简介

**MCP-WebLLM** 是一个基于纯原生 JavaScript (Vanilla JS) 开发的浏览器插件。它的核心使命是：**打破网页端 AI 与本地计算机之间的壁垒**。

通过本插件，你可以直接在 ChatGPT、DeepSeek、Claude 等网页版 AI 的对话框中，无缝调用你本地运行的 MCP 工具（例如读取本地文件、查询本地数据库、执行本地脚本等）。

与目前社区中流行的复杂前端架构不同，本项目主打**极简、透明、无负担**。没有 React，没有 Vue，不需要 Webpack/Vite 打包，代码所见即所得。非常适合喜欢纯原生 DOM 操作、追求极致轻量的开发者学习和使用。

## 🌟 核心特性

- ⚡ **极致轻量 (Ultra-lightweight)**：100% 纯 Vanilla JavaScript 与原生 CSS 编写。**零框架**、**零构建工具**、**零臃肿依赖**。即下即用，秒级加载。
- 🔌 **全网 AI 支持 (Universal Support)**：一次配置，全网通用。自动识别并注入工具到目前主流的十余家网页版 AI 助手。
- 🛠️ **底层原生实现 (Native Transport)**：在浏览器环境中从零手写了针对 MCP 协议的 SSE (Server-Sent Events) 和 HTTP 轮询通信机制，稳定高效。
- 🔒 **隐私与安全优先 (Privacy Focused)**：插件仅作为“桥梁”。你的 API 请求和本地数据流转仅发生在“你的浏览器”与“你的本地服务器”之间，不经过任何第三方中转服务器。

## 🌐 支持的 AI 平台

插件会自动检测当前网页，并在以下平台中无缝注入 MCP 工具侧边栏：

- **国际主流**：ChatGPT / OpenAI, Google Gemini, Google AI Studio, Perplexity, Claude (via API/Web), Grok, GitHub Copilot Web
- **开源/聚合模型**：DeepSeek (深度求索), OpenRouter, Mistral, T3 Chat
- **国产大模型**：Kimi (月之暗面), 通义千问 (Qwen), 智谱清言 (ChatGLM), 豆包 (Doubao)

## 🚀 安装指南 (开发者模式)

由于本项目没有复杂的构建步骤，你可以直接将源码加载到浏览器中：

1. **获取代码**：克隆本仓库 `git clone https://github.com/你的用户名/MCP-WebLLM.git` 或下载 ZIP 压缩包并解压。
2. **打开扩展管理**：在 Chrome 或 Edge 浏览器地址栏输入 `chrome://extensions/` 并回车。
3. **开启开发者模式**：打开右上角的 **"开发者模式 (Developer mode)"** 开关。
4. **加载插件**：点击左上角的 **"加载已解压的扩展程序 (Load unpacked)"** 按钮，然后选择本项目的根目录（包含 `manifest.json` 的那个文件夹）。
5. **固定插件**：在浏览器右上角的拼图图标中找到 **MCP Multi Bridge** 并将其固定到工具栏。

## ⚙️ 使用说明

### 1. 准备本地 MCP 服务器
你需要先在本地运行一个支持 SSE 传输的 MCP Server。例如一个运行在 `http://localhost:3001/sse` 的 Python 或 Node.js MCP 服务。

### 2. 配置扩展插件
1. 点击浏览器右上角的插件图标，打开配置弹窗 (Popup)。
2. 在服务器列表中点击“添加服务器”。
3. 填入你的服务器名称（如 "Local Files"）和 URL 地址（如 `http://localhost:3001/sse`）。
4. 保存并确认连接状态显示为绿色（已连接）。

### 3. 在 AI 网页中使用
1. 打开任意支持的 AI 平台（如 `https://chat.deepseek.com`）。
2. 你会在页面侧边栏（或输入框附近）看到 MCP 专属的控制面板。
3. 在与 AI 对话时，AI 可以感知到你配置的本地工具。例如你可以直接问 AI：“请调用读取文件工具，帮我看看桌面上的 `test.py` 写了什么？”
4. 插件会拦截 AI 的工具调用意图，将其转发给本地 MCP 服务器，并将本地执行结果无缝返回给网页中的 AI。

## 🧙 特殊使用场景与高级技巧

- **场景一：本地代码辅助审查**
  利用 MCP 暴露你本地的项目目录。在 DeepSeek 网页端输入：“请帮我分析一下我本地 `src/main.js` 里的内存泄漏问题”。大模型会自动调用读取工具获取代码并分析，**免去了手动复制粘贴几十个文件的痛苦**。
  
- **场景二：本地数据库“云端”查询**
  将本地的 MySQL/PostgreSQL 包装成 MCP 工具。你可以在 ChatGPT 网页端直接用自然语言说：“帮我查询一下昨天注册的活跃用户数据并生成一份 Markdown 报告”。
  
- **场景三：多服务器级联 (Multi-Server)**
  插件支持**同时连接多个 MCP 服务器**。你可以同时连接一个“本地文件系统服务器”和一个“GitHub 搜索服务器”。AI 会自动在不同工具间调度，实现跨域自动化。

## 💡 灵感来源与版权说明 (Clean-room Implementation)

本项目在产品概念和 UI 交互思路上深受优秀的开源项目 [MCP-SuperAssistant](https://github.com/srbhptl39/MCP-SuperAssistant) 启发。

**声明：** 
MCP-SuperAssistant 是一个基于 React + TypeScript 构建的大型前端工程；而 **MCP-WebLLM** 则是采用完全不同的技术栈（纯 Vanilla JS、无前端框架、无打包工具）进行的“净室重写 (Clean-room rewrite)”。
本项目的初衷是为前端社区提供一个**底层逻辑透明、易于阅读源码、无需编译即可二次开发**的极简替代方案。两个项目底层代码完全独立。

## 🤖 致谢 / Credits

*本项目由 OpenCode + Claude (Opus / 3.5 Sonnet) 协助开发完成。*

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可。
