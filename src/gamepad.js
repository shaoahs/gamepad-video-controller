import { CONFIG } from "./config.js";
import { showOSD } from "./osd.js";
import { adjustVolume } from "./video.js";
import { toggleSubtitles, toggleTheaterMode } from "./controls.js";

const lastButtonTime = {};
const lastAxisTime = {};

/** 處理單一按鈕事件 */
export function handleButton(index, video) {
  const now = Date.now();
  if (now - (lastButtonTime[index] || 0) < CONFIG.buttonCooldown) return;
  lastButtonTime[index] = now;

  switch (index) {
    case 0: // A / ×  → 播放/暫停
      if (video.paused) { video.play(); showOSD("▶ 播放"); }
      else { video.pause(); showOSD("⏸ 暫停"); }
      break;
    case 1: // B / ○  → 靜音切換
      video.muted = !video.muted;
      showOSD(video.muted ? "🔇 靜音" : "🔊 取消靜音");
      break;
    case 4: // LB / L1 → 倒退 30s
      video.currentTime -= CONFIG.seekStepMid;
      showOSD(`⏪ -${CONFIG.seekStepMid}s`);
      break;
    case 5: // RB / R1 → 快轉 30s
      video.currentTime += CONFIG.seekStepMid;
      showOSD(`⏩ +${CONFIG.seekStepMid}s`);
      break;
    case 6: // LT / L2 → 倒退 120s
      video.currentTime -= CONFIG.seekStepLong;
      showOSD(`⏪ -${CONFIG.seekStepLong}s`);
      break;
    case 7: // RT / R2 → 快轉 120s
      video.currentTime += CONFIG.seekStepLong;
      showOSD(`⏩ +${CONFIG.seekStepLong}s`);
      break;
    case 8: // Back / Select → 開關字幕
      toggleSubtitles(video);
      break;
    case 9: // Start → 劇院 / 一般模式切換
      toggleTheaterMode();
      break;
    case 12: // D-pad ↑ → 音量 +10%
      adjustVolume(video, CONFIG.volumeStep);
      showOSD(`🔊 音量 ${Math.round(video.volume * 100)}%`);
      break;
    case 13: // D-pad ↓ → 音量 -10%
      adjustVolume(video, -CONFIG.volumeStep);
      showOSD(`🔉 音量 ${Math.round(video.volume * 100)}%`);
      break;
    case 14: // D-pad ← → 倒退 10s
      video.currentTime -= CONFIG.seekStep;
      showOSD(`⏪ -${CONFIG.seekStep}s`);
      break;
    case 15: // D-pad → → 快轉 10s
      video.currentTime += CONFIG.seekStep;
      showOSD(`⏩ +${CONFIG.seekStep}s`);
      break;
  }
}

/** 處理搖桿軸事件 */
export function handleAxes(axes, video) {
  const now = Date.now();

  // axes[0]：左搖桿 左(-) / 右(+)
  const axisX = axes[0];
  if (Math.abs(axisX) > CONFIG.axisThreshold) {
    const key = axisX > 0 ? "x+" : "x-";
    if (now - (lastAxisTime[key] || 0) > CONFIG.axisCooldown) {
      lastAxisTime[key] = now;
      const delta = axisX > 0 ? CONFIG.seekStep : -CONFIG.seekStep;
      video.currentTime += delta;
      showOSD(delta > 0 ? `⏩ +${CONFIG.seekStep}s` : `⏪ -${CONFIG.seekStep}s`);
    }
  }

  // axes[1]：左搖桿 上(-) / 下(+)
  const axisY = axes[1];
  if (Math.abs(axisY) > CONFIG.axisThreshold) {
    const key = axisY > 0 ? "y+" : "y-";
    if (now - (lastAxisTime[key] || 0) > CONFIG.axisCooldown) {
      lastAxisTime[key] = now;
      const delta = axisY > 0 ? -CONFIG.volumeStep : CONFIG.volumeStep;
      adjustVolume(video, delta);
      showOSD(`${delta > 0 ? "🔊" : "🔉"} 音量 ${Math.round(video.volume * 100)}%`);
    }
  }
}
