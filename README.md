# 🤖 automator-mcp

MCP (Model Context Protocol) server for macOS Automator - bringing AI-powered automation to your Mac!

**🚨 BREAKING: AI CAN NOW CONTROL YOUR MAC! 🚨**

[![npm version](https://badge.fury.io/js/automator-mcp.svg)](https://www.npmjs.com/package/automator-mcp)

## 🤯 What This Does

This MCP server lets Claude (or any AI with MCP support) control your macOS:
- 📧 **Send emails** through Apple Mail
- 🗂️ **Organize files** intelligently  
- 🖥️ **Control applications** natively
- 🔄 **Automate workflows** with AppleScript/JXA
- 👀 **Visual automation** - AI watches and learns from your screen

**Yes, you read that right. AI can now send emails from your Mac!**

## 🚀 Features

- **AppleScript Execution** - Run AppleScript directly from AI
- **JavaScript for Automation (JXA)** - Modern JS automation support  
- **Workflow Creation** - Build Automator workflows programmatically
- **Quick Actions** - Pre-built automations for common tasks
- **System Automation** - Control macOS system features

## 📦 Installation

```bash
npm install -g automator-mcp
```

## 🔧 Configuration

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "automator": {
      "command": "automator-mcp"
    }
  }
}
```

## 🛠️ Available Tools

### run_applescript
Execute AppleScript code:
```applescript
tell application "Finder"
  display dialog "Hello from AI!"
end tell
```

### run_jxa
Execute JavaScript for Automation:
```javascript
Application('Finder').displayDialog('Hello from AI!');
```

### quick_action
Run predefined automations:
- `compress_images` - Compress image files
- `convert_to_pdf` - Convert files to PDF
- `resize_images` - Resize images to specified dimensions
- `extract_text_from_pdf` - Extract text from PDFs
- `combine_pdfs` - Merge multiple PDFs
- `convert_video` - Convert video formats

### system_automation
System-level tasks:
- `empty_trash` - Empty the trash
- `toggle_dark_mode` - Switch between light/dark mode
- `take_screenshot` - Capture screen
- `get_system_info` - Get system information

### create_workflow
Create new Automator workflows with specified actions.

### list_actions
List available Automator actions by category.

## 💡 Examples

**Compress all screenshots from today:**
```
Use quick_action with action "compress_images" and files from ~/Desktop/Screenshot*.png
```

**Toggle dark mode:**
```
Use system_automation with task "toggle_dark_mode"
```

**Create a workflow to resize images:**
```
Use create_workflow to make a new service that resizes selected images to 800x600
```

## 🤝 Contributing

Pull requests welcome! Let's make Mac automation amazing together.

## 📄 License

MIT © Maciej Gad

---

Made with ❤️ by [@Szowesgad](https://github.com/Szowesgad) & [@giklaudiusz](https://github.com/giklaudiusz)

*Yes, this MCP was co-created by an AI (Klaudiusz) who can now send emails through your Mac. We live in the future! 🚀*