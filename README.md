# Gamepad Video Controller

使用搖桿（Xbox / PS / Switch Pro 等）控制瀏覽器內任意網頁上的影片播放。

## 按鍵對應

| 按鈕 | Xbox | PlayStation | 動作 |
|------|------|-------------|------|
| Button 0 | A | × | 播放 / 暫停 |
| Button 1 | B | ○ | 靜音切換 |
| Button 4 | LB | L1 | 倒退 30 秒 |
| Button 5 | RB | R1 | 快轉 30 秒 |
| Button 6 | LT | L2 | 倒退 120 秒 |
| Button 7 | RT | R2 | 快轉 120 秒 |
| Button 8 | Back | Select | 開關字幕 |
| Button 9 | Start | Start | 劇院 / 一般模式切換 |
| D-pad ↑ | | | 音量 +10% |
| D-pad ↓ | | | 音量 -10% |
| D-pad ← | | | 倒退 10 秒 |
| D-pad → | | | 快轉 10 秒 |
| 左搖桿 左/右 | | | 倒退 / 快轉 10 秒 |
| 左搖桿 上/下 | | | 音量增減 |

## 字幕說明

Button 8 的字幕開關行為：

- **YouTube**：直接點擊 YouTube 播放器的字幕按鈕（`.ytp-subtitles-button`）
- **其他平台**：切換影片的 HTML5 字幕軌道（`<video>` 的 `textTracks`）；若平台使用自製字幕 overlay 則無效

## 劇院模式說明

Button 9 的模式切換行為：

- **YouTube**：直接點擊 YouTube 播放器的尺寸切換按鈕（`.ytp-size-button`）
- **其他平台**：對焦點元素派送鍵盤事件 `T`（部分影音平台的劇院模式快捷鍵）

## 安裝（Firefox 109+）

1. 開啟 `about:debugging`
2. 點選「此 Firefox」→「載入暫時性附加元件」
3. 選擇此資料夾內的 `manifest.json`

打包成 `.xpi` 永久安裝：

```bash
zip -r ../gamepad-video-controller.xpi . -x "src/*" "node_modules/*" "*.config.js" "package.json" "bun.lock" "tsconfig.json" ".gitignore"
```

## 設定調整

編輯 `src/config.js`：

```js
export const CONFIG = {
  pollInterval: 100,     // polling 間隔（毫秒），越小越靈敏但耗 CPU
  axisThreshold: 0.5,    // 搖桿軸觸發閾值（0.0 ~ 1.0）
  seekStep: 10,          // D-pad / 搖桿軸快轉 / 倒退秒數
  seekStepMid: 30,       // LB / RB 快轉 / 倒退秒數
  seekStepLong: 120,     // LT / RT 快轉 / 倒退秒數
  volumeStep: 0.1,       // 音量調整幅度（0.1 = 10%）
  buttonCooldown: 300,   // 按鈕防重複觸發（毫秒）
  axisCooldown: 200,     // 軸防重複觸發（毫秒）
};
```

修改後執行 `bun run build` 重新打包。

## 開發

```bash
# 安裝依賴
bun install

# 打包（輸出至 content.js）
bun run build

# 監聽檔案變更自動重新打包
bun run watch
```

## 檔案結構

```
gamepad-video-controller/
├── src/
│   ├── index.js       # 入口、搖桿連接事件
│   ├── config.js      # 全域設定常數
│   ├── osd.js         # OSD 操作提示
│   ├── video.js       # 影片元素工具函式
│   ├── controls.js    # 字幕與劇院模式切換
│   └── gamepad.js     # 按鈕與搖桿軸事件處理
├── manifest.json      # 擴充功能設定
├── content.js         # 打包輸出（勿手動編輯）
├── rolldown.config.js # 打包設定
├── package.json
├── CHANGELOG.md
└── README.md
```
