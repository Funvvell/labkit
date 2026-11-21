// LabKit · dashboard.js — P2 尺寸化卡片 + gridstack 自由拼接（classic script，零构建）
/* ===================== Dashboard 卡片体系 =====================
   卡片 = 注册表里的一项，声明支持的尺寸档 sizes；布局 v2 = {v:2,nodes:[{id,x,y,w,h}]}，
   存 localStorage（同一 DASH_KEY）。宽 1/2/4 列 × 高 1/2/3/4 行（行单位约 150px）。
   主渲染器用 vendor 的 gridstack（MIT，window.GridStack）：编辑态自由拖拽/右下角改尺寸，
   非编辑态静态展示。GridStack 不可用时回退旧的顺序网格渲染器（保留一个版本周期）。
   老布局（[{id,size}] 或 s/m/l 三档）按顺序行扫描自动落位迁移，保序保尺寸。 */
const DASH_KEY='labkit.dash.v1';
const WCOLS=[1,2,4],HROWS=[1,2,3,4];
/* 旧布局用的是 s/m/l 三档，读到老数据时映射到最接近的规范尺寸，不让用户的布局丢失 */
const LEGACY_SZ={s:'1x2',m:'2x2',l:'4x2'};
function parseSize(s){
  const m=String(s||'').match(/^([124])x([1234])$/);
  return m?{w:+m[1],h:+m[2]}:null;
}
function normSize(id,s){
  const p=parseSize(s)||parseSize(LEGACY_SZ[s]);
  return p?p.w+'x'+p.h:WIDGETS[id].size;
}
function sizeLabel(s){return s.replace('x','×')}
/* 尺寸档：mini(1x1) / small(1x2,2x1) / medium(2x2,2x3,1x3…) / large(≥4x2,2x4)。
   不传 size 时按 medium 处理，兼容旧的无参调用。 */
function sizeTier(size){
  const a=size?(size.w*size.h):4;
  return a<=1?'mini':a<=2?'small':a<8?'medium':'large';
}
/* 把任意 w/h 吸附到该卡声明的尺寸组合：先夹到规范格，再找曼哈顿距离最近的声明档 */
function snapSize(id,w,h){
  w=WCOLS.includes(+w)?+w:WCOLS.reduce((b,c)=>Math.abs(c-w)<Math.abs(b-w)?c:b);
  h=HROWS.includes(+h)?+h:HROWS.reduce((b,c)=>Math.abs(c-h)<Math.abs(b-h)?c:b);
  const sizes=(WIDGETS[id]&&WIDGETS[id].sizes)||[WIDGETS[id].size];
  if(sizes.includes(w+'x'+h))return{w,h};
  let best=null,bd=1e9;
  sizes.forEach(s=>{const p=parseSize(s);if(!p)return;const d=Math.abs(p.w-w)+Math.abs(p.h-h);if(d<bd){bd=d;best=p}});
  return best||{w,h};
}
const GRIP='<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="6" cy="3" r="1.25"/><circle cx="10" cy="3" r="1.25"/><circle cx="6" cy="8" r="1.25"/><circle cx="10" cy="8" r="1.25"/><circle cx="6" cy="13" r="1.25"/><circle cx="10" cy="13" r="1.25"/></svg>';

/* ---- 卡片正文渲染器：均接受 (el,size)，按尺寸档输出不同密度的内容 ---- */
function renderReagentsCard(el,size){
  const t=sizeTier(size);
  const warn=DB.reagents.filter(r=>{const d=daysLeft(r.exp);return (d!==null&&d<=30)||(parseInt(r.left)||100)<=20}).length;
  if(t==='mini'){setHTML('reagentCard',`<div class="big-num">${DB.reagents.length}</div><div class="sub">在库试剂${warn?' · '+warn+' 项预警':' · 状态良好'}</div>`);return}
  const rows=DB.reagents.slice(0,t==='small'?3:DB.reagents.length).map((r,i)=>{
    const d=daysLeft(r.exp);
    const pill=d===null?'':d<0?'<span class="warn-pill red">已过期</span>':d<=30?`<span class="warn-pill orange">${d}天到期</span>`:'';
    const low=(parseInt(r.left)||100)<=20?'<span class="warn-pill red">余量低</span>':'';
    return `<div class="mini-row"><span class="nm" title="${esc(r.loc)} · 有效期 ${esc(r.exp)}">${esc(r.name)}</span>${pill}${low}<span class="mt">${esc(r.left)}</span><button class="x" data-del-reagent="${i}" title="移除">×</button></div>`;
  }).join('');
  setHTML('reagentCard',rows||'<div class="sub">暂无试剂，点右上角入库</div>');
  document.querySelectorAll('[data-del-reagent]').forEach(b=>b.onclick=()=>{DB.reagents.splice(+b.dataset.delReagent,1);saveDB();refreshHome();renderLab()});
}
function renderBookingCard(el,size){
  const t=sizeTier(size);
  const today=DB.bookings.filter(b=>daysLeft(b.date)===0).length;
  if(t==='mini'){setHTML('bookingCard',`<div class="big-num">${DB.bookings.length}</div><div class="sub">预约机时${today?' · 今天 '+today+' 台':''}</div>`);return}
  const rows=DB.bookings.slice(0,t==='small'?2:DB.bookings.length).map((b,i)=>{
    const d=daysLeft(b.date);
    const when=d===0?'今天':d===1?'明天':(d!==null&&d>0?d+'天后':b.date);
    return `<div class="mini-row"><span class="nm" title="${esc(b.proj||'')}">${esc(b.inst)}</span><span class="mt">${esc(b.slot)}</span><span class="warn-pill ${d!==null&&d<=1?'orange':'green'}">${esc(when)}</span><button class="x" data-del-book="${i}" title="取消预约">×</button></div>`;
  }).join('');
  setHTML('bookingCard',rows||'<div class="sub">暂无预约，点右上角预约机时</div>');
  document.querySelectorAll('[data-del-book]').forEach(b=>b.onclick=()=>{DB.bookings.splice(+b.dataset.delBook,1);saveDB();refreshHome()});
}
function renderBudgetCard(el,size){
  const t=sizeTier(size);
  const used=DB.budget.reduce((s,b)=>s+(+b.amount||0),0),total=+DB.budgetTotal||0;
  const pct=total?Math.min(100,Math.round(used/total*100)):0;
  const head=`<div class="big-num">¥${used.toLocaleString()}</div>
    <div class="sub">已用 ${pct}% · 预算 ¥${total.toLocaleString()} · 余 ¥${Math.max(0,total-used).toLocaleString()}</div>`;
  if(t==='mini'){setHTML('budgetCard',head);return}
  const bar=`<div class="progress"><div class="progress-fill" style="width:${pct}%;background:${pct>=90?'var(--red)':pct>=70?'var(--orange)':'var(--accent)'}"></div></div>
    ${pct>=90?'<div class="warn-pill red">预算即将超支</div>':''}`;
  if(t==='small'){setHTML('budgetCard',head+bar);return}
  setHTML('budgetCard',head+bar+`<div style="margin-top:2px">${DB.budget.slice(0,3).map(b=>`<div class="mini-row"><span class="nm">${esc(b.item)}</span><span class="mt">¥${(+b.amount||0).toLocaleString()}</span></div>`).join('')||'<div class="sub">还没有支出记录</div>'}</div>`);
}
function renderNotesCard(el,size){
  const t=sizeTier(size);
  if(t==='mini'){setHTML('notesCard',`<div class="big-num">${DB.notes.length}</div><div class="sub">条实验速记</div>`);return}
  setHTML('notesCard',DB.notes.slice(0,t==='small'?1:3).map(n=>`<div class="note-card"><div class="tm">${esc(n.at)}</div>${esc(n.text)}</div>`).join('')||'<div class="sub">随手记下实验现象与排查思路</div>');
}
function collectDeadlines(){
  const out=[],seen=new Set();
  const push=(text,date,d)=>{
    /* 同一件事可能同时来自手动提醒和试剂台账（如「逆转录试剂盒过期」），
       按「名称+剩余天数」去重，避免倒计时里出现两条一模一样的条目。 */
    const key=text.replace(/\s|过期|到期/g,'')+'@'+(d===null?date:d);
    if(seen.has(key))return;seen.add(key);
    out.push({text,date,d});
  };
  DB.reminders.forEach(r=>{
    let d=daysLeft(r.date);
    if(d===null){const m=String(r.date).match(/^(\d{1,2})-(\d{1,2})$/);if(m)d=daysLeft(new Date().getFullYear()+'-'+m[1].padStart(2,'0')+'-'+m[2].padStart(2,'0'))}
    push(r.text,r.date,d);
  });
  DB.reagents.forEach(r=>{const d=daysLeft(r.exp);if(d!==null&&d<=45)push(r.name+' 过期',r.exp,d)});
  DB.projects.forEach(p=>{const m=String(p.end||'').match(/^(\d{4})-(\d{2})$/);if(!m)return;
    const d=daysLeft(m[1]+'-'+m[2]+'-28');if(d!==null&&d<=90)push(p.name+' 结题',p.end,d)});
  return out.filter(x=>x.d===null||x.d>=-7).sort((a,b)=>(a.d===null?9999:a.d)-(b.d===null?9999:b.d));
}
function renderDeadlineCard(el,size){
  const t=sizeTier(size);
  const list=collectDeadlines().slice(0,t==='mini'?1:t==='small'?3:6);
  setHTML('deadlineCard',list.map(x=>{
    const cls=x.d===null?'':x.d<0?'red':x.d<=7?'orange':'green';
    const txt=x.d===null?x.date:x.d<0?'逾期'+(-x.d)+'天':x.d===0?'今天':x.d+'天';
    return `<div class="mini-row"><span class="nm">${esc(x.text)}</span><span class="warn-pill ${cls||'green'}">${esc(txt)}</span></div>`;
  }).join('')||'<div class="sub">近期没有截止事项</div>');
}
function renderHeatCard(el,size){
  const days=lastDays(7),v=seriesFocus(7),mx=Math.max(1,...v);
  /* 标签跟着真实日期走：这是「近 7 天」滚动窗口，不是固定的周一到周日 */
  const lbl=days.map(d=>{const dt=new Date(d+'T00:00');return '日一二三四五六'[dt.getDay()]});
  const cells=`<div class="heat-row">${v.map((x,i)=>`<div class="heat-cell" title="${days[i]} · ${x} 分钟" style="background:rgba(0,122,255,${(0.10+0.75*x/mx).toFixed(3)})"></div>`).join('')}</div>`;
  if(sizeTier(size)==='mini'){setHTML('heatCard',cells);return}
  setHTML('heatCard',cells+`<div class="heat-lbl">${lbl.map(d=>`<span>${d}</span>`).join('')}</div>
    <div class="sub" style="margin-top:6px">近 7 天合计 ${sum(v)} 分钟</div>`);
}
function renderSlidesCard(el,size){
  const t=sizeTier(size),all=DB.recentSlides||[];
  if(t==='mini'){setHTML('slidesCard',`<div class="big-num">${all.length}</div><div class="sub">张最近切片</div>`);return}
  const rows=all.slice(0,t==='small'?1:4).map((s,i)=>`<div class="mini-row"><span class="nm" title="${esc(s.path)}">${esc(s.name)}</span><button class="card-act" data-open-slide="${i}">打开</button></div>`).join('');
  setHTML('slidesCard',rows||'<div class="sub">还没有打开过切片</div>');
  document.querySelectorAll('[data-open-slide]').forEach(b=>b.onclick=()=>{
    const s=DB.recentSlides[+b.dataset.openSlide];if(!s)return;
    openView('crop');openSlidePath(s.path);
  });
}
/* 「科研工具」卡片：不再硬编码 6 个入口，改为跟随工具箱配置
   固定 → 最近 → 工具箱顺序补足；隐藏的工具不出现（否则刚隐藏又在首页冒出来）。 */
