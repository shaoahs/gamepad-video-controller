/** 顯示短暫的操作提示（OSD） */
export function showOSD(message) {
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
