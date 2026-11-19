// LabKit · dashboard.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== Dashboard 卡片体系 =====================
   卡片 = 注册表里的一项；布局 = [{id,size:'宽x高'}]，存 localStorage。
   尺寸规范化为整数格：宽 1/2/4 列 × 高 1/2/3/4 行（行单位 150px），如 4x2、2x1。 */
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
const GRIP='<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="6" cy="3" r="1.25"/><circle cx="10" cy="3" r="1.25"/><circle cx="6" cy="8" r="1.25"/><circle cx="10" cy="8" r="1.25"/><circle cx="6" cy="13" r="1.25"/><circle cx="10" cy="13" r="1.25"/></svg>';

function renderReagentsCard(){
  const rows=DB.reagents.map((r,i)=>{
    const d=daysLeft(r.exp);
    const pill=d===null?'':d<0?'<span class="warn-pill red">已过期</span>':d<=30?`<span class="warn-pill orange">${d}天到期</span>`:'';
    const low=(parseInt(r.left)||100)<=20?'<span class="warn-pill red">余量低</span>':'';
    return `<div class="mini-row"><span class="nm" title="${esc(r.loc)} · 有效期 ${esc(r.exp)}">${esc(r.name)}</span>${pill}${low}<span class="mt">${esc(r.left)}</span><button class="x" data-del-reagent="${i}" title="移除">×</button></div>`;
  }).join('');
  setHTML('reagentCard',rows||'<div class="sub">暂无试剂，点右上角入库</div>');
  document.querySelectorAll('[data-del-reagent]').forEach(b=>b.onclick=()=>{DB.reagents.splice(+b.dataset.delReagent,1);saveDB();refreshHome();renderLab()});
}
function renderBookingCard(){
  const rows=DB.bookings.map((b,i)=>{
    const d=daysLeft(b.date);
    const when=d===0?'今天':d===1?'明天':(d!==null&&d>0?d+'天后':b.date);
    return `<div class="mini-row"><span class="nm" title="${esc(b.proj||'')}">${esc(b.inst)}</span><span class="mt">${esc(b.slot)}</span><span class="warn-pill ${d!==null&&d<=1?'orange':'green'}">${esc(when)}</span><button class="x" data-del-book="${i}" title="取消预约">×</button></div>`;
  }).join('');
  setHTML('bookingCard',rows||'<div class="sub">暂无预约，点右上角预约机时</div>');
  document.querySelectorAll('[data-del-book]').forEach(b=>b.onclick=()=>{DB.bookings.splice(+b.dataset.delBook,1);saveDB();refreshHome()});
}
function renderBudgetCard(){
  const used=DB.budget.reduce((s,b)=>s+(+b.amount||0),0),total=+DB.budgetTotal||0;
  const pct=total?Math.min(100,Math.round(used/total*100)):0;
  setHTML('budgetCard',`
    <div class="big-num">¥${used.toLocaleString()}</div>
    <div class="sub">已用 ${pct}% · 预算 ¥${total.toLocaleString()} · 余 ¥${Math.max(0,total-used).toLocaleString()}</div>
    <div class="progress"><div class="progress-fill" style="width:${pct}%;background:${pct>=90?'var(--red)':pct>=70?'var(--orange)':'var(--accent)'}"></div></div>
    ${pct>=90?'<div class="warn-pill red">预算即将超支</div>':''}
    <div style="margin-top:2px">${DB.budget.slice(0,3).map(b=>`<div class="mini-row"><span class="nm">${esc(b.item)}</span><span class="mt">¥${(+b.amount||0).toLocaleString()}</span></div>`).join('')||'<div class="sub">还没有支出记录</div>'}</div>`);
}
function renderNotesCard(){
  setHTML('notesCard',DB.notes.slice(0,3).map(n=>`<div class="note-card"><div class="tm">${esc(n.at)}</div>${esc(n.text)}</div>`).join('')||'<div class="sub">随手记下实验现象与排查思路</div>');
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
function renderDeadlineCard(){
  const list=collectDeadlines().slice(0,6);
  setHTML('deadlineCard',list.map(x=>{
    const cls=x.d===null?'':x.d<0?'red':x.d<=7?'orange':'green';
    const txt=x.d===null?x.date:x.d<0?'逾期'+(-x.d)+'天':x.d===0?'今天':x.d+'天';
    return `<div class="mini-row"><span class="nm">${esc(x.text)}</span><span class="warn-pill ${cls||'green'}">${esc(txt)}</span></div>`;
  }).join('')||'<div class="sub">近期没有截止事项</div>');
}
function renderHeatCard(){
  const days=lastDays(7),v=seriesFocus(7),mx=Math.max(1,...v);
  /* 标签跟着真实日期走：这是「近 7 天」滚动窗口，不是固定的周一到周日 */
  const lbl=days.map(d=>{const dt=new Date(d+'T00:00');return '日一二三四五六'[dt.getDay()]});
  setHTML('heatCard',`<div class="heat-row">${v.map((x,i)=>`<div class="heat-cell" title="${days[i]} · ${x} 分钟" style="background:rgba(0,122,255,${(0.10+0.75*x/mx).toFixed(3)})"></div>`).join('')}</div>
    <div class="heat-lbl">${lbl.map(d=>`<span>${d}</span>`).join('')}</div>
    <div class="sub" style="margin-top:6px">近 7 天合计 ${sum(v)} 分钟</div>`);
}
function renderSlidesCard(){
  const rows=(DB.recentSlides||[]).slice(0,4).map((s,i)=>`<div class="mini-row"><span class="nm" title="${esc(s.path)}">${esc(s.name)}</span><button class="card-act" data-open-slide="${i}">打开</button></div>`).join('');
  setHTML('slidesCard',rows||'<div class="sub">还没有打开过切片</div>');
  document.querySelectorAll('[data-open-slide]').forEach(b=>b.onclick=()=>{
    const s=DB.recentSlides[+b.dataset.openSlide];if(!s)return;
    openView('crop');openSlidePath(s.path);
  });
}
function renderToolsCard(){
  const tools=[['crop','病理切片裁剪','ROI 框选 · TIFF 导出'],['qpcr','qPCR 数据分析','ΔΔCt · geNorm · 统计'],['experiments','实验台账','记录与项目绑定'],['labres','试剂 / 仪器','库存 · 效期 · 校准'],['literature','文献库','待读与笔记状态'],['reports','统计报表','专注与产出趋势']];
  setHTML('toolsCard',`<div class="bento">${tools.map(([v,n,d])=>`<div class="bento-card" data-goto="${v}"><b>${n}</b><p>${d}</p></div>`).join('')}</div>`);
}
function renderQpcrCard(){
  const n=(qState&&qState.wells&&qState.wells.length)||0;
  setHTML('qpcrCard',`<div class="big-num">${n}</div><div class="sub">当前工作台孔位${n?' · 可直接进入分析':' · 支持 CSV / Excel / 仪器原始文件'}</div>`);
}

const WIDGETS={
  kpi:{title:'数据总览',desc:'KPI + 近 7 天趋势',size:'4x2',
    body:()=>`<div class="kpi-row" id="kpiRow"></div><div class="chart-row"><div class="chart-box"><div class="chart-title">近 7 天专注时长（分钟）</div><div id="chartFocus"></div></div><div class="chart-box"><div class="chart-title">近 7 天任务完成趋势</div><div id="chartTasks"></div></div></div>`},
  trend:{title:'近 7 天趋势',desc:'专注时长与任务完成',size:'2x2',
    body:()=>`<div class="chart-box"><div class="chart-title">专注时长（分钟）</div><div id="chartFocus2"></div></div><div class="chart-box"><div class="chart-title">任务完成</div><div id="chartTasks2"></div></div>`,
    render:()=>{setHTML('chartFocus2',lineChart(seriesFocus(7),300,90,'#007AFF'));setHTML('chartTasks2',lineChart(seriesTasks(7),300,90,'#30D158'))}},
  tasks:{title:'今日任务',desc:'重点 + 清单，可直接新建',size:'2x4',link:['tasks','任务中心'],
    acts:[{t:'+ 新建任务',pri:1,fn:()=>newTaskModal()}],
    body:()=>`<div id="todayKey"></div><div class="divider" style="margin:2px 0"></div><div id="todayTasks"></div>`},
  focus:{title:'专注计时',desc:'番茄钟 + 项目归属',size:'2x2',link:['focus','专注记录'],
    body:()=>`<div class="timer-wrap"><div class="timer-phase" id="timerPhase">专注</div><div class="timer-num" id="timerNum">25:00</div>
      <div class="seg-ctl" style="width:100%"><button class="active" data-preset="25,5">25 + 5</button><button data-preset="50,10">50 + 10</button></div>
      <div class="field-row" style="width:100%"><select class="native-select" id="timerProject"></select>
      <select class="native-select" id="timerType"><option>实验操作</option><option>读文献</option><option>绘图</option><option>写论文</option><option>数据分析</option></select></div>
      <div class="btn-row"><button class="btn pri" id="btnTimerStart">开始</button><button class="btn sec" id="btnTimerPause">暂停</button><button class="btn sec" id="btnTimerStop">结束并记录</button></div>
      <div class="sub" id="timerToday">今日专注 0 分钟 · 0 次</div></div>`,
    after:()=>bindTimerUI()},
  projects:{title:'项目进度',desc:'里程碑与风险',size:'2x2',link:['projects','全部项目'],
    acts:[{t:'+ 新建项目',pri:1,fn:()=>newProjectModal()}],
    body:()=>`<div id="projCards"></div>`},
  literature:{title:'文献 & 提醒',desc:'待读文献与到期提醒',size:'2x3',link:['literature','文献库'],
    acts:[{t:'+ 添加文献',pri:1,fn:()=>newLitModal()}],
    body:()=>`<div id="litList"></div><div class="divider" style="margin:4px 0"></div><div class="field-title">到期提醒</div><div id="reminderList"></div>`},
  experiments:{title:'实验台账',desc:'最近实验与状态',size:'4x2',link:['experiments','进入台账'],
    acts:[{t:'+ 新建实验',pri:1,fn:()=>newExpModal()}],
    body:()=>`<div id="expRecent"></div>`},
  reagents:{title:'试剂耗材',desc:'效期与余量预警',size:'1x2',link:['labres','台账'],
    acts:[{t:'+ 入库',pri:1,fn:()=>newReagentModal()}],
    body:()=>`<div id="reagentCard"></div>`,render:()=>renderReagentsCard()},
  instruments:{title:'仪器预约',desc:'机时安排与冲突检测',size:'2x1',link:['labres','仪器台账'],
    acts:[{t:'+ 预约',pri:1,fn:()=>newBookingModal()}],
    body:()=>`<div id="bookingCard"></div>`,render:()=>renderBookingCard()},
  deadlines:{title:'截止倒计时',desc:'结题 / 投稿 / 效期',size:'1x2',
    acts:[{t:'+ 提醒',pri:1,fn:()=>newReminderModal()}],
    body:()=>`<div id="deadlineCard"></div>`,render:()=>renderDeadlineCard()},
  budget:{title:'经费台账',desc:'支出与预算预警',size:'2x2',
    acts:[{t:'+ 记一笔',pri:1,fn:()=>newBudgetModal()}],
    body:()=>`<div id="budgetCard"></div>`,render:()=>renderBudgetCard()},
  notes:{title:'实验速记',desc:'随手记现象与思路',size:'2x1',
    acts:[{t:'+ 新建',pri:1,fn:()=>newNoteModal()}],
    body:()=>`<div id="notesCard"></div>`,render:()=>renderNotesCard()},
  slides:{title:'最近切片',desc:'一键回到裁剪工作区',size:'1x2',
    acts:[{t:'打开切片',pri:1,fn:()=>{openView('crop');const b=document.getElementById('btnOpenSlide');if(b)b.click()}}],
    body:()=>`<div id="slidesCard"></div>`,render:()=>renderSlidesCard()},
  qpcr:{title:'qPCR 分析',desc:'当前孔位与快速入口',size:'1x1',
    acts:[{t:'进入分析',pri:1,fn:()=>openView('qpcr')}],
    body:()=>`<div id="qpcrCard"></div>`,render:()=>renderQpcrCard()},
  heatmap:{title:'专注热力',desc:'本周每日强度',size:'1x1',
    body:()=>`<div id="heatCard"></div>`,render:()=>renderHeatCard()},
  tools:{title:'科研工具',desc:'全部工具入口',size:'4x2',
    body:()=>`<div id="toolsCard"></div>`,render:()=>renderToolsCard()},
};
const DEFAULT_LAYOUT=[
  {id:'kpi',size:'4x2'},{id:'tasks',size:'2x4'},{id:'focus',size:'2x2'},
  {id:'deadlines',size:'1x2'},{id:'reagents',size:'1x2'},{id:'projects',size:'2x2'},
  {id:'literature',size:'2x3'},{id:'instruments',size:'2x1'},{id:'notes',size:'2x1'},{id:'budget',size:'2x2'},
  {id:'experiments',size:'4x2'},
];
let dashLayout=(function(){
  try{
    const raw=localStorage.getItem(DASH_KEY);
    if(raw){const a=JSON.parse(raw);if(Array.isArray(a))return a.filter(x=>WIDGETS[x.id]).map(x=>({id:x.id,size:normSize(x.id,x.size)}))}
  }catch(e){}
  return DEFAULT_LAYOUT.map(x=>({...x}));
})();
function saveDash(){try{localStorage.setItem(DASH_KEY,JSON.stringify(dashLayout))}catch(e){}}
let dashEdit=false,dashRO=null,dragW=null,resizeRaf=0;

/* 尺寸现在由网格规格决定，不再量内容高度。这里只负责标记「正文还有内容没显示完」，
   给卡片底部加一层渐隐提示，鼠标移上去恢复清晰并可滚动。 */
function resizeDash(){
  document.querySelectorAll('#dashGrid>.wcard').forEach(c=>{
    const b=c.querySelector('.card-body');if(!b)return;
    b.classList.toggle('has-more',b.scrollHeight-b.clientHeight>2);
  });
}
function queueResize(){if(resizeRaf)return;resizeRaf=requestAnimationFrame(()=>{resizeRaf=0;resizeDash()})}
function clearDropMarks(){document.querySelectorAll('#dashGrid .wcard').forEach(c=>c.classList.remove('drop-before','drop-after'))}

function buildDash(intro){
  const grid=document.getElementById('dashGrid');if(!grid)return;
  if(dashRO){dashRO.disconnect();dashRO=null}
  grid.classList.toggle('dash-edit',dashEdit);
  const L=activeLayout();
  if(!L.length){grid.innerHTML='<div class="dash-empty">Dashboard 是空的 — 进入「编辑布局」后点「+ 添加卡片」挑几张放进来</div>';return}
  grid.innerHTML=L.map((w,i)=>{
    const def=WIDGETS[w.id];if(!def)return '';
    const acts=(def.acts||[]).map((a,j)=>`<button class="card-act${a.pri?' pri':''}" data-act="${j}">${esc(a.t)}</button>`).join('');
    const link=def.link?`<span class="link" data-goto="${def.link[0]}">${esc(def.link[1])} ›</span>`:'';
    const [cw,ch]=w.size.split('x');
    return `<div class="dash-card wcard w${cw} h${ch}${intro?' intro':''}" data-w="${w.id}" data-size="${w.size}"${dashEdit?' tabindex="0"':''} style="${intro?'animation-delay:'+Math.min(i*0.05,0.4)+'s':''}">
      <div class="card-inner">
        <div class="card-head">
          <span class="card-grip" title="按住拖动排序">${GRIP}</span>
          <h2>${esc(def.title)}</h2>
          <div class="card-actions">${acts}${link}
            <button class="card-act icon size" data-wc title="切换宽度：1 / 2 / 4 列">⇔</button>
            <span class="size-tag">${sizeLabel(w.size)}</span>
            <button class="card-act icon size" data-hc title="切换高度：1 / 2 / 3 / 4 行">⇕</button>
            <button class="card-act icon size" data-cfg title="精确设置位置与尺寸">⚙</button>
            <button class="card-act icon del" data-card-del title="从 Dashboard 移除">×</button>
          </div>
        </div>
        <div class="card-body">${def.body()}</div>
      </div></div>`;
  }).join('');
  dashRO=new ResizeObserver(queueResize);
  grid.querySelectorAll('.wcard').forEach(card=>{
    const id=card.dataset.w,def=WIDGETS[id];
    dashRO.observe(card.querySelector('.card-body'));
    card.querySelectorAll('[data-act]').forEach(b=>b.onclick=e=>{e.stopPropagation();def.acts[+b.dataset.act].fn()});
    const cycle=(key,vals)=>{
      const it=activeLayout().find(x=>x.id===id);if(!it)return;
      const p=parseSize(it.size)||parseSize(WIDGETS[id].size);
      const cur=key==='w'?p.w:p.h,next=vals[(vals.indexOf(cur)+1)%vals.length];
      it.size=key==='w'?next+'x'+p.h:p.w+'x'+next;
      if(dashEdit)touchDraft();else{saveDash();buildDash();refreshHome()}
    };
    const wc=card.querySelector('[data-wc]');if(wc)wc.onclick=()=>cycle('w',WCOLS);
    const hc=card.querySelector('[data-hc]');if(hc)hc.onclick=()=>cycle('h',HROWS);
    const del=card.querySelector('[data-card-del]');
    if(del)del.onclick=()=>{removeWidget(id);if(dashEdit)touchDraft();else{saveDash();buildDash();refreshHome()}toast('已移除「'+def.title+'」，可从「+ 添加卡片」加回')};
    const cfg=card.querySelector('[data-cfg]');if(cfg)cfg.onclick=()=>widgetDialog(id);
    bindCardDnD(card);bindCardKeys(card);
    if(def.after)def.after();
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
  /* 其余卡片各自渲染；卡片被移除时 setHTML 会安静跳过 */
  activeLayout().forEach(w=>{const d=WIDGETS[w.id];if(d&&d.render)d.render()});
  queueResize();
}
function openPicker(){
  const mask=document.createElement('div');mask.className='modal-mask';
  const box=document.createElement('div');box.className='roi-modal wide';
  const draw=()=>{
    box.innerHTML=`<h4>选择 Dashboard 卡片</h4>
      <div class="sub">已选 ${activeLayout().length} / ${Object.keys(WIDGETS).length} 张 · 点击切换显示${dashEdit?' · 改动需点「保存布局」':''}</div>
      <div class="picker-grid">${Object.entries(WIDGETS).map(([id,d])=>{
        const on=activeLayout().some(x=>x.id===id);
        return `<div class="pick-item${on?' on':''}" data-pick="${id}"><div class="nm">${esc(d.title)}<div class="ds">${esc(d.desc||'')}</div></div><span class="sz">${sizeLabel(d.size)}</span></div>`;
      }).join('')}</div>
      <div class="btn-row"><button class="btn pri" id="pk_done">完成</button><button class="btn sec" id="pk_reset">恢复默认布局</button></div>`;
    box.querySelectorAll('[data-pick]').forEach(el=>el.onclick=()=>{
      const id=el.dataset.pick;
      if(activeLayout().some(x=>x.id===id))removeWidget(id);
      else addWidget(id);
      if(dashEdit)touchDraft();else{saveDash();buildDash();refreshHome()}draw();
    });
    box.querySelector('#pk_done').onclick=()=>mask.remove();
    box.querySelector('#pk_reset').onclick=()=>{if(dashEdit){dashDraft=DEFAULT_LAYOUT.map(x=>({...x}));touchDraft()}else{dashLayout=DEFAULT_LAYOUT.map(x=>({...x}));saveDash();buildDash(true);refreshHome()}draw();toast('已套用默认布局')};
  };
  draw();
  mask.appendChild(box);document.getElementById('win').appendChild(mask);
  mask.onclick=e=>{if(e.target===mask)mask.remove()};
}
/* ===================== 专门的布局编辑器 =====================
   参考 Homarr 的 board edit mode：从工具栏进入编辑态，改动先落在草稿上，
   必须显式「保存布局」才写入；「取消」/Esc 原样还原，不会把误操作留在盘上。
   每张卡片还有一个精确数值对话框（位置序号 + 宽 + 高），拖不准时用它。 */
let dashDraft=null;
function activeLayout(){return dashEdit&&dashDraft?dashDraft:dashLayout}
function layoutDirty(){
  if(!dashEdit||!dashDraft)return false;
  return JSON.stringify(dashDraft)!==JSON.stringify(dashLayout);
}
function enterDashEdit(){
  if(dashEdit)return;
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
    ?'拖把手排序 · ⇔ 宽（1/2/4 列）· ⇕ 高（1–4 行）· ⚙ 精确设置 · × 移除 · 键盘：←→ 排序，Shift+←→ 改宽，Shift+↑↓ 改高'
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
  const it=activeLayout().find(x=>x.id===id);if(!it)return;
  it.size=(WCOLS.includes(+w)?+w:1)+'x'+(HROWS.includes(+h)?+h:2);
}
function removeWidget(id){
  const L=activeLayout(),i=L.findIndex(x=>x.id===id);if(i<0)return;
  L.splice(i,1);
}
function addWidget(id){
  const L=activeLayout();
  if(L.some(x=>x.id===id))return;
  L.push({id,size:WIDGETS[id].size});
}
/* 精确数值对话框：拖动难以对准格子时的兜底，也是键盘用户的入口 */
function widgetDialog(id){
  const L=activeLayout(),idx=L.findIndex(x=>x.id===id);if(idx<0)return;
  const def=WIDGETS[id],p=parseSize(L[idx].size)||parseSize(def.size);
  formModal('调整卡片：'+def.title,[
    {k:'pos',label:'位置序号（1 = 最前）',type:'number',value:idx+1},
    {k:'w',label:'宽度',type:'select',options:WCOLS.map(c=>c+' 列'),value:p.w+' 列'},
    {k:'h',label:'高度',type:'select',options:HROWS.map(r=>r+' 行'),value:p.h+' 行'},
  ],v=>{
    setWidgetSize(id,parseInt(v.w,10),parseInt(v.h,10));
    moveWidgetTo(id,(+v.pos||1)-1);
    touchDraft();
    toast('已调整「'+def.title+'」');
  },'应用');
}
function bindCardKeys(card){
  card.addEventListener('keydown',e=>{
    if(!dashEdit)return;
    const id=card.dataset.w,L=activeLayout(),i=L.findIndex(x=>x.id===id);if(i<0)return;
    const p=parseSize(L[i].size)||parseSize(WIDGETS[id].size);
    let handled=true;
    if(e.shiftKey&&e.key==='ArrowLeft')setWidgetSize(id,WCOLS[Math.max(0,WCOLS.indexOf(p.w)-1)],p.h);
    else if(e.shiftKey&&e.key==='ArrowRight')setWidgetSize(id,WCOLS[Math.min(WCOLS.length-1,WCOLS.indexOf(p.w)+1)],p.h);
    else if(e.shiftKey&&e.key==='ArrowUp')setWidgetSize(id,p.w,HROWS[Math.min(HROWS.length-1,HROWS.indexOf(p.h)+1)]);
    else if(e.shiftKey&&e.key==='ArrowDown')setWidgetSize(id,p.w,HROWS[Math.max(0,HROWS.indexOf(p.h)-1)]);
    else if(e.key==='ArrowLeft')moveWidgetTo(id,i-1);
    else if(e.key==='ArrowRight')moveWidgetTo(id,i+1);
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
document.getElementById('btnDashEdit').onclick=enterDashEdit;
document.getElementById('btnDashSave').onclick=()=>exitDashEdit(true);
document.getElementById('btnDashCancel').onclick=()=>exitDashEdit(false);
document.getElementById('btnDashReset').onclick=()=>{
  dashDraft=DEFAULT_LAYOUT.map(x=>({...x}));touchDraft();toast('已套用默认布局，仍需点「保存布局」');
};
document.getElementById('btnDashAdd').onclick=openPicker;
document.addEventListener('keydown',e=>{
  const typing=/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName||''))||e.target.isContentEditable;
  if((e.ctrlKey||e.metaKey)&&(e.key==='e'||e.key==='E')){
    if(document.querySelector('.modal-mask'))return;
    e.preventDefault();dashEdit?exitDashEdit(true):enterDashEdit();return;
  }
  if(e.key==='Escape'&&dashEdit&&!document.querySelector('.modal-mask')&&!typing){
    e.preventDefault();exitDashEdit(false);
  }
});
window.addEventListener('resize',queueResize);
