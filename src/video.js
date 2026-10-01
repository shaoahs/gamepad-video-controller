/** 取得頁面上最適合控制的 video 元素（優先選正在播放的） */
export function getTargetVideo() {
  const videos = Array.from(document.querySelectorAll("video"));
  if (videos.length === 0) return null;
  return videos.find(v => !v.paused) || videos[0];
}

/** 安全地調整音量，限制在 0~1 範圍內 */
export function adjustVolume(video, delta) {
  video.volume = Math.min(1, Math.max(0, video.volume + delta));
}