function toolCardEntries(n) {
  const metas = window.TOOL_META || [];
  if (typeof toolboxPickEntries === 'function') {
    return toolboxPickEntries(
      metas,
      (typeof toolboxRaw === 'function') ? toolboxRaw() : null,
      Store.pins().filter(p => p.kind === 'tool').map(p => p.id),
      Store.recent() || [],
      n,
    );
  }
  return metas.slice(0, n);
}
function renderToolsCard(){
  const list = toolCardEntries(6);
  const bento = list.map(t => `<div class="bento-card" data-tool-id="${esc(t.id)}"><b>${esc(t.name)}</b><p>${esc(t.desc||'')}</p></div>`).join('')
    || '<div class="sub">工具箱里暂时没有可显示的工具</div>';
  setHTML('toolsCard', `<div class="bento">${bento}</div><div class="bento-more"><button class="card-act" type="button" data-goto="toolhub">管理工具 ›</button></div>`);
}
function renderQpcrCard(){
  const n=(qState&&qState.wells&&qState.wells.length)||0;
  setHTML('qpcrCard',`<div class="big-num">${n}</div><div class="sub">当前工作台孔位${n?' · 可直接进入分析':' · 支持 CSV / Excel / 仪器原始文件'}</div>`);
}

/* ---- 卡片注册表：sizes 声明支持的尺寸档；body(size)/render(el,size) 按档输出 ---- */
const WIDGETS={
  kpi:{title:'数据总览',desc:'KPI + 近 7 天趋势',size:'4x2',sizes:['4x2','4x3','4x4'],
    body:size=>`<div class="kpi-row" id="kpiRow"></div><div class="chart-row"><div class="chart-box"><div class="chart-title">近 7 天专注时长（分钟）</div><div id="chartFocus"></div></div><div class="chart-box"><div class="chart-title">近 7 天任务完成趋势</div><div id="chartTasks"></div></div></div>${size&&size.h>=3?'<div id="kpiExtra"></div>':''}`,
    render:(el,size)=>{renderKpi();if(size&&size.h>=3)setHTML('kpiExtra',`<div class="mini-row"><span class="nm">近 7 天专注合计</span><span class="mt">${sum(seriesFocus(7))} 分钟</span></div><div class="mini-row"><span class="nm">近 7 天完成任务</span><span class="mt">${sum(seriesTasks(7))} 项</span></div><div class="mini-row"><span class="nm">实验记录总数</span><span class="mt">${DB.experiments.length} 条</span></div>`)}},
  trend:{title:'近 7 天趋势',desc:'专注时长与任务完成',size:'2x2',sizes:['2x2','2x3','2x4','4x2','4x3','4x4'],
    body:()=>`<div class="chart-box"><div class="chart-title">专注时长（分钟）</div><div id="chartFocus2"></div></div><div class="chart-box"><div class="chart-title">任务完成</div><div id="chartTasks2"></div></div>`,
    render:(el,size)=>{const w=size&&size.w>=4?520:300,h=90+((size?size.h:2)-2)*46;setHTML('chartFocus2',lineChart(seriesFocus(7),w,h,'#007AFF'));setHTML('chartTasks2',lineChart(seriesTasks(7),w,h,'#30D158'))}},
  tasks:{title:'今日任务',desc:'重点 + 清单，可直接新建',size:'2x4',sizes:['1x2','1x3','1x4','2x2','2x3','2x4','4x2','4x3','4x4'],link:['tasks','任务中心'],
    acts:[{t:'+ 新建任务',pri:1,fn:()=>newTaskModal()}],
    body:size=>sizeTier(size)==='small'?'<div id="tasksMini"></div>':'<div id="todayKey"></div><div class="divider" style="margin:2px 0"></div><div id="todayTasks"></div>',
    render:(el,size)=>{if(sizeTier(size)==='small'){const todo=DB.tasks.filter(t=>!t.done).length,key=DB.tasks.filter(t=>t.key&&!t.done).length;setHTML('tasksMini',`<div class="big-num">${todo}</div><div class="sub">待办任务${key?' · '+key+' 项重点':''}</div>`)}else renderTasks()}},
  focus:{title:'专注计时',desc:'番茄钟 + 项目归属',size:'2x2',sizes:['2x2','2x3','2x4'],link:['focus','专注记录'],
    body:()=>`<div class="timer-wrap"><div class="timer-phase" id="timerPhase">专注</div><div class="timer-num" id="timerNum">25:00</div>
      <div class="seg-ctl" style="width:100%"><button class="active" data-preset="25,5">25 + 5</button><button data-preset="50,10">50 + 10</button></div>
      <div class="field-row" style="width:100%"><select class="native-select" id="timerProject"></select>
      <select class="native-select" id="timerType"><option>实验操作</option><option>读文献</option><option>绘图</option><option>写论文</option><option>数据分析</option></select></div>
      <div class="btn-row"><button class="btn pri" id="btnTimerStart">开始</button><button class="btn sec" id="btnTimerPause">暂停</button><button class="btn sec" id="btnTimerStop">结束并记录</button></div>
      <div class="sub" id="timerToday">今日专注 0 分钟 · 0 次</div></div>`,
    after:()=>bindTimerUI()},
  projects:{title:'项目进度',desc:'里程碑与风险',size:'2x2',sizes:['1x1','1x2','2x1','2x2','2x3','2x4','4x2','4x3','4x4'],link:['projects','全部项目'],
    acts:[{t:'+ 新建项目',pri:1,fn:()=>newProjectModal()}],
    body:size=>['mini','small'].includes(sizeTier(size))?'<div id="projMini"></div>':'<div id="projCards"></div>',
    render:(el,size)=>{const t=sizeTier(size);
      if(t==='mini')setHTML('projMini',`<div class="big-num">${DB.projects.length}</div><div class="sub">进行中项目</div>`);
      else if(t==='small')setHTML('projMini',DB.projects.slice(0,2).map(p=>`<div class="mini-row"><span class="nm">${esc(p.name)}</span><span class="mt">${p.progress||0}%</span></div>`).join('')||'<div class="sub">还没有项目</div>');
      else renderProjects()}},
  literature:{title:'文献 & 提醒',desc:'待读文献与到期提醒',size:'2x3',sizes:['1x2','1x3','2x2','2x3','2x4','4x2','4x3','4x4'],link:['literature','文献库'],
    acts:[{t:'+ 添加文献',pri:1,fn:()=>newLitModal()},{t:'Zotero 导入',fn:()=>{if(typeof zoteroImportModal==='function')zoteroImportModal()}}],
    body:size=>sizeTier(size)==='small'?'<div id="litMini"></div>':'<div id="litList"></div><div class="divider" style="margin:4px 0"></div><div class="field-title">到期提醒</div><div id="reminderList"></div>',
    render:(el,size)=>{if(sizeTier(size)==='small'){const unread=DB.literatures.filter(l=>l.status!=='已读完').length;setHTML('litMini',`<div class="big-num">${unread}</div><div class="sub">待读文献 · 共 ${DB.literatures.length} 篇</div>`)}else renderLitRemind()}},
  experiments:{title:'实验台账',desc:'最近实验与状态',size:'4x2',sizes:['1x2','2x2','2x3','4x2','4x3','4x4'],link:['experiments','进入台账'],
    acts:[{t:'+ 新建实验',pri:1,fn:()=>newExpModal()}],
    body:size=>sizeTier(size)==='small'?'<div id="expMini"></div>':'<div id="expRecent"></div>',
    render:(el,size)=>{if(sizeTier(size)==='small'){const last=DB.experiments[0];setHTML('expMini',`<div class="big-num">${DB.experiments.length}</div><div class="sub">条实验记录${last?' · 最近 '+esc(last.id):''}</div>`)}else renderExperiments()}},
  reagents:{title:'试剂耗材',desc:'效期与余量预警',size:'1x2',sizes:['1x1','1x2','1x3','1x4','2x2','2x3','2x4','4x2'],link:['labres','台账'],
    acts:[{t:'+ 入库',pri:1,fn:()=>newReagentModal()}],
    body:()=>`<div id="reagentCard"></div>`,render:(el,size)=>renderReagentsCard(el,size)},
  instruments:{title:'仪器预约',desc:'机时安排与冲突检测',size:'2x1',sizes:['1x1','1x2','2x1','2x2','2x3','4x2'],link:['labres','仪器台账'],
    acts:[{t:'+ 预约',pri:1,fn:()=>newBookingModal()}],
    body:()=>`<div id="bookingCard"></div>`,render:(el,size)=>renderBookingCard(el,size)},
  deadlines:{title:'截止倒计时',desc:'结题 / 投稿 / 效期',size:'1x2',sizes:['1x1','1x2','1x3','2x2','2x3','2x4','4x2'],
    acts:[{t:'+ 提醒',pri:1,fn:()=>newReminderModal()}],
    body:()=>`<div id="deadlineCard"></div>`,render:(el,size)=>renderDeadlineCard(el,size)},
  budget:{title:'经费台账',desc:'支出与预算预警',size:'2x2',sizes:['1x1','1x2','2x1','2x2','2x3','2x4','4x2'],
    acts:[{t:'+ 记一笔',pri:1,fn:()=>newBudgetModal()}],
    body:()=>`<div id="budgetCard"></div>`,render:(el,size)=>renderBudgetCard(el,size)},
  notes:{title:'实验速记',desc:'随手记现象与思路',size:'2x1',sizes:['1x1','1x2','2x1','2x2','2x3','4x2'],
    acts:[{t:'+ 新建',pri:1,fn:()=>newNoteModal()}],
    body:()=>`<div id="notesCard"></div>`,render:(el,size)=>renderNotesCard(el,size)},
  slides:{title:'最近切片',desc:'一键回到裁剪工作区',size:'1x2',sizes:['1x1','1x2','1x3','2x2','2x3','4x2'],
    acts:[{t:'打开裁剪工具',pri:1,fn:()=>openTool('crop')}],
    body:()=>`<div id="slidesCard"></div>`,render:(el,size)=>renderSlidesCard(el,size)},
  qpcr:{title:'qPCR 分析',desc:'当前孔位与快速入口',size:'1x1',sizes:['1x1','1x2','2x1','2x2'],
    acts:[{t:'进入分析',pri:1,fn:()=>openTool('qpcr')}],
    body:()=>`<div id="qpcrCard"></div>`,render:()=>renderQpcrCard()},
  heatmap:{title:'专注热力',desc:'本周每日强度',size:'1x1',sizes:['1x1','1x2','2x1','2x2'],
    body:()=>`<div id="heatCard"></div>`,render:(el,size)=>renderHeatCard(el,size)},
  tools:{title:'科研工具',desc:'全部工具入口',size:'4x2',sizes:['2x2','2x3','4x2','4x3','4x4'],
    body:()=>`<div id="toolsCard"></div>`,render:()=>renderToolsCard()},
};
const DEFAULT_LAYOUT=[
  {id:'kpi',size:'4x2'},{id:'tasks',size:'2x4'},{id:'focus',size:'2x2'},
  {id:'deadlines',size:'1x2'},{id:'reagents',size:'1x2'},{id:'projects',size:'2x2'},
  {id:'literature',size:'2x3'},{id:'instruments',size:'2x1'},{id:'notes',size:'2x1'},{id:'budget',size:'2x2'},
  {id:'experiments',size:'4x2'},
];

