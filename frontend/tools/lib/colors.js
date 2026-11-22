// LabKit · 调色板单源
// 出版图、界面分组、灰度印刷、孔板区域色都在这里定义一次，任何工具都不再各写一份。
// JOURNAL = Okabe-Ito（色盲安全，科学图表事实标准）；界面分组色不用于出版图。
(function () {
  const W = typeof window !== 'undefined' ? window : globalThis;
  const JOURNAL = ['#0072B2', '#D55E00', '#009E73', '#CC79A7', '#E69F00', '#56B4E9', '#F0E442', '#000000'];
  const GRAY = ['#000000', '#555555', '#888888', '#bbbbbb', '#333333', '#666666', '#999999', '#dddddd'];
  // 界面里的分组着色（qPCR 分组、条形图图例）：低饱和、暗色下仍可辨
  const SERIES_UI = ['#007AFF', '#2FA96B', '#F0832A', '#7B5CFF', '#FF453A', '#1FA5B8', '#C86DD7', '#8E8E93'];
  // 孔板区域配色（16 色，顺序固定，保证同一区域多次渲染同色）
  const PLATE = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45',
    '#fabed4', '#469990', '#dcbeff', '#9a6324', '#800000', '#aaffc3', '#808000', '#000075'];
  W.LKColors = { JOURNAL, GRAY, SERIES_UI, PLATE };
})();
