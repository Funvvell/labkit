// LabKit · stats.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== 统计 =====================
   全部由真实记录 + 真实日期推导。以前这里是两个写死的 7 元素数组，
   图表好看但和实际记录毫无关系；现在删掉了那两个数组。 */
function recDay(r){const m=String(r.at||'').match(/^(\d{4})-(\d{2})-(\d{2})/);return m?m[0]:''}
function focusOn(day){return DB.focusRecords.filter(r=>recDay(r)===day).reduce((s,r)=>s+(+r.minutes||0),0)}
function focusCountOn(day){return DB.focusRecords.filter(r=>recDay(r)===day).length}
function tasksDoneOn(day){return DB.tasks.filter(t=>t.done&&t.doneAt===day).length}
function seriesFocus(n){const a=[];for(let i=n-1;i>=0;i--)a.push(focusOn(daysAgoISO(i)));return a}
function seriesTasks(n){const a=[];for(let i=n-1;i>=0;i--)a.push(tasksDoneOn(daysAgoISO(i)));return a}
function sum(a){return a.reduce((x,y)=>x+y,0)}
function lastDays(n){const a=[];for(let i=n-1;i>=0;i--)a.push(daysAgoISO(i));return a}
function fmtRecAt(r){
  const s=String(r.at||'');
  const m=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}:\d{2}))?/);
  if(!m)return s;
  const day=m[1]+'-'+m[2]+'-'+m[3],t=m[4]||'';
  const d=daysLeft(day);
  const rel=d===0?'今天':d===-1?'昨天':d===-2?'前天':day;
  const end=t?(()=>{const[h,mi]=t.split(':').map(Number);const e=new Date(2000,0,1,h,mi+(+r.minutes||0));return pad2(e.getHours())+':'+pad2(e.getMinutes())})():'';
  return rel+(t?' '+t+(end?'-'+end:''):'');
}

/* esc() 已迁至 util.js（先于本文件加载） */
/* 颜色值直接进 style 属性，只转义不够：攻击者仍可写 background:url(...) 把数据外传。
   故只放行十六进制、rgb()/hsl()、var(--token) 与纯字母命名色，其余回落。
   var(--…) 必须放行：提醒等处的颜色本就是语义 token（entities.js 的紧急度映射）。 */
function cssColor(v,fallback){
  const s=String(v==null?'':v).trim();
  if(/^#[0-9a-fA-F]{3,8}$/.test(s))return s;
  if(/^(rgb|rgba|hsl|hsla)\([0-9a-zA-Z%,.\s+-]+\)$/.test(s))return s;
  if(/^var\(--[a-zA-Z0-9-]+\)$/.test(s))return s;
  if(/^[a-zA-Z]{3,20}$/.test(s))return s;
  return fallback||'currentColor';
}
/* Dashboard 卡片可被用户移除，对应的 DOM 就不存在了。
   所有写入首页卡片的渲染都走这里，卡片不在时安静跳过，不再抛 null 异常。 */
function setHTML(id,html){const el=document.getElementById(id);if(el)el.innerHTML=html;return el}
function setText(id,txt){const el=document.getElementById(id);if(el)el.textContent=txt;return el}
function toast(msg,ms){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),ms||2200)}

