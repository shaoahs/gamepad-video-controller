import { showOSD } from "./osd.js";

/** 開關字幕 */
export function toggleSubtitles(video) {
  // 優先：YouTube 字幕按鈕
  const ytSubBtn = document.querySelector(".ytp-subtitles-button");
  if (ytSubBtn) {
    ytSubBtn.click();
    showOSD("💬 字幕切換");
    return;
  }

  // 退而：HTML5 textTracks（本地影片、部分平台）
  const tracks = Array.from(video.textTracks);
  if (tracks.length === 0) {
    showOSD("📭 無字幕軌道");
    return;
  }
  const showing = tracks.find(t => t.mode === "showing");
  if (showing) {
    tracks.forEach(t => { t.mode = "hidden"; });
    showOSD("💬 字幕關閉");
  } else {
    tracks[0].mode = "showing";
    showOSD(`💬 字幕開啟：${tracks[0].label || tracks[0].language || "Track 1"}`);
  }
}

/**
 * 劇院 / 一般模式切換
 * 優先點擊 YouTube 劇院按鈕，否則模擬按鍵 T
 */
export function toggleTheaterMode() {
  const ytBtn = document.querySelector(".ytp-size-button");
  if (ytBtn) {
    ytBtn.click();
    showOSD("🎭 劇院模式切換");
    return;
  }
  const evt = new KeyboardEvent("keydown", {
    key: "t", code: "KeyT", keyCode: 84,
    bubbles: true, cancelable: true,
  });
  (document.activeElement || document.body).dispatchEvent(evt);
  showOSD("🎭 劇院模式切換");
}
