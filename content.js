(function() {

//#region src/video.js
/** 取得頁面上最適合控制的 video 元素（優先選正在播放的） */
	function getTargetVideo() {
		const videos = Array.from(document.querySelectorAll("video"));
		if (videos.length === 0) return null;
		return videos.find((v) => !v.paused) || videos[0];
	}
	/** 安全地調整音量，限制在 0~1 範圍內 */
	function adjustVolume(video, delta) {
		video.volume = Math.min(1, Math.max(0, video.volume + delta));
	}

//#endregion
//#region src/config.js
/** 全域設定 */
	const CONFIG = {
		pollInterval: 100,
		axisThreshold: .5,
		seekStep: 10,
		seekStepMid: 30,
		seekStepLong: 120,
		volumeStep: .1,
		buttonCooldown: 300,
		axisCooldown: 200
	};

//#endregion
//#region src/osd.js
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
				transition: "opacity 0.3s"
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

//#endregion
//#region src/controls.js
/** 開關字幕 */
	function toggleSubtitles(video) {
		const ytSubBtn = document.querySelector(".ytp-subtitles-button");
		if (ytSubBtn) {
			ytSubBtn.click();
			showOSD("💬 字幕切換");
			return;
		}
		const tracks = Array.from(video.textTracks);
		if (tracks.length === 0) {
			showOSD("📭 無字幕軌道");
			return;
		}
		if (tracks.find((t) => t.mode === "showing")) {
			tracks.forEach((t) => {
				t.mode = "hidden";
			});
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
	function toggleTheaterMode() {
		const ytBtn = document.querySelector(".ytp-size-button");
		if (ytBtn) {
			ytBtn.click();
			showOSD("🎭 劇院模式切換");
			return;
		}
		const evt = new KeyboardEvent("keydown", {
			key: "t",
			code: "KeyT",
			keyCode: 84,
			bubbles: true,
			cancelable: true
		});
		(document.activeElement || document.body).dispatchEvent(evt);
		showOSD("🎭 劇院模式切換");
	}

//#endregion
//#region src/gamepad.js
	const lastButtonTime = {};
	const lastAxisTime = {};
	/** 處理單一按鈕事件 */
	function handleButton(index, video) {
		const now = Date.now();
		if (now - (lastButtonTime[index] || 0) < CONFIG.buttonCooldown) return;
		lastButtonTime[index] = now;
		switch (index) {
			case 0:
				if (video.paused) {
					video.play();
					showOSD("▶ 播放");
				} else {
					video.pause();
					showOSD("⏸ 暫停");
				}
				break;
			case 1:
				video.muted = !video.muted;
				showOSD(video.muted ? "🔇 靜音" : "🔊 取消靜音");
				break;
			case 4:
				video.currentTime -= CONFIG.seekStepMid;
				showOSD(`⏪ -${CONFIG.seekStepMid}s`);
				break;
			case 5:
				video.currentTime += CONFIG.seekStepMid;
				showOSD(`⏩ +${CONFIG.seekStepMid}s`);
				break;
			case 6:
				video.currentTime -= CONFIG.seekStepLong;
				showOSD(`⏪ -${CONFIG.seekStepLong}s`);
				break;
			case 7:
				video.currentTime += CONFIG.seekStepLong;
				showOSD(`⏩ +${CONFIG.seekStepLong}s`);
				break;
			case 8:
				toggleSubtitles(video);
				break;
			case 9:
				toggleTheaterMode();
				break;
			case 12:
				adjustVolume(video, CONFIG.volumeStep);
				showOSD(`🔊 音量 ${Math.round(video.volume * 100)}%`);
				break;
			case 13:
				adjustVolume(video, -CONFIG.volumeStep);
				showOSD(`🔉 音量 ${Math.round(video.volume * 100)}%`);
				break;
			case 14:
				video.currentTime -= CONFIG.seekStep;
				showOSD(`⏪ -${CONFIG.seekStep}s`);
				break;
			case 15:
				video.currentTime += CONFIG.seekStep;
				showOSD(`⏩ +${CONFIG.seekStep}s`);
		}
	}
	/** 處理搖桿軸事件 */
	function handleAxes(axes, video) {
		const now = Date.now();
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

//#endregion
//#region src/index.js
	let animFrameId = null;
	let lastPoll = 0;
	const connectedGamepads = /* @__PURE__ */ new Set();
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
		if (!animFrameId) animFrameId = requestAnimationFrame(poll);
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
	if (navigator.getGamepads().some((gp) => gp !== null)) startPolling();

//#endregion
})();