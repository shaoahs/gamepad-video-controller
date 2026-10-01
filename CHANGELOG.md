# Changelog

## [1.1.0] - 2026-10-01

### 變更
- 將單一 `content.js` 重構為多模組架構（`src/`）
- 加入 rolldown 打包設定（`rolldown.config.js`）
- 加入 `package.json`，使用 bun 管理開發依賴
- import 路徑統一使用 `src/` alias（由 rolldown `resolve.alias` 處理）

### 新增
- `src/config.js` — 全域設定常數
- `src/osd.js` — OSD 提示元件
- `src/video.js` — 影片元素工具函式
- `src/controls.js` — 字幕與劇院模式切換
- `src/gamepad.js` — 按鈕與搖桿軸事件處理
- `src/index.js` — 入口與搖桿連接事件

---

## [1.0.0] - 2026-09-22

### 新增功能
- 播放 / 暫停（Button 0 A/×）
- 靜音切換（Button 1 B/○）
- 倒退 30 秒（Button 4 LB/L1）
- 快轉 30 秒（Button 5 RB/R1）
- 倒退 120 秒（Button 6 LT/L2）
- 快轉 120 秒（Button 7 RT/R2）
- 開關字幕（Button 8 Back/Select）
  - YouTube：點擊 `.ytp-subtitles-button`
  - 其他平台：切換 `<video>` 的 HTML5 `textTracks`
- 劇院 / 一般模式切換（Button 9 Start）
  - YouTube：點擊 `.ytp-size-button`
  - 其他平台：對焦點元素派送鍵盤事件 `T`
- D-pad ↑↓ 音量增減、D-pad ←→ 倒退 / 快轉 10 秒
- 左搖桿 X 軸倒退 / 快轉、Y 軸音量增減
- OSD 操作提示
- 搖桿連接 / 斷開事件處理