/* ---- 布局 v2：节点 {id,x,y,w,h}；老格式按顺序行扫描落位，保序保尺寸 ---- */
function occupancy(nodes){
  const occ=[];
  nodes.forEach(n=>{for(let r=n.y;r<n.y+n.h;r++){occ[r]=occ[r]||0;for(let c=n.x;c<n.x+n.w;c++)occ[r]|=1<<c}});
  return occ;
}
function findSpot(nodes,w,h){
  const occ=occupancy(nodes);
  const fits=(x,y)=>{if(x+w>4)return false;for(let r=y;r<y+h;r++){const row=occ[r]||0;for(let c=x;c<x+w;c++)if(row&(1<<c))return false}return true};
  for(let y=0;y<400;y++)for(let x=0;x<=4-w;x++)if(fits(x,y))return{x,y};
  return{x:0,y:occupancy(nodes).length};
}
function autoPlace(items){
  const nodes=[];
  items.forEach(it=>{
    const p=parseSize(it.size)||parseSize(WIDGETS[it.id].size);
    const spot=findSpot(nodes,p.w,p.h);
    nodes.push({id:it.id,x:spot.x,y:spot.y,w:p.w,h:p.h});
  });
  return nodes;
}
function migrateLayout(raw){
  if(raw&&raw.v===2&&Array.isArray(raw.nodes)){
    const seen=new Set(),out=[];
    raw.nodes.forEach(n=>{
      if(!n||typeof n.id!=='string'||!n.id||seen.has(n.id))return;seen.add(n.id);
      // 未知 id（插件停用/未加载）保留占位，重新启用后布局不丢；渲染侧会跳过无 body 的卡片。
      const s=WIDGETS[n.id]?snapSize(n.id,n.w,n.h):{w:WCOLS.indexOf(n.w)>=0?n.w:2,h:HROWS.indexOf(n.h)>=0?n.h:2};
      out.push({id:n.id,x:Math.max(0,Math.min(4-s.w,n.x|0)),y:Math.max(0,n.y|0),w:s.w,h:s.h});
    });
    return out;
  }
  if(Array.isArray(raw)){
    const seen=new Set();
    const items=raw.filter(x=>x&&WIDGETS[x.id]&&!seen.has(x.id)&&seen.add(x.id)).map(x=>({id:x.id,size:normSize(x.id,x.size)}));
    return autoPlace(items);
  }
  return null;
}
/* 布局随台账落盘（Store → DB._store.dashLayout），进备份/导出/多窗口同步。
   旧 localStorage 键仅作迁移来源：读到旧值先用，首次 saveDash 时写入台账并清旧键。 */
