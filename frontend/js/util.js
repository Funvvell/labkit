// LabKit · util.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== Icons (inline SVG) ===================== */
const IC = {
  crop:'<svg viewBox="0 0 24 24" fill="none"><path d="M6 3V17C6 18.1 6.9 19 8 19H21M3 6H17C18.1 6 19 6.9 19 8V21" stroke="#007AFF" stroke-width="2" stroke-linecap="round"/></svg>',
  convert:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 8H17L14 5M20 16H7L10 19" stroke="#7B5CFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  rename:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 7H14M4 12H20M4 17H11" stroke="#2FA96B" stroke-width="2" stroke-linecap="round"/><path d="M17 6L21 10L17 14" stroke="#2FA96B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ocr:'<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="14" rx="2" stroke="#F0832A" stroke-width="1.9"/><path d="M7 10H15M7 14H12" stroke="#F0832A" stroke-width="1.9" stroke-linecap="round"/></svg>',
  cutout:'<svg viewBox="0 0 24 24" fill="none"><path d="M16 13L13 16L16 19M28 13L31 16L28 19" stroke="#7B5CFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="22" cy="22" r="3" stroke="#7B5CFF" stroke-width="2"/></svg>',
  resize:'<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="7" width="14" height="11" rx="2" stroke="#007AFF" stroke-width="1.9"/><path d="M8 11V14M6.5 12.5H9.5" stroke="#007AFF" stroke-width="1.5" stroke-linecap="round"/></svg>',
  merge:'<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="9" height="12" rx="2" stroke="#2FA96B" stroke-width="1.8"/><rect x="11" y="8" width="9" height="12" rx="2" fill="#fff" stroke="#2FA96B" stroke-width="1.8"/></svg>',
  clean:'<svg viewBox="0 0 24 24" fill="none"><path d="M5 7H18M8 12H20M6 17H15" stroke="#4A7BFF" stroke-width="2" stroke-linecap="round"/></svg>',
  json:'<svg viewBox="0 0 24 24" fill="none"><path d="M8 4C5 4 5 12 3 12C5 12 5 20 8 20M16 4C19 4 19 12 21 12C19 12 19 20 16 20" stroke="#7B5CFF" stroke-width="1.9" stroke-linecap="round"/></svg>',
  regex:'<svg viewBox="0 0 24 24" fill="none"><circle cx="7" cy="17" r="2" fill="#1FA5B8"/><path d="M12 17H15M18 7L13 19" stroke="#1FA5B8" stroke-width="2" stroke-linecap="round"/></svg>',
  qpcr:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 19V9M10 19V5M16 19V11M22 19V7" stroke="#30D158" stroke-width="2" stroke-linecap="round"/></svg>',
  system:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#8E8E93" stroke-width="1.8"/><path d="M12 3V5.5M12 18.5V21M3 12H5.5M18.5 12H21M5.6 5.6L7.4 7.4M16.6 16.6L18.4 18.4M18.4 5.6L16.6 7.4M7.4 16.6L5.6 18.4" stroke="#8E8E93" stroke-width="1.8" stroke-linecap="round"/></svg>'
};

/* ===================== 日期工具 =====================
   统计要按真实日期算，所以这些必须在 DB 种子之前定义。 */
function pad2(n){return String(n).padStart(2,'0')}
function dayISO(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())}
function todayStr(){return dayISO(new Date())}
function daysAgoISO(n){const d=new Date();d.setDate(d.getDate()-n);return dayISO(d)}
function nowStamp(){const d=new Date();return dayISO(d)+'T'+pad2(d.getHours())+':'+pad2(d.getMinutes())}
function uid(p){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function daysLeft(s){
  const m=String(s||'').match(/(\d{4})-(\d{2})-(\d{2})/);if(!m)return null;
  const t=new Date(+m[1],+m[2]-1,+m[3]);const n=new Date();n.setHours(0,0,0,0);
  return Math.round((t-n)/86400000);
}

