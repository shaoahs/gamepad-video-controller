/**
 * Gamepad Video Controller - content.js
 *
 * 按鈕對應（Xbox / PS 通用佈局）：
 *   Button 0  (A / ×)      → 播放 / 暫停
 *   Button 1  (B / ○)      → 靜音切換
 *   Button 4  (LB / L1)    → 倒退 30 秒
 *   Button 5  (RB / R1)    → 快轉 30 秒
 *   Button 6  (LT / L2)    → 倒退 120 秒
 *   Button 7  (RT / R2)    → 快轉 120 秒
 *   Button 8  (Back/Select)→ 開關字幕
 *   Button 9  (Start)      → 播放方式切換（劇院 / 一般）
 *   Button 12 (D-pad ↑)    → 音量 +10%
 *   Button 13 (D-pad ↓)    → 音量 -10%
 *   Button 14 (D-pad ←)    → 倒退 10 秒
 *   Button 15 (D-pad →)    → 快轉 10 秒
 *
 * 左搖桿軸：
 *   axes[0] 左/右          → 倒退 / 快轉（傾斜超過閾值時）
 *   axes[1] 上/下          → 音量增減（傾斜超過閾值時）
 */

(function () {
  "use strict";

  // ── 設定 ────────────────────────────────────────────────────────────────
  const CONFIG = {
    pollInterval: 100,        // polling 間隔（毫秒），降低 CPU 使用
    axisThreshold: 0.5,       // 搖桿軸觸發閾值（0.0 ~ 1.0）
    seekStep: 10,             // 搖桿軸 / D-pad 快轉/倒退秒數
    seekStepMid: 30,          // LB/RB 快轉/倒退秒數
    seekStepLong: 120,        // LT/RT 快轉/倒退秒數
    volumeStep: 0.1,          // 音量調整幅度
    buttonCooldown: 300,      // 按鈕防重複觸發（毫秒）
    axisCooldown: 200,        // 軸防重複觸發（毫秒）
  };

  // ── 狀態 ─────────────────────────────────────────────────────────────────
  let animFrameId = null;
  let lastButtonTime = {};    // { buttonIndex: timestamp }
  let lastAxisTime = {};      // { axisKey: timestamp }
  let connectedGamepads = new Set();

  // ── 工具函式 ──────────────────────────────────────────────────────────────

  /** 取得頁面上最適合控制的 video 元素（優先選正在播放的） */
  function getTargetVideo() {
    const videos = Array.from(document.querySelectorAll("video"));
    if (videos.length === 0) return null;
    return videos.find(v => !v.paused) || videos[0];
  }

  /** 安全地調整音量，限制在 0~1 範圍內 */
  function adjustVolume(video, delta) {
    video.volume = Math.min(1, Math.max(0, video.volume + delta));
  }

  /** 顯示短暫的操作提示（OSD） */
  function showOSD(message) {
    let osd = document.getElementById("gvc-osd");
    if (!osd) {
      osd = document.createElement("div");
      osd.id = "gvc-osd";
      Object.assign(osd.style, {
        position: "fixed",
        bottom: "60px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.75)",
        color: "#fff",
        padding: "8px 18px",
        borderRadius: "6px",
        fontSize: "16px",
        fontFamily: "sans-serif",
        zIndex: "999999",
        pointerEvents: "none",
        transition: "opacity 0.3s",
      });
      document.body.appendChild(osd);
    }

    osd.textContent = message;
    osd.style.opacity = "1";

    clearTimeout(osd._hideTimer);
    osd._hideTimer = setTimeout(() => {
      osd.style.opacity = "0";
    }, 1500);
  }

  // ── 字幕開關 ──────────────────────────────────────────────────────────────

  function toggleSubtitles(video) {
    // 優先：YouTube 字幕按鈕（自製 overlay，textTracks 無效）
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

  // ── 劇院 / 一般模式切換 ───────────────────────────────────────────────────

  /**
   * 以「點擊劇院模式按鈕」為優先；若找不到對應元素則
   * 退而模擬按下鍵盤 T 鍵（YouTube 劇院模式快捷鍵）。
   */
  function toggleTheaterMode() {
    // YouTube：.ytp-size-button（劇院/一般切換按鈕）
    const ytBtn = document.querySelector(".ytp-size-button");
    if (ytBtn) {
      ytBtn.click();
      showOSD("🎭 劇院模式切換");
      return;
    }
    // 其他網站：嘗試發送鍵盤事件 T
    const evt = new KeyboardEvent("keydown", {
      key: "t", code: "KeyT", keyCode: 84,
      bubbles: true, cancelable: true,
    });
    (document.activeElement || document.body).dispatchEvent(evt);
    showOSD("🎭 劇院模式切換");
  }

  // ── 按鈕處理 ──────────────────────────────────────────────────────────────

  function handleButton(index, video) {
    const now = Date.now();
    if (now - (lastButtonTime[index] || 0) < CONFIG.buttonCooldown) return;
    lastButtonTime[index] = now;

    switch (index) {
      case 0: // A / ×  → 播放/暫停
        if (video.paused) {
          video.play();
          showOSD("▶ 播放");
        } else {
          video.pause();
          showOSD("⏸ 暫停");
        }
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

  // ── 搖桿軸處理 ────────────────────────────────────────────────────────────

  function handleAxes(axes, video) {
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
        const delta = axisY > 0 ? -CONFIG.volumeStep : CONFIG.volumeStep; // 上 = 音量+
        adjustVolume(video, delta);
        showOSD(`${delta > 0 ? "🔊" : "🔉"} 音量 ${Math.round(video.volume * 100)}%`);
      }
    }
  }

  // ── 主要 polling loop ─────────────────────────────────────────────────────

  let lastPoll = 0;

  function poll(timestamp) {
    animFrameId = requestAnimationFrame(poll);

    // 限制 polling 頻率
    if (timestamp - lastPoll < CONFIG.pollInterval) return;
    lastPoll = timestamp;

    const gamepads = navigator.getGamepads();
    let hasConnected = false;

    for (const gp of gamepads) {
      if (!gp) continue;
      hasConnected = true;

      const video = getTargetVideo();
      if (!video) continue;

      // 處理所有按鈕
      gp.buttons.forEach((btn, index) => {
        if (btn.pressed) {
          handleButton(index, video);
        }
      });

      // 處理搖桿軸
      handleAxes(gp.axes, video);
    }

    // 如果沒有搖桿連接，停止 loop 等待事件喚醒
    if (!hasConnected && connectedGamepads.size === 0) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  function startPolling() {
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(poll);
    }
  }

  // ── 搖桿連接/斷開事件 ─────────────────────────────────────────────────────

  window.addEventListener("gamepadconnected", (e) => {
    connectedGamepads.add(e.gamepad.index);
    console.log(`[GVC] 搖桿已連接: ${e.gamepad.id} (index ${e.gamepad.index})`);
    showOSD(`🎮 搖桿已連接`);
    startPolling();
  });

  window.addEventListener("gamepaddisconnected", (e) => {
    connectedGamepads.delete(e.gamepad.index);
    console.log(`[GVC] 搖桿已斷開: ${e.gamepad.id}`);
    if (connectedGamepads.size === 0) {
      showOSD("🎮 搖桿已斷開");
    }
  });

  // 頁面載入時若搖桿已連接（部分瀏覽器不發 gamepadconnected 事件）
  if (navigator.getGamepads().some(gp => gp !== null)) {
    startPolling();
  }

})();