let dashLayout=(function(){
  try{
    let raw=(typeof Store!=='undefined'&&Store)?Store.get('dashLayout',null):null;
    if(raw==null){const legacy=localStorage.getItem(DASH_KEY);if(legacy)raw=JSON.parse(legacy);}
    if(raw!=null){const nodes=migrateLayout(raw);if(nodes!==null)return nodes}
  }catch(e){}
  return autoPlace(DEFAULT_LAYOUT);
})();
function saveDash(){
  try{
    Store.set('dashLayout',{v:2,nodes:dashLayout});
    localStorage.removeItem(DASH_KEY);
  }catch(e){console.warn('Dashboard 布局保存失败：',e)}
}
let dashEdit=false,dashRO=null,dragW=null,resizeRaf=0;
let _gs=null,_gsReady=false;   // gridstack 实例；init 期间屏蔽 change 事件，避免误标脏

/* 尺寸现在由网格规格决定，不再量内容高度。这里只负责标记「正文还有内容没显示完」，
   给卡片底部加一层渐隐提示，鼠标移上去恢复清晰并可滚动。 */
function resizeDash(){
  document.querySelectorAll('#dashGrid .wcard').forEach(c=>{
    const b=c.querySelector('.card-body');if(!b)return;
    b.classList.toggle('has-more',b.scrollHeight-b.clientHeight>2);
  });
}
function queueResize(){if(resizeRaf)return;resizeRaf=requestAnimationFrame(()=>{resizeRaf=0;resizeDash()})}
function clearDropMarks(){document.querySelectorAll('#dashGrid .wcard').forEach(c=>c.classList.remove('drop-before','drop-after'))}

/* 行高 / 间距跟随密度设置（--row / --gap），gridstack 用数值像素 */
function gridMetrics(){
  let row=152,gap=10;
  try{
    const cs=getComputedStyle(document.documentElement);
    row=parseInt(cs.getPropertyValue('--row'),10)||152;
    gap=parseInt(cs.getPropertyValue('--gap'),10)||10;
  }catch(e){}
  return{row,gap};
}
function dashApplyMetrics(){
  if(!_gs)return;
  const m=gridMetrics();
  try{_gs.cellHeight(m.row)}catch(e){}
  if(typeof _gs.margin==='function'){try{_gs.margin(m.gap)}catch(e){}}
  queueResize();
}
function gsEl(id){
  const g=document.getElementById('dashGrid');
  return g?g.querySelector('.grid-stack-item[gs-id="'+id+'"]'):null;
}
function cardHeadHTML(def,sizeStr){
  const acts=(def.acts||[]).map((a,j)=>`<button class="card-act${a.pri?' pri':''}" data-act="${j}">${esc(a.t)}</button>`).join('');
  const link=def.link?`<span class="link" data-goto="${def.link[0]}">${esc(def.link[1])} ›</span>`:'';
  return `<div class="card-head">
    <span class="card-grip" title="按住拖动摆放">${GRIP}</span>
    <h2>${esc(def.title)}</h2>
    <div class="card-actions">${acts}${link}
      <button class="card-act icon size" data-wc title="切换宽度档">⇔</button>
      <span class="size-tag">${sizeLabel(sizeStr)}</span>
      <button class="card-act icon size" data-hc title="切换高度档">⇕</button>
      <button class="card-act icon size" data-cfg title="精确设置位置与尺寸">⚙</button>
      <button class="card-act icon del" data-card-del title="从 Dashboard 移除">×</button>
    </div>
  </div>`;
}
function bindCardActs(card,def){
  card.querySelectorAll('[data-act]').forEach(b=>b.onclick=e=>{e.stopPropagation();def.acts[+b.dataset.act].fn()});
}
/* 只重渲染一张卡的正文（改尺寸后调用），不动网格结构 */
function rerenderCard(id){
  const card=document.querySelector('#dashGrid .wcard[data-w="'+id+'"]');if(!card)return;
  const n=activeLayout().find(x=>x.id===id);if(!n)return;
  // 正文密度按**渲染尺寸**走：降列时卡片实际变窄，仍按 4 列规范尺寸渲染会挤爆
  const r=_gsRender.get(id)||n;
  const def=WIDGETS[id],size={w:r.w,h:r.h};
  card.dataset.size=r.w+'x'+r.h;
  const tag=card.querySelector('.size-tag');if(tag)tag.textContent=sizeLabel(n.w+'x'+n.h);
  const body=card.querySelector('.card-body');
  if(body){body.innerHTML=def.body(size);if(def.render)def.render(body,size);if(def.after)def.after(body,size)}
  queueResize();
}
/* ⇔/⇕ 循环切换：吸附到声明档后整体重绘（编辑态走草稿，非编辑态直接落盘） */
function applyWidgetSize(id,w,h){
  const n=activeLayout().find(x=>x.id===id);if(!n)return;
  const s=snapSize(id,w,h);n.w=s.w;n.h=s.h;
  if(dashEdit)touchDraft();else{saveDash();buildDash();refreshHome()}
}

