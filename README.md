# Obsidian Sticky

A Chrome extension that lets you quickly append notes to your Obsidian daily note from any webpage.

![obsidian-sticky](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white) ![obsidian-sticky](https://img.shields.io/badge/Obsidian-Daily%20Note-7C3AED?logo=obsidian&logoColor=white)

## Features

- One-click access from any webpage via Chrome extension icon
- Appends directly to today's daily note
- Draggable & resizable floating panel
- Lock/unlock position toggle
- No cloud, no accounts — 100% local

## Setup

### 1. Local server (auto-starts on login)

```bash
# Copy launchd plist and load it
cp server/com.obsidian-sticky.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.obsidian-sticky.plist
```

Edit `server/server.js` to set your vault path:
```js
const VAULT_DIR = '/path/to/your/vault/daily-notes-folder';
```

### 2. Chrome extension

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `extension/` folder

## Usage

Click the extension icon on any webpage → type your note → `⌘ Enter` or click **保存**

The note is appended to `YYYY-MM-DD.md` in your vault.

## Requirements

- Node.js
- Google Chrome
- Obsidian with daily notes enabled
