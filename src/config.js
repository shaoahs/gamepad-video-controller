/** 全域設定 */
export const CONFIG = {
  pollInterval: 100,    // polling 間隔（毫秒）
  axisThreshold: 0.5,   // 搖桿軸觸發閾值（0.0 ~ 1.0）
  seekStep: 10,         // 搖桿軸 / D-pad 快轉/倒退秒數
  seekStepMid: 30,      // LB/RB 快轉/倒退秒數
  seekStepLong: 120,    // LT/RT 快轉/倒退秒數
  volumeStep: 0.1,      // 音量調整幅度
  buttonCooldown: 300,  // 按鈕防重複觸發（毫秒）
  axisCooldown: 200,    // 軸防重複觸發（毫秒）
};