/* ---- 响应式列数：布局永远以 4 列规范坐标存储，渲染时按容器宽度降列 ----
   写死 column:4 时，窄容器里 1 列卡只有百余像素，内容挤成一条；而 CSS 断点
   只对回退网格生效，GridStack 根本不理。这里让引擎列数跟着容器走。
   **降列模式下禁止拖拽/改尺寸**：1 列时所有宽度都会归一，回写会毁掉用户的布局。 */
let _gsCols=4,_gsRender=new Map(),_dashColRO=null;
function dashColsFor(w){return w>=900?4:w>=560?2:1}
/* 4 列规范坐标 → N 列渲染坐标。按 y 再 x 排序后重新落位，保持视觉顺序。 */
function renderCoords(L,cols){
  const m=new Map();
  if(cols>=4){L.forEach(n=>m.set(n.id,{x:n.x,y:n.y,w:n.w,h:n.h}));return m}
  const scale=w=>Math.max(1,Math.min(cols,Math.round(w*cols/4)));
  const occ=[];
  const fits=(x,y,w,h)=>{if(x+w>cols)return false;for(let r=y;r<y+h;r++){const row=occ[r]||0;for(let c=x;c<x+w;c++)if(row&(1<<c))return false}return true};
  const mark=(x,y,w,h)=>{for(let r=y;r<y+h;r++){occ[r]=occ[r]||0;for(let c=x;c<x+w;c++)occ[r]|=1<<c}};
  L.slice().sort((a,b)=>a.y-b.y||a.x-b.x).forEach(n=>{
    const w=scale(n.w);let x=Math.min(n.x,cols-w),y=n.y;
    if(!fits(x,y,w,n.h)){
      let done=false;
      // 只往下找空位，绝不放到自己规范行之上——保持用户的阅读顺序
      for(let yy=y;yy<y+400&&!done;yy++)for(let xx=0;xx<=cols-w;xx++)if(fits(xx,yy,w,n.h)){x=xx;y=yy;done=true;break}
      if(!done){x=0;y=occ.length}
    }
    mark(x,y,w,n.h);
    m.set(n.id,{x,y,w,h:n.h});
  });
  return m;
}
function dashColHint(){
  const el=document.getElementById('dashColHint');
  if(el)el.hidden=_gsCols>=4;
}
/* 容器宽度变化 → 目标列数变化时重排。编辑态先退出，避免草稿坐标被降列污染。 */
function dashWatchCols(grid){
  if(_dashColRO){try{_dashColRO.disconnect()}catch(e){}_dashColRO=null}
  if(typeof ResizeObserver!=='function'||!grid.parentElement)return;
  _dashColRO=new ResizeObserver(()=>{
    const want=dashColsFor(grid.parentElement.clientWidth||grid.clientWidth||1000);
    if(want===_gsCols)return;
    if(dashEdit){exitDashEdit(false);toast('窗口变窄，卡片已自动重排；布局编辑已取消，请在更宽的窗口下编辑',5200);return}
    buildDash();
  });
  _dashColRO.observe(grid.parentElement);
}

function buildDash(intro){
  const grid=document.getElementById('dashGrid');if(!grid)return;
  if(window.GridStack&&typeof window.GridStack.init==='function'){buildDashGS(grid,intro);return}
  buildDashFallback(grid,intro);
}
/* ---- 主渲染器：gridstack 自由网格 ---- */
function buildDashGS(grid,intro){
  if(dashRO){dashRO.disconnect();dashRO=null}
  _gsReady=false;
  if(_gs){try{_gs.destroy(false)}catch(e){}_gs=null}
  grid.classList.toggle('dash-edit',dashEdit);
  grid.classList.add('grid-stack');
  const L=activeLayout();
  _gsCols=dashColsFor(grid.parentElement?grid.parentElement.clientWidth:grid.clientWidth||1000);
  _gsRender=renderCoords(L,_gsCols);
  dashColHint();dashWatchCols(grid);
  if(!L.length){grid.innerHTML='<div class="dash-empty">Dashboard 是空的 — 进入「编辑布局」后点「+ 添加卡片」挑几张放进来</div>';return}
  const editable=dashEdit&&_gsCols>=4;
  const sc=w=>Math.max(1,Math.min(_gsCols,Math.round(w*_gsCols/4)));
  grid.innerHTML=L.map((n,i)=>{
    const def=WIDGETS[n.id];if(!def||typeof def.body!=='function')return '';
    const r=_gsRender.get(n.id)||n;
    const sizes=(def.sizes||[def.size]).map(parseSize).filter(Boolean);
    const minW=sc(Math.min(...sizes.map(p=>p.w))),maxW=Math.max(minW,sc(Math.max(...sizes.map(p=>p.w))));
    const minH=Math.min(...sizes.map(p=>p.h)),maxH=Math.max(...sizes.map(p=>p.h));
    return `<div class="grid-stack-item" gs-id="${n.id}" gs-x="${r.x}" gs-y="${r.y}" gs-w="${r.w}" gs-h="${r.h}" gs-min-w="${minW}" gs-max-w="${maxW}" gs-min-h="${minH}" gs-max-h="${maxH}">
      <div class="grid-stack-item-content dash-card wcard${intro?' intro':''}" data-w="${n.id}" data-size="${r.w}x${r.h}"${editable?' tabindex="0"':''} style="${intro?'animation-delay:'+Math.min(i*0.05,0.4)+'s':''}">
        <div class="card-inner">
          ${cardHeadHTML(def,r.w+'x'+r.h)}
          <div class="card-body">${def.body({w:r.w,h:r.h})}</div>
        </div>
      </div></div>`;
  }).join('');
  const m=gridMetrics();
  _gs=window.GridStack.init({
    column:_gsCols,cellHeight:m.row,margin:m.gap,float:true,animate:false,
    handle:'.card-grip',resizable:{handles:'se'},alwaysShowResizeHandle:true,
    disableDrag:!editable,disableResize:!editable,
  },grid);
  _gs.on('change',onGsChange);
  _gs.on('dragstop',onGsDragStop);
  _gs.on('resizestop',onGsResizeStop);
  _gsReady=true;
  dashRO=new ResizeObserver(queueResize);
  grid.querySelectorAll('.wcard').forEach(card=>{
    const id=card.dataset.w,def=WIDGETS[id];
    dashRO.observe(card.querySelector('.card-body'));
    bindCardActs(card,def);
    const r=_gsRender.get(id)||activeLayout().find(x=>x.id===id);
    const wc=card.querySelector('[data-wc]');if(wc)wc.onclick=()=>{const cur=activeLayout().find(x=>x.id===id);applyWidgetSize(id,WCOLS[(WCOLS.indexOf(cur.w)+1)%WCOLS.length],cur.h)};
    const hc=card.querySelector('[data-hc]');if(hc)hc.onclick=()=>{const cur=activeLayout().find(x=>x.id===id);applyWidgetSize(id,cur.w,HROWS[(HROWS.indexOf(cur.h)+1)%HROWS.length])};
    const del=card.querySelector('[data-card-del]');
    if(del)del.onclick=()=>{removeWidget(id);if(dashEdit)touchDraft();else{saveDash();buildDash();refreshHome()}toast('已移除「'+def.title+'」，可从「+ 添加卡片」加回')};
    const cfg=card.querySelector('[data-cfg]');if(cfg)cfg.onclick=()=>widgetDialog(id);
    bindCardKeys(card);
    if(def.after)def.after(card.querySelector('.card-body'),{w:r.w,h:r.h});
  });
  if(intro)requestAnimationFrame(()=>requestAnimationFrame(()=>grid.querySelectorAll('.intro').forEach(c=>c.classList.remove('intro'))));
  queueResize();
}
/* 拖拽/缩放过程中：把引擎坐标同步进草稿，只标脏不重绘。
   降列模式下引擎坐标不是 4 列规范值，回写会毁掉布局，一律跳过。 */
