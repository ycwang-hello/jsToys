# jsToys
Simple JavaScript toys

## ArXiv Helper Userscript (`arxiv_listnew_helper.js`)

Enhances browsing the arXiv new submissions [(example)](https://arxiv.org/list/astro-ph/new) page with keyboard navigation and quick paper link copying.

### Features

- Keyboard navigation: move between papers without using the mouse.
- Jump to a specific paper by number.
- Copy a paper's link (click button or keyboard shortcut) for easy pasting into editors such as Word or Markdown editors, as a hyperlink.

### Keyboard Shortcuts

| Key | Action |
|-----|-------|
| `→` | Move to next paper (relative to the current focus) |
| `←` | Move to previous paper (relative to the current focus) |
| `g` | Jump to a paper by index number (1-based) |
| `s` | Focus the first visible paper in the viewport. Useful because if you scroll manually, pressing left/right without this will move relative to the old focus, not the paper you see on screen. |
| `c` | Copy link of the currently focused paper (same as clicking the button). If the button is not visible in the viewport, copy the first visible one. |

### Button

- Each paper has a **Copy link** button next to the abstract link. Clicking it copies the paper page link for easy pasting into editors.

### Installation

- Use a userscript manager like [Tampermonkey](https://www.tampermonkey.net/).
- Create a new script, paste the [code](arxiv_listnew_helper.js), and enable it for `https://arxiv.org/list/*/new`.
