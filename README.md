# Easy Translate

A simple and easy-to-use Chrome extension for translating text using Google Translate.

## Project Structure

```
v2/
├── manifest.json          # Extension configuration
├── popup.html             # Main popup HTML
├── package.json           # Node.js dependencies
├── package-lock.json      # Dependency lock file
├── README.md              # This file
│
├── src/                   # Source code
│   ├── css/
│   │   └── style.css      # Styles
│   └── js/
│       └── popup.js       # Main logic
│
├── assets/                # Static assets
│   └── icons/
│       ├── icon.svg       # Source SVG icon
│       ├── icon_white.svg # White version
│       ├── icon16.png     # 16x16 icon
│       ├── icon32.png     # 32x32 icon
│       ├── icon48.png     # 48x48 icon
│       ├── icon128.png    # 128x128 icon
│       └── icon_1024x1024.png # High-res icon (for store)
│
├── scripts/               # Build/utility scripts (not included in extension)
│   ├── generate_logo.py   # Logo generation script
│   ├── optimize_icon.py   # Icon optimization
│   ├── resize_icons.py    # Icon resizing
│   └── smart_resize.py    # Smart resize utility
│
└── docs/                  # Documentation (not included in extension)
    └── design_philosophy.md
```

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `v2` folder
4. The extension icon will appear in your toolbar

## Usage

1. Click the extension icon in the toolbar
2. Enter text to translate
3. Select source and target languages
4. Press Enter or click "Translate"

## Features

- Auto-detect source language
- Support multiple languages
- Text-to-speech for pronunciation
- Translation history
- Phonetic transcription display

## Building for Production

When publishing to Chrome Web Store, you can exclude:
- `scripts/` folder
- `docs/` folder
- `package.json` & `package-lock.json`
- `assets/icons/icon_1024x1024.png` (only needed for store listing)
