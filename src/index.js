import { getTargetVideo } from "./video.js";
import { handleButton, handleAxes } from "./gamepad.js";
import { showOSD } from "./osd.js";
import { CONFIG } from "./config.js";

"use strict";

let animFrameId = null;
let lastPoll = 0;
const connectedGamepads = new Set();

function poll(timestamp) {
  animFrameId = requestAnimationFrame(poll);

  if (timestamp - lastPoll < CONFIG.pollInterval) return;
  lastPoll = timestamp;

  const gamepads = navigator.getGamepads();
  let hasConnected = false;

  for (const gp of gamepads) {
    if (!gp) continue;
    hasConnected = true;

    const video = getTargetVideo();
    if (!video) continue;

    gp.buttons.forEach((btn, index) => {
      if (btn.pressed) handleButton(index, video);
    });

    handleAxes(gp.axes, video);
  }

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

window.addEventListener("gamepadconnected", (e) => {
  connectedGamepads.add(e.gamepad.index);
  console.log(`[GVC] 搖桿已連接: ${e.gamepad.id} (index ${e.gamepad.index})`);
  showOSD("🎮 搖桿已連接");
  startPolling();
});

window.addEventListener("gamepaddisconnected", (e) => {
  connectedGamepads.delete(e.gamepad.index);
  console.log(`[GVC] 搖桿已斷開: ${e.gamepad.id}`);
  if (connectedGamepads.size === 0) showOSD("🎮 搖桿已斷開");
});

// 頁面載入時若搖桿已連接
if (navigator.getGamepads().some(gp => gp !== null)) {
  startPolling();
}