function onGsChange(ev,items){
  if(!_gsReady||!_gs||_gsCols<4)return;
  const L=activeLayout();
  (items||[]).forEach(it=>{const n=L.find(x=>x.id===it.id);if(n){n.x=it.x;n.y=it.y;n.w=it.w;n.h=it.h}});
  if(dashEdit)syncEditBar();
}
function onGsDragStop(){if(dashEdit)syncEditBar();queueResize()}
/* 缩放结束：吸附到该卡声明的尺寸档，再按新档重渲染正文 */
function onGsResizeStop(ev,el){
  if(_gsCols<4)return;   // 降列模式下的引擎坐标不是规范值，回写会毁掉布局
  const node=el&&el.gridstackNode;if(!node)return;
  const id=node.id,s=snapSize(id,node.w,node.h);
  const n=activeLayout().find(x=>x.id===id);
  if(n){n.w=s.w;n.h=s.h}
  if(_gs&&(s.w!==node.w||s.h!==node.h)){try{_gs.update(el,{w:s.w,h:s.h})}catch(e){}}
  rerenderCard(id);
  if(dashEdit)syncEditBar();
  queueResize();
}
/* ---- 回退渲染器：GridStack 不可用时的旧顺序网格（保留一个版本周期） ---- */
function buildDashFallback(grid,intro){
  if(dashRO){dashRO.disconnect();dashRO=null}
  _gsReady=false;_gs=null;_gsCols=4;_gsRender=new Map();
  dashColHint();
  grid.classList.remove('grid-stack');
  grid.classList.toggle('dash-edit',dashEdit);
  const L=activeLayout();
  if(!L.length){grid.innerHTML='<div class="dash-empty">Dashboard 是空的 — 进入「编辑布局」后点「+ 添加卡片」挑几张放进来</div>';return}
  grid.innerHTML=L.map((n,i)=>{
    const def=WIDGETS[n.id];if(!def||typeof def.body!=='function')return '';
    return `<div class="dash-card wcard w${n.w} h${n.h}${intro?' intro':''}" data-w="${n.id}" data-size="${n.w}x${n.h}"${dashEdit?' tabindex="0"':''} style="${intro?'animation-delay:'+Math.min(i*0.05,0.4)+'s':''}">
      <div class="card-inner">
        ${cardHeadHTML(def,n.w+'x'+n.h)}
        <div class="card-body">${def.body({w:n.w,h:n.h})}</div>
      </div></div>`;
  }).join('');
  dashRO=new ResizeObserver(queueResize);
  grid.querySelectorAll('.wcard').forEach(card=>{
    const id=card.dataset.w,def=WIDGETS[id];
    dashRO.observe(card.querySelector('.card-body'));
    bindCardActs(card,def);
    const wc=card.querySelector('[data-wc]');if(wc)wc.onclick=()=>{const cur=activeLayout().find(x=>x.id===id);applyWidgetSize(id,WCOLS[(WCOLS.indexOf(cur.w)+1)%WCOLS.length],cur.h)};
    const hc=card.querySelector('[data-hc]');if(hc)hc.onclick=()=>{const cur=activeLayout().find(x=>x.id===id);applyWidgetSize(id,cur.w,HROWS[(HROWS.indexOf(cur.h)+1)%HROWS.length])};
    const del=card.querySelector('[data-card-del]');
    if(del)del.onclick=()=>{removeWidget(id);if(dashEdit)touchDraft();else{saveDash();buildDash();refreshHome()}toast('已移除「'+def.title+'」，可从「+ 添加卡片」加回')};
    const cfg=card.querySelector('[data-cfg]');if(cfg)cfg.onclick=()=>widgetDialog(id);
    bindCardDnD(card);bindCardKeys(card);
    const n=activeLayout().find(x=>x.id===id);
    if(def.after)def.after(card.querySelector('.card-body'),{w:n.w,h:n.h});
  });
  if(intro)requestAnimationFrame(()=>requestAnimationFrame(()=>grid.querySelectorAll('.intro').forEach(c=>c.classList.remove('intro'))));
  queueResize();
}
function bindCardDnD(card){
  const grip=card.querySelector('.card-grip');if(!grip)return;
  grip.addEventListener('mousedown',()=>{card.draggable=true});
  grip.addEventListener('mouseup',()=>{card.draggable=false});
  card.addEventListener('dragstart',e=>{
    dragW=card.dataset.w;card.classList.add('dragging');
    e.dataTransfer.effectAllowed='move';
    try{e.dataTransfer.setData('text/plain',dragW)}catch(_){}
  });
  card.addEventListener('dragend',()=>{card.draggable=false;card.classList.remove('dragging');dragW=null;clearDropMarks()});
  card.addEventListener('dragover',e=>{
    if(!dragW||card.dataset.w===dragW)return;
    e.preventDefault();e.dataTransfer.dropEffect='move';
    const r=card.getBoundingClientRect(),before=(e.clientX-r.left)<r.width/2;
    clearDropMarks();card.classList.add(before?'drop-before':'drop-after');
  });
  card.addEventListener('dragleave',()=>card.classList.remove('drop-before','drop-after'));
  card.addEventListener('drop',e=>{
    e.preventDefault();
    if(!dragW||card.dataset.w===dragW)return;
    const r=card.getBoundingClientRect(),before=(e.clientX-r.left)<r.width/2;
    const L=activeLayout();
    const from=L.findIndex(x=>x.id===dragW);if(from<0)return;
    const [item]=L.splice(from,1);
    let to=L.findIndex(x=>x.id===card.dataset.w);
    if(!before)to++;
    L.splice(to,0,item);
    dragW=null;if(dashEdit)touchDraft();else{saveDash();buildDash();refreshHome()}
  });
}
function refreshHome(){
  /* 这五个由既有的整页渲染器负责（它们同时喂首页卡片和子页表格） */
  renderTasks();renderKpi();renderProjects();renderLitRemind();renderExperiments();
  /* 其余卡片各自渲染（带尺寸档）；卡片被移除时 setHTML 会安静跳过。
     注意顺序：整页渲染器先跑，卡片级 render 后跑，mini/small 变体才能覆盖摘要。 */
  activeLayout().forEach(n=>{const d=WIDGETS[n.id];if(d&&d.render)d.render(null,{w:n.w,h:n.h})});
  if(typeof renderHomeDeck==='function')renderHomeDeck();
  if(typeof deckBind==='function')deckBind();
  queueResize();
}
/* 卡片选择器：双 tab（已装卡片 / 获取卡片）。
   参考 Home Assistant 2026.6 的 Add card 弹窗：自定义卡片单独一区，不与内置混排。
   卡片扩展的市场挂在第二个 tab 里，安装后直接落到 Dashboard。 */
