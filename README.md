# MCP-WebLLM (MCP Multi Bridge)

A lightweight, framework-free Chrome Extension that seamlessly connects local **Model Context Protocol (MCP)** servers to popular web-based AI assistants.

## 🌟 Features

- ⚡ **Ultra-lightweight**: Built entirely with Vanilla JavaScript and native CSS. Zero frameworks (No React/Vue), no bundlers, and zero bloated dependencies.
- 🔌 **Universal AI Support**: Instantly injects your local tools into ChatGPT, Gemini, DeepSeek, Grok, Claude, Kimi, Perplexity, and many more.
- 🛠️ **Native Implementation**: Custom-built SSE (Server-Sent Events) and HTTP transports for MCP, directly inside the browser environment.
- 🛡️ **Privacy Focused**: Everything runs locally. Your API calls go directly from your browser to your local tools.

## 💡 Inspiration

This project was heavily inspired by the excellent [MCP-SuperAssistant](https://github.com/srbhptl39/MCP-SuperAssistant) project. 

While MCP-SuperAssistant is a powerful, modern monorepo built with React and TypeScript, **MCP-WebLLM** was created to serve as a pure, minimalist, and readable alternative. It acts as a "Clean-room" native implementation for developers who prefer pure DOM manipulation and Vanilla JS for extension development, without the need for complex build steps.

## 🚀 Installation (Developer Mode)

1. Clone this repository or download the ZIP file.
2. Open Chrome (or any Chromium-based browser) and navigate to `chrome://extensions/`.
3. Toggle **"Developer mode"** in the top right corner.
4. Click **"Load unpacked"** and select the root directory of this project.

## 🌐 Supported Platforms

The bridge currently detects and supports:
ChatGPT, Gemini, DeepSeek, Grok, Perplexity, Google AI Studio, OpenRouter, Mistral, Kimi, Qwen, ChatGLM, GitHub Copilot Web, and Doubao.

## 📄 License

MIT License
