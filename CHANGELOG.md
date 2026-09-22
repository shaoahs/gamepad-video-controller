# Changelog

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