let dashPickerTab='cards';
function openPicker(tab){
  dashPickerTab=tab==='market'?'market':'cards';
  const mask=document.createElement('dialog');mask.className='modal-mask';mask.setAttribute('aria-label','选择 Dashboard 卡片');
  const box=document.createElement('div');box.className='roi-modal wide';
  const close=()=>{closeLayer(mask);if(mask.parentNode)mask.remove()};
  const draw=()=>{
    const market=dashPickerTab==='market';
    const total=Object.keys(WIDGETS).length;
    box.innerHTML=`<h4>${market?'获取卡片扩展':'选择 Dashboard 卡片'}</h4>
      <div class="seg wide" id="pkTabs">
        <button type="button" data-pktab="cards"${market?'':' class="active"'}>已装卡片 (${activeLayout().length}/${total})</button>
        <button type="button" data-pktab="market"${market?' class="active"':''}>获取卡片</button>
      </div>
      ${market
        ? '<div id="pkMarket"></div>'
        : `<div class="sub">点击切换显示${dashEdit?' · 改动需点「保存布局」':''}</div>
      <div class="picker-grid">${Object.entries(WIDGETS).map(([id,d])=>{
        const on=activeLayout().some(x=>x.id===id);
        const sizes=d.sizes||[d.size];
        return `<div class="pick-item${on?' on':''}" data-pick="${id}" title="支持尺寸：${sizes.map(sizeLabel).join(' / ')}"><div class="nm">${esc(d.title)}<div class="ds">${esc(d.desc||'')}</div></div><span class="sz">${sizeLabel(d.size)} · ${sizes.length} 档</span></div>`;
      }).join('')}</div>`}
      <div class="btn-row"><button type="button" class="btn pri" id="pk_done">完成</button>${market?'':'<button type="button" class="btn sec" id="pk_reset">恢复默认布局</button>'}</div>`;
    box.querySelectorAll('[data-pktab]').forEach(b=>b.onclick=()=>{dashPickerTab=b.dataset.pktab;draw()});
    box.querySelector('#pk_done').onclick=close;
    if(market){
      const host=box.querySelector('#pkMarket');
      if(host&&typeof pluginMountMarket==='function'){
        pluginMountMarket(host,'widget',{
          onInstalled:id=>{
            if(!activeLayout().some(x=>x.id===id))addWidget(id);
            if(dashEdit)touchDraft();else{saveDash();buildDash();refreshHome()}
            toast('已把「'+id+'」加入 Dashboard');
          },
        });
      }else if(host){
        host.innerHTML='<div class="plugin-empty">卡片扩展市场需桌面版；浏览器模式可看演示</div>';
      }
      return;
    }
    box.querySelectorAll('[data-pick]').forEach(el=>el.onclick=()=>{
      const id=el.dataset.pick;
      if(activeLayout().some(x=>x.id===id))removeWidget(id);
      else addWidget(id);
      if(dashEdit)touchDraft();else{saveDash();buildDash();refreshHome()}draw();
    });
    box.querySelector('#pk_reset').onclick=()=>{if(dashEdit){dashDraft=autoPlace(DEFAULT_LAYOUT);touchDraft()}else{dashLayout=autoPlace(DEFAULT_LAYOUT);saveDash();buildDash(true);refreshHome()}draw();toast('已套用默认布局')};
  };
  draw();
  mask.appendChild(box);document.body.appendChild(mask);
  mask.addEventListener('close',()=>{if(mask.parentNode)mask.remove()});
  mask.addEventListener('click',e=>{if(e.target===mask)close()});
  openLayer(mask);
}
/* ===================== 专门的布局编辑器 =====================
   参考 Homarr 的 board edit mode：从工具栏进入编辑态，改动先落在草稿上，
   必须显式「保存布局」才写入；「取消」/Esc 原样还原，不会把误操作留在盘上。
   每张卡片还有一个精确数值对话框（列 x + 行 y + 宽 + 高），拖不准时用它。 */
let dashDraft=null;
function activeLayout(){return dashEdit&&dashDraft?dashDraft:dashLayout}
function layoutDirty(){
  if(!dashEdit||!dashDraft)return false;
  return JSON.stringify(dashDraft)!==JSON.stringify(dashLayout);
}
function enterDashEdit(){
  if(dashEdit)return;
  if(_gsCols<4){toast('窗口太窄，卡片已自动重排；请把窗口拉宽到 900px 以上再编辑布局',5200);return}
  wbMenuClose();
  dashEdit=true;dashDraft=dashLayout.map(x=>({...x}));
  syncEditBar();buildDash();refreshHome();
  toast('已进入布局编辑 · 改动要点「保存布局」才生效，Esc 取消',4200);
}
function exitDashEdit(commit){
  if(!dashEdit)return;
  const dirty=layoutDirty();
  if(commit){dashLayout=dashDraft.map(x=>({...x}));saveDash()}
  dashEdit=false;dashDraft=null;
  syncEditBar();buildDash();refreshHome();
  if(commit)toast(dirty?'布局已保存':'布局没有改动');
  else if(dirty)toast('已取消，布局回到编辑前');
}
function syncEditBar(){
  document.getElementById('dashTools').style.display=dashEdit?'none':'';
  document.getElementById('dashEditTools').style.display=dashEdit?'':'none';
  const bar=document.querySelector('.dash-toolbar');if(bar)bar.classList.toggle('editing',dashEdit);
  const st=document.getElementById('editState');
  if(dashEdit){
    const d=layoutDirty();
    st.textContent=d?'有未保存改动':'编辑中';
    st.classList.toggle('dirty',d);
  }else{st.textContent='编辑中';st.classList.remove('dirty')}
  document.getElementById('dashHint').textContent=dashEdit
    ?(_gs?'拖把手自由摆放 · 右下角拖动改尺寸 · ⇔⇕ 快速切档 · ⚙ 精确坐标 · × 移除 · 键盘：方向键移动，Shift+方向键改尺寸'
        :'拖把手排序 · ⇔ 宽（1/2/4 列）· ⇕ 高（1–4 行）· ⚙ 精确设置 · × 移除 · 键盘：←→ 排序，Shift+←→ 改宽，Shift+↑↓ 改高')
    :'卡片右上角可直接新建任务 / 记录 · 点「编辑布局」调整卡片';
}
/* 草稿上的每一次改动都走这里：只重绘，不落盘 */
function touchDraft(){syncEditBar();buildDash();refreshHome()}
function moveWidgetTo(id,pos){
  const L=activeLayout(),from=L.findIndex(x=>x.id===id);if(from<0)return;
  const [it]=L.splice(from,1);
  L.splice(Math.max(0,Math.min(L.length,pos)),0,it);
}
function setWidgetSize(id,w,h){
  const n=activeLayout().find(x=>x.id===id);if(!n)return;
  const s=snapSize(id,w,h);n.w=s.w;n.h=s.h;
}
function removeWidget(id){
  const L=activeLayout(),i=L.findIndex(x=>x.id===id);if(i<0)return;
  L.splice(i,1);
}
function addWidget(id){
  const L=activeLayout();
  if(L.some(x=>x.id===id))return;
  const p=parseSize(WIDGETS[id].size),spot=findSpot(L,p.w,p.h);
  L.push({id,x:spot.x,y:spot.y,w:p.w,h:p.h});
}
/* 精确数值对话框：拖动难以对准格子时的兜底，也是键盘用户的入口 */
function widgetDialog(id){
  const n=activeLayout().find(x=>x.id===id);if(!n)return;
  const def=WIDGETS[id];
  formModal('调整卡片：'+def.title,[
    {k:'x',label:'列位置（0 = 最左，共 4 列）',type:'number',value:n.x},
    {k:'y',label:'行位置（0 = 最上）',type:'number',value:n.y},
    {k:'w',label:'宽度',type:'select',options:WCOLS.map(c=>c+' 列'),value:n.w+' 列'},
    {k:'h',label:'高度',type:'select',options:HROWS.map(r=>r+' 行'),value:n.h+' 行'},
  ],v=>{
    const s=snapSize(id,parseInt(v.w,10),parseInt(v.h,10));
    n.w=s.w;n.h=s.h;
    n.x=Math.max(0,Math.min(4-s.w,parseInt(v.x,10)||0));
    n.y=Math.max(0,parseInt(v.y,10)||0);
    if(dashEdit)touchDraft();else{saveDash();buildDash();refreshHome()}
    toast('已调整「'+def.title+'」');
  },'应用');
}
function bindCardKeys(card){
  card.addEventListener('keydown',e=>{
    if(!dashEdit)return;
    const id=card.dataset.w,L=activeLayout(),i=L.findIndex(x=>x.id===id);if(i<0)return;
    const n=L[i];
    let handled=true;
    if(e.shiftKey&&e.key==='ArrowLeft')setWidgetSize(id,WCOLS[Math.max(0,WCOLS.indexOf(n.w)-1)],n.h);
    else if(e.shiftKey&&e.key==='ArrowRight')setWidgetSize(id,WCOLS[Math.min(WCOLS.length-1,WCOLS.indexOf(n.w)+1)],n.h);
    else if(e.shiftKey&&e.key==='ArrowUp')setWidgetSize(id,n.w,HROWS[Math.min(HROWS.length-1,HROWS.indexOf(n.h)+1)]);
    else if(e.shiftKey&&e.key==='ArrowDown')setWidgetSize(id,n.w,HROWS[Math.max(0,HROWS.indexOf(n.h)-1)]);
    else if(e.key==='ArrowLeft'){if(_gs)n.x=Math.max(0,n.x-1);else moveWidgetTo(id,i-1)}
    else if(e.key==='ArrowRight'){if(_gs)n.x=Math.min(4-n.w,n.x+1);else moveWidgetTo(id,i+1)}
    else if(e.key==='ArrowUp'){if(_gs)n.y=Math.max(0,n.y-1);else handled=false}
    else if(e.key==='ArrowDown'){if(_gs)n.y=n.y+1;else handled=false}
    else if(e.key==='Delete'||e.key==='Backspace')removeWidget(id);
    else if(e.key==='Enter'||e.key===' '){widgetDialog(id);e.preventDefault();return}
    else handled=false;
    if(!handled)return;
    e.preventDefault();
    touchDraft();
    const again=document.querySelector('#dashGrid .wcard[data-w="'+id+'"]');
    if(again)again.focus();
  });
}
/* ===================== 工作台 ▾ 单一入口（P0） =====================
   侧栏工作台子页按钮已收敛进本菜单；菜单项 ☆ 可固定到侧栏「固定」区。
   卡片删光也不失联：本菜单 + Ctrl+K 面板 + hash 深链三通道兜底。 */
let _wbMenu=null;
function workbenchMenuHTML(){
  return WB_PAGES.map(id=>{
    const m=PAGE_META[id],on=Store.isPinned('page',id);
    return `<div class="wb-item" data-wb="${id}" role="menuitem" tabindex="0">
      <span class="wb-ico">${pageIcon(id)}</span>
      <span class="wb-txt"><b>${esc(m.name)}</b><small>${esc(m.desc)}</small></span>
      <button class="wb-pin${on?' on':''}" data-pin-toggle="${id}" data-pin-toggle-kind="page" title="${on?'取消固定':'固定到侧栏'}" aria-label="${on?'取消固定':'固定到侧栏'} ${esc(m.name)}">${on?'★':'☆'}</button>
    </div>`;
  }).join('');
}
function wbMenuClose(){
  if(_wbMenu){_wbMenu.remove();_wbMenu=null}
  document.removeEventListener('mousedown',wbMenuOutside,true);
  document.removeEventListener('keydown',wbMenuKeys,true);
}
function wbMenuOutside(e){if(_wbMenu&&!_wbMenu.contains(e.target)&&!e.target.closest('#btnWorkbench'))wbMenuClose()}
function wbMenuKeys(e){
  if(!_wbMenu)return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();wbMenuClose();return}
  const items=[..._wbMenu.querySelectorAll('.wb-item')];
  const i=items.indexOf(document.activeElement);
  if(e.key==='ArrowDown'){e.preventDefault();items[(i+1)%items.length].focus()}
  else if(e.key==='ArrowUp'){e.preventDefault();items[(i-1+items.length)%items.length].focus()}
  else if(e.key==='Enter'&&i>=0){e.preventDefault();const id=items[i].dataset.wb;wbMenuClose();navigate(id)}
}
function openWorkbenchMenu(){
  if(_wbMenu){wbMenuClose();return}
  const btn=document.getElementById('btnWorkbench');if(!btn)return;
  const m=document.createElement('div');m.className='wb-menu';m.setAttribute('role','menu');
  m.innerHTML='<div class="wb-head">工作台子页 · ☆ 固定到侧栏</div>'+workbenchMenuHTML();
  document.getElementById('win').appendChild(m);
  const r=btn.getBoundingClientRect();
  m.style.left=Math.max(8,Math.min(r.left,window.innerWidth-m.offsetWidth-12))+'px';
  m.style.top=Math.min(r.bottom+6,window.innerHeight-m.offsetHeight-12)+'px';
  m.addEventListener('click',e=>{
    if(e.target.closest('[data-pin-toggle]'))return;   // 固定切换走全局委托，菜单保持打开并同步 ★ 状态
    const it=e.target.closest('[data-wb]');
    if(it){const id=it.dataset.wb;wbMenuClose();navigate(id)}
  });
  _wbMenu=m;
  /* 打开菜单的 click 之前 mousedown 已触发，同步注册外部点击监听不会误关 */
  document.addEventListener('mousedown',wbMenuOutside,true);
  document.addEventListener('keydown',wbMenuKeys,true);
  m.querySelector('.wb-item')?.focus();
}
document.getElementById('btnWorkbench').onclick=openWorkbenchMenu;
document.getElementById('btnDashEdit').onclick=enterDashEdit;
document.getElementById('btnDashSave').onclick=()=>exitDashEdit(true);
document.getElementById('btnDashCancel').onclick=()=>exitDashEdit(false);
document.getElementById('btnDashReset').onclick=()=>{
  dashDraft=autoPlace(DEFAULT_LAYOUT);touchDraft();toast('已套用默认布局，仍需点「保存布局」');
};
document.getElementById('btnDashAdd').onclick=()=>openPicker('cards');
/* 非编辑态也能进卡片市场：否则只有点了「编辑布局」才看得到「+ 添加卡片」。 */
(function(){
  const b=document.getElementById('btnDashAddCard');
  if(b)b.onclick=()=>openPicker('market');
})();
document.addEventListener('keydown',e=>{
  const typing=/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName||''))||e.target.isContentEditable;
  if((e.ctrlKey||e.metaKey)&&(e.key==='e'||e.key==='E')){
    if(typing||document.querySelector('.modal-mask'))return;
    e.preventDefault();dashEdit?exitDashEdit(true):enterDashEdit();return;
  }
  if(e.key==='Escape'&&dashEdit&&!document.querySelector('.modal-mask')&&!typing){
    e.preventDefault();exitDashEdit(false);
  }
});
window.addEventListener('resize',queueResize);