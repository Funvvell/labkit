// LabKit · home.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== 图表 ===================== */
function lineChart(data,w,h,color,fill){
  const max=Math.max(...data,1),n=data.length;
  const pts=data.map((v,i)=>`${(i/(n-1))*w},${h-6-(v/max)*(h-14)}`).join(' ');
  const area=`0,${h} ${pts} ${w},${h}`;
  const grid=[0.25,0.5,0.75].map(f=>`<line x1="0" y1="${h*f}" x2="${w}" y2="${h*f}" stroke="rgba(0,0,0,.06)" stroke-width="1"/>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" height="${h}"><defs><linearGradient id="g${color.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".22"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>${grid}<polygon class="lc-area" points="${area}" fill="url(#g${color.slice(1)})"/><polyline class="lc-line" pathLength="1" points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>${data.map((v,i)=>`<circle class="lc-dot" style="animation-delay:${0.2+i*0.07}s" cx="${(i/(n-1))*w}" cy="${h-6-(v/max)*(h-14)}" r="2.6" fill="#fff" stroke="${color}" stroke-width="1.8"/>`).join('')}</svg>`;
}
function pieChart(parts,size){
  let acc=0;const total=parts.reduce((s,p)=>s+p[1],0)||1;
  const stops=parts.map(([c,v])=>{const from=acc/total*360;acc+=v;const to=acc/total*360;return `${c} ${from}deg ${to}deg`}).join(',');
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:conic-gradient(${stops})"></div>`;
}

/* ===================== Dashboard 渲染 ===================== */
const PRI_CLS={urgent:['紧急','urgent'],important:['重要','important'],normal:['常规','normal']};
function taskHTML(t,showKey){
  const [pn,pc]=PRI_CLS[t.pri]||PRI_CLS.normal;
  const proj=DB.projects.find(p=>p.id===t.proj);
  return `<div class="task-item ${t.done?'done':''} ${showKey?'key':''}" data-task="${t.id}">
    <input type="checkbox" class="task-check" data-check="${t.id}"${t.done?' checked':''} aria-label="${t.done?'恢复':'完成'}任务：${esc(t.name)}">
    <div class="task-body">
      <div class="task-name">${esc(t.name)}</div>
      <div class="task-meta">
        <span class="badge ${pc}">${pn}</span>
        ${proj?`<span>${esc(proj.name)}</span>`:''}
        ${t.exp?`<span class="task-tag badge">${esc(t.exp)}</span>`:''}
        <span>截止 ${esc(t.due)}</span>
        ${(t.tags||[]).map(g=>`<span class="badge task-tag">${esc(g)}</span>`).join('')}
      </div>
    </div>
    <div class="task-act">
      ${showKey?'':`<button data-tomorrow="${t.id}" title="转入明天"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`}
    </div>
  </div>`;
}
function bindTaskEvents(){
  document.querySelectorAll('[data-check]').forEach(el=>{
    const fire=ev=>{
      ev.stopPropagation();
      const t=DB.tasks.find(x=>x.id===el.dataset.check);if(!t)return;
      setTaskState(t,t.done?'todo':'done');
    };
    el.onclick=el.tagName==='INPUT'?null:fire;
    if(el.tagName==='INPUT')el.onchange=fire;
  });
  document.querySelectorAll('[data-tomorrow]').forEach(el=>el.onclick=()=>{
    const t=DB.tasks.find(x=>x.id===el.dataset.tomorrow);if(!t)return;
    t.due='明天';t.dueDate=daysAgoISO(-1);t.key=false;saveDB();renderTasks();queueResize();toast('已转入明天：'+t.name);
  });
  document.querySelectorAll('[data-tstate]').forEach(el=>el.onclick=()=>{
    const [id,st]=el.dataset.tstate.split('|');
    const t=DB.tasks.find(x=>x.id===id);if(!t)return;setTaskState(t,st);
  });
}
/* 所有表格/列表共用的行内动作：编辑、删除。
   data-edit="kind|index"、data-del="kind|index"，见下面的 ENT 注册表。 */
function bindRowActs(){
  /* 只认带 "kind|index" 的值：Dashboard 卡片上还有别的 data-* 按钮，不能误绑 */
  document.querySelectorAll('[data-edit]').forEach(el=>{
    if(!String(el.dataset.edit).includes('|'))return;
    el.onclick=ev=>{ev.stopPropagation();const [k,i]=el.dataset.edit.split('|');entityModal(k,+i)};
  });
  document.querySelectorAll('[data-del]').forEach(el=>{
    if(!String(el.dataset.del).includes('|'))return;
    el.onclick=ev=>{ev.stopPropagation();const [k,i]=el.dataset.del.split('|');entityDelete(k,+i)};
  });
}
function rowActs(kind,i,extra){
  return `<div class="row-acts">${extra||''}<button class="mini-act" data-edit="${kind}|${i}">编辑</button><button class="mini-act danger" data-del="${kind}|${i}">删除</button></div>`;
}
/* 把自由填写的「今天 / 明天 / 周五 / 下周一 / 2026-12-01」解析成真实日期，
   日视图和周视图靠它分组；解析不出来（每天 / 每周 这类重复任务）返回 null。 */
function taskDay(t){
  if(t.dueDate&&/^\d{4}-\d{2}-\d{2}$/.test(t.dueDate))return t.dueDate;
  const s=String(t.due||'');
  if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);
  if(s.includes('今天'))return todayStr();
  if(s.includes('明天'))return daysAgoISO(-1);
  if(s.includes('后天'))return daysAgoISO(-2);
  const m=s.match(/周([一二三四五六日])/);
  if(m&&!s.includes('每周')){
    const want='日一二三四五六'.indexOf(m[1]);
    let off=(want-new Date().getDay()+7)%7;
    if(s.includes('下周'))off+=7;
    return daysAgoISO(-off);
  }
  return null;
}
function isRecurring(t){return /每天|每日|每周|每月/.test(String(t.due||''))}
/* 重复任务按规则落到具体某天：每天=天天出现，每周五=只在周五，
   不能一律铺满整周（那样周视图就失去意义了）。 */
function taskOnDay(t,d){
  const s=String(t.due||'');
  if(/每天|每日/.test(s))return true;
  const wm=s.match(/每周([一二三四五六日])/);
  if(wm)return '日一二三四五六'.indexOf(wm[1])===new Date(d+'T00:00').getDay();
  if(/每周|每月/.test(s))return false;
  return taskDay(t)===d;
}
const TSTATE=[['todo','待办'],['doing','进行中'],['done','完成']];
function setTaskState(t,st){
  t.state=st;t.done=st==='done';
  t.doneAt=st==='done'?todayStr():'';
  saveDB();renderTasks();renderKpi();renderReports();
  if(typeof renderHomeDeck==='function')renderHomeDeck();
  queueResize();
}
function boardCard(t){
  const i=DB.tasks.indexOf(t);
  return `<div class="board-card" draggable="true" data-tcard="${t.id}">
    <div class="n">${esc(t.name)}</div>
    <div class="task-meta"><span class="badge ${(PRI_CLS[t.pri]||PRI_CLS.normal)[1]}">${(PRI_CLS[t.pri]||PRI_CLS.normal)[0]}</span><span>${esc(t.due)}</span>${t.key?'<span class="badge important">重点</span>':''}</div>
    <div class="row-acts">
      ${TSTATE.filter(([s])=>s!==t.state).map(([s,l])=>`<button class="mini-act" data-tstate="${t.id}|${s}">${l}</button>`).join('')}
      <button class="mini-act" data-edit="task|${i}">编辑</button>
      <button class="mini-act danger" data-del="task|${i}">删除</button>
    </div></div>`;
}
function renderTasks(){
  const keys=DB.tasks.filter(t=>t.key&&!t.done);
  setHTML('todayKey',(keys.length?'<div class="field-title">今日重点</div>':'')+keys.map(t=>taskHTML(t,true)).join(''));
  const list=DB.tasks.filter(t=>!t.key);
  setHTML('todayTasks',list.map(t=>taskHTML(t)).join('')||'<div class="sub">今天没有其他任务</div>');
  /* 看板：三列由真实 state 决定。以前「进行中」永远写死 1 条、且取第一条未完成任务冒充。 */
  const board=document.getElementById('taskBoard');
  if(board)board.innerHTML=TSTATE.map(([st,label])=>{
    const items=DB.tasks.filter(t=>(t.state||(t.done?'done':'todo'))===st);
    return `<div class="board-col" data-tcol="${st}"><h3>${label} · ${items.length}</h3>${items.map(boardCard).join('')||'<div class="sub">拖动卡片到这里</div>'}</div>`;
  }).join('');
  const tl=document.getElementById('taskList');
  if(tl)tl.innerHTML=DB.tasks.map((t,i)=>`<div class="list-row">${taskHTML(t)}<div class="row-acts"><button class="mini-act" data-edit="task|${i}">编辑</button><button class="mini-act danger" data-del="task|${i}">删除</button></div></div>`).join('')||'<div class="sub">还没有任务</div>';
  renderTaskCal();
  bindTaskEvents();bindRowActs();bindBoardDnD();
}
/* 日 / 周视图：以前是「开发中」提示，现在按真实日期分栏 */
function renderTaskCal(){
  const wrap=document.getElementById('taskCal');if(!wrap)return;
  const mode=wrap.dataset.mode||'day';
  const cols=mode==='day'?[todayStr()]:Array.from({length:7},(_,i)=>daysAgoISO(-i));
  wrap.innerHTML=`<div class="cal-row">${cols.map(d=>{
    const dt=new Date(d+'T00:00');
    const items=DB.tasks.filter(t=>taskOnDay(t,d));
    return `<div class="cal-col"><h3>${d===todayStr()?'今天':d.slice(5)} · 周${'日一二三四五六'[dt.getDay()]}<span class="cnt">${items.length}</span></h3>
      ${items.map(t=>`<div class="cal-item${t.done?' done':''}"><label><input type="checkbox" data-check="${t.id}"${t.done?' checked':''}><span>${esc(t.name)}</span></label><div class="task-meta"><span class="badge ${(PRI_CLS[t.pri]||PRI_CLS.normal)[1]}">${(PRI_CLS[t.pri]||PRI_CLS.normal)[0]}</span>${isRecurring(t)?'<span class="badge normal">重复</span>':''}</div></div>`).join('')||'<div class="sub">无安排</div>'}</div>`;
  }).join('')}</div>`;
}
function bindBoardDnD(){
  let dragId=null;
  document.querySelectorAll('[data-tcard]').forEach(c=>{
    c.addEventListener('dragstart',e=>{dragId=c.dataset.tcard;c.classList.add('dragging');try{e.dataTransfer.setData('text/plain',dragId)}catch(_){}});
    c.addEventListener('dragend',()=>{c.classList.remove('dragging');dragId=null;document.querySelectorAll('[data-tcol]').forEach(x=>x.classList.remove('col-over'))});
  });
  document.querySelectorAll('[data-tcol]').forEach(col=>{
    col.addEventListener('dragover',e=>{if(!dragId)return;e.preventDefault();col.classList.add('col-over')});
    col.addEventListener('dragleave',()=>col.classList.remove('col-over'));
    col.addEventListener('drop',e=>{
      e.preventDefault();col.classList.remove('col-over');
      const t=DB.tasks.find(x=>x.id===dragId);if(!t)return;
      setTaskState(t,col.dataset.tcol);toast('「'+t.name+'」→ '+TSTATE.find(s=>s[0]===col.dataset.tcol)[1]);
    });
  });
}
function kpiData(){
  const todayFocus=focusOn(todayStr());
  const weekFocus=sum(seriesFocus(7));
  const doneWeek=DB.tasks.filter(t=>t.done).length;
  return [
    [String(DB.projects.length),'进行中项目','','projects'],
    [String(DB.tasks.filter(t=>!t.done).length),'待办任务','','tasks'],
    [Math.round(doneWeek/Math.max(DB.tasks.length,1)*100)+'%','任务完成率','','reports'],
    [weekFocus+'′','近 7 天专注','+'+todayFocus+'′ 今日','focus'],
    [String(DB.literatures.filter(l=>l.status!=='已读完').length),'文献待读','','literature'],
    [String(DB.reagents.filter(r=>{const d=daysLeft(r.exp);return d!==null&&d<=30}).length),'试剂近效期','','labres'],
  ];
}
function kpiHTML(){
  return kpiData().map(([n,l,d,g])=>`<div class="kpi" data-goto="${g}" title="点击查看详情"><div class="num">${n}</div><div class="label">${l}</div>${d?`<div class="delta">${d}</div>`:''}</div>`).join('');
}
function renderKpi(){
  setHTML('kpiRow',kpiHTML());
  /* KPI 数字滚动入场 */
  document.querySelectorAll('#kpiRow .num').forEach((el,idx)=>{
    const m=el.textContent.match(/^(\d+)(.*)$/);if(!m)return;
    const target=+m[1],suf=m[2],t0=performance.now(),dur=700+idx*60;
    const step=t=>{const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=Math.round(target*e)+suf;if(p<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);
  });
  setHTML('chartFocus',lineChart(seriesFocus(7),300,90,'#007AFF'));
  setHTML('chartTasks',lineChart(seriesTasks(7),300,90,'#30D158'));
  setText('timerToday',`今日专注 ${focusOn(todayStr())} 分钟 · ${focusCountOn(todayStr())} 次`);
}
function renderProjects(){
  const card=(p,i)=>{
    const ms=(p.milestones||[]).map(([m,d])=>`<span class="ms ${d?'done':''}">${esc(m)}</span>`).join('');
    return `<div class="proj-mini"><div class="row1"><b>${esc(p.name)}</b><span class="badge normal">${esc(p.stage)}</span></div>
      <div class="sub" style="margin-top:2px">${esc(p.code)} · ${esc(p.owner)} · ${esc(p.start)} ~ ${esc(p.end||'—')}</div>
      <div class="progress"><div class="progress-fill" data-w="${p.progress}" style="width:0"></div></div>
      <div class="milestones">${ms}</div>
      ${p.risk?`<div class="sub" style="color:#8a5a00">风险：${esc(p.risk)}</div>`:''}
      ${i==null?'':rowActs('project',i)}</div>`;
  };
  setHTML('projCards',DB.projects.slice(0,2).map(p=>card(p)).join('')||'<div class="sub">还没有项目，点右上角新建</div>');
  document.getElementById('projGrid').innerHTML=DB.projects.map((p,i)=>`<div class="proj-card">${card(p,i)}
    <div class="btn-row"><button class="btn sec" data-open-exp="${p.id}">实验列表</button><button class="btn sec" data-proj-note="${i}">项目笔记${p.note?' ●':''}</button></div></div>`).join('')||'<div class="sub">还没有项目</div>';
  document.querySelectorAll('[data-open-exp]').forEach(el=>el.onclick=()=>{document.getElementById('expFilterProj').value=el.dataset.openExp;renderExpTable();openView('experiments')});
  document.querySelectorAll('[data-proj-note]').forEach(el=>el.onclick=()=>projNoteModal(+el.dataset.projNote));
  bindRowActs();
  /* 进度条从 0 伸展到目标宽度（双 rAF 确保过渡生效） */
  requestAnimationFrame(()=>requestAnimationFrame(()=>{document.querySelectorAll('.progress-fill[data-w]').forEach(el=>{el.style.width=el.dataset.w+'%';});}));
}
/* 极简 Markdown：先转义再套标签，绝不把用户内容当 HTML 执行 */
function mdLite(s){
  const lines=esc(String(s||'')).split('\n');let out='',inList=false;
  for(const ln of lines){
    const li=ln.match(/^\s*[-*]\s+(.*)$/);
    if(li){if(!inList){out+='<ul>';inList=true}out+='<li>'+inline(li[1])+'</li>';continue}
    if(inList){out+='</ul>';inList=false}
    const h=ln.match(/^(#{1,3})\s+(.*)$/);
    if(h){out+='<h'+(h[1].length+2)+'>'+inline(h[2])+'</h'+(h[1].length+2)+'>';continue}
    out+=ln.trim()?'<p>'+inline(ln)+'</p>':'';
  }
  if(inList)out+='</ul>';
  return out||'<div class="sub">还没有笔记</div>';
  function inline(t){return t.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`(.+?)`/g,'<code>$1</code>')}
}
function projNoteModal(i){
  const p=DB.projects[i];if(!p)return;
  const mask=document.createElement('dialog');mask.className='modal-mask';mask.setAttribute('aria-label',p.name+' 项目笔记');
  const box=document.createElement('div');box.className='roi-modal wide';
  const close=()=>{closeLayer(mask);if(mask.parentNode)mask.remove()};
  const draw=edit=>{
    box.innerHTML=`<h4>${esc(p.name)} · 项目笔记</h4>
      <div class="sub">支持 # 标题、- 列表、**加粗**</div>
      ${edit?`<textarea id="pn_ta" style="width:100%;min-height:230px;margin-top:10px;font-family:var(--mono);font-size:12px;padding:10px;border:1px solid var(--line);border-radius:9px;background:var(--bg);color:var(--ink)" placeholder="## 本周进展&#10;- 灌胃第 4 周完成&#10;**下一步**：取样"></textarea>
        <div class="btn-row" style="margin-top:12px"><button class="btn" id="pn_save">保存</button><button class="btn sec" id="pn_cancel">取消</button></div>`
      :`<div class="md-body">${mdLite(p.note)}</div>
        <div class="btn-row" style="margin-top:12px"><button class="btn" id="pn_edit">编辑笔记</button><button class="btn sec" id="pn_cancel">关闭</button></div>`}`;
    box.querySelector('#pn_cancel').onclick=close;
    if(edit){
      const ta=box.querySelector('#pn_ta');ta.value=p.note||'';ta.focus();
      box.querySelector('#pn_save').onclick=()=>{p.note=ta.value;saveDB();renderProjects();close();toast('已保存项目笔记')};
    }else box.querySelector('#pn_edit').onclick=()=>draw(true);
  };
  mask.appendChild(box);document.body.appendChild(mask);
  mask.addEventListener('close',()=>{if(mask.parentNode)mask.remove()});
  mask.addEventListener('click',ev=>{if(ev.target===mask)close()});
  openLayer(mask);
  draw(false);
}
function renderLitRemind(){
  setHTML('litList',DB.literatures.slice(0,3).map(l=>`<div class="lit-item"><div class="t">${esc(l.title)}</div><span class="badge ${l.status==='待精读'?'important':l.status==='笔记待整理'?'urgent':'normal'}">${esc(l.status)}</span></div>`).join('')||'<div class="sub">文献库为空</div>');
  setHTML('reminderList',DB.reminders.map(r=>`<div class="remind-item"><span class="dot-r" style="background:${r.color}"></span><div class="t">${esc(r.text)}</div><div class="m">${esc(r.date)}</div></div>`).join('')||'<div class="sub">暂无提醒</div>');
}
function renderExperiments(){
  setHTML('expRecent',DB.experiments.slice(0,4).map(e=>`
    <div class="exp-row"><span class="exp-id">${esc(e.id)}</span><span class="exp-name">${esc(e.note)}</span><span class="exp-meta">${esc(e.proj)} · ${esc(e.type)} · ${esc(e.date)}</span><span class="status-badge ${STATUS_CLS[e.status]}">${esc(e.status)}</span></div>`).join('')||'<div class="sub">还没有实验记录</div>');
  const projSel=document.getElementById('expFilterProj'),keep=projSel.value;
  projSel.innerHTML='<option>全部项目</option>'+DB.projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
  if(keep&&[...projSel.options].some(o=>o.value===keep))projSel.value=keep;
  renderExpTable();
}
function renderExpTable(){
  const fp=document.getElementById('expFilterProj').value,ft=document.getElementById('expFilterType').value,fs=document.getElementById('expFilterStatus').value;
  /* 过滤后仍要能定位回原数组，所以先带上原始下标再筛 */
  const rows=DB.experiments.map((e,i)=>({e,i})).filter(({e})=>(fp==='全部项目'||DB.projects.find(p=>p.id===fp)?.name===e.proj)&&(ft==='全部类型'||e.type===ft)&&(fs==='全部状态'||e.status===fs));
  document.getElementById('expTable').innerHTML=`<table class="tbl"><thead><tr><th>实验 ID</th><th>归属项目</th><th>类型</th><th>日期</th><th>状态</th><th>摘要 / 备注</th><th>操作</th></tr></thead><tbody>${rows.map(({e,i})=>`<tr><td class="name">${esc(e.id)}</td><td>${esc(e.proj)}</td><td>${esc(e.type)}</td><td>${esc(e.date)}</td><td><span class="status-badge ${STATUS_CLS[e.status]}">${esc(e.status)}</span></td><td style="white-space:normal;max-width:280px">${esc(e.note)}</td><td>${rowActs('exp',i)}</td></tr>`).join('')||'<tr><td colspan="7" class="sub">无匹配记录</td></tr>'}</tbody></table>`;
  bindRowActs();
}
let litSource='all';
function renderLiterature(){
  if(typeof renderZoteroBar==='function')renderZoteroBar();
  document.querySelectorAll('[data-litsrc]').forEach(b=>b.classList.toggle('active',b.dataset.litsrc===litSource));
  const rows=DB.literatures.map((l,i)=>({l,i})).filter(({l})=>
    litSource==='all'||(litSource==='zotero'?!!l.zoteroKey:!l.zoteroKey));
  document.getElementById('litTable').innerHTML=`<table class="tbl"><thead><tr><th>标题</th><th>来源</th><th>状态</th><th>笔记</th><th>操作</th></tr></thead><tbody>${rows.map(({l,i})=>`<tr><td class="name" style="white-space:normal;max-width:340px">${esc(l.title)}${l.zoteroKey?' <span class="z-tag">Zotero</span>':''}</td><td>${esc(l.meta)}</td><td><span class="badge ${l.status==='待精读'?'important':l.status==='笔记待整理'?'urgent':'normal'}">${esc(l.status)}</span></td><td style="white-space:normal;max-width:220px;color:var(--muted)">${esc((l.note||'').slice(0,60))||'—'}</td><td>${rowActs('lit',i,[l.doi?`<button class="mini-act" data-doi="${i}">原文</button>`:'',l.zoteroKey?`<button class="mini-act" data-zot="${i}">Zotero</button>`:''].join(''))}</td></tr>`).join('')||'<tr><td colspan="5" class="sub">'+(litSource==='zotero'?'还没有从 Zotero 导入的文献 · 点上方「从 Zotero 导入」':'文献库为空，点右上角添加')+'</td></tr>'}</tbody></table>`;
  bindRowActs();
  document.querySelectorAll('[data-litsrc]').forEach(b=>b.onclick=()=>{litSource=b.dataset.litsrc;renderLiterature()});
  document.querySelectorAll('[data-doi]').forEach(el=>el.onclick=()=>{
    const l=DB.literatures[+el.dataset.doi];if(!l||!l.doi)return;
    const u=/^https?:/.test(l.doi)?l.doi:'https://doi.org/'+l.doi.replace(/^doi:/i,'');
    if(IN_TAURI)invoke('plugin:opener|open_url',{url:u}).catch(e=>toast('打开失败，链接：'+u,7000));else window.open(u,'_blank');
  });
  document.querySelectorAll('[data-zot]').forEach(el=>el.onclick=()=>{
    const l=DB.literatures[+el.dataset.zot];if(l&&l.zoteroKey&&typeof zoteroOpen==='function')zoteroOpen(l.zoteroKey,false);
  });
}
let labTab='reagent';
function renderLab(){
  const kind=labTab==='reagent'?'reagent':labTab==='instrument'?'instrument':'booking';
  let html='';
  if(labTab==='reagent'){
    html=`<table class="tbl"><thead><tr><th>名称</th><th>货号</th><th>批次</th><th>位置</th><th>开封</th><th>有效期</th><th>余量</th><th>操作</th></tr></thead><tbody>${DB.reagents.map((r,i)=>{
      const d=daysLeft(r.exp),warn=d===null?'':d<0?' <span class="warn-pill red">已过期</span>':d<=30?` <span class="warn-pill orange">${d} 天</span>`:'';
      return `<tr><td class="name">${esc(r.name)}</td><td>${esc(r.no)}</td><td>${esc(r.lot)}</td><td>${esc(r.loc)}</td><td>${esc(r.open||'—')}</td><td>${esc(r.exp)}${warn}</td><td>${esc(r.left)}</td><td>${rowActs('reagent',i)}</td></tr>`;
    }).join('')||'<tr><td colspan="8" class="sub">还没有试剂，点右上角新增</td></tr>'}</tbody></table>`;
  }else if(labTab==='instrument'){
    html=`<table class="tbl"><thead><tr><th>仪器</th><th>最近校准</th><th>下次校准</th><th>备注</th><th>操作</th></tr></thead><tbody>${DB.instruments.map((x,i)=>{
      const d=daysLeft(x.next),warn=d===null?'':d<0?' <span class="warn-pill red">超期</span>':d<=30?` <span class="warn-pill orange">${d} 天</span>`:'';
      return `<tr><td class="name">${esc(x.name)}</td><td>${esc(x.cal)}</td><td>${esc(x.next)}${warn}</td><td>${esc(x.note)}</td><td>${rowActs('instrument',i)}</td></tr>`;
    }).join('')||'<tr><td colspan="5" class="sub">还没有仪器，点右上角新增</td></tr>'}</tbody></table>`;
  }else{
    html=`<table class="tbl"><thead><tr><th>日期</th><th>时段</th><th>仪器</th><th>使用人</th><th>用途 / 项目</th><th>操作</th></tr></thead><tbody>${DB.bookings.map((b,i)=>{
      const past=daysLeft(b.date);
      return `<tr${past!==null&&past<0?' style="opacity:.55"':''}><td class="name">${esc(b.date)}</td><td>${esc(b.slot)}</td><td>${esc(b.inst)}</td><td>${esc(b.who)}</td><td>${esc(b.proj||'—')}</td><td>${rowActs('booking',i)}</td></tr>`;
    }).join('')||'<tr><td colspan="6" class="sub">还没有机时预约，点右上角新增</td></tr>'}</tbody></table>`;
  }
  document.getElementById('labTable').innerHTML=html;
  const btn=document.getElementById('btnLabNew');
  if(btn)btn.textContent=labTab==='reagent'?'新增试剂':labTab==='instrument'?'新增仪器':'新增预约';
  bindRowActs();
}function renderFocusPage(){
  const byType={},byProj={};let total=0;
  DB.focusRecords.forEach(r=>{byType[r.type]=(byType[r.type]||0)+r.minutes;byProj[r.project]=(byProj[r.project]||0)+r.minutes;total+=r.minutes});
  const colors=['#007AFF','#30D158','#FF9F0A','#7B5CFF','#F0832A'];
  const bar=(obj,unit)=>{const mx=Math.max(1,...Object.values(obj));
    return Object.entries(obj).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar-row"><span class="bl" title="${esc(k)}">${esc(k)}</span><div class="bar"><i style="width:${v/mx*100}%"></i></div><span class="bv">${v}${unit}</span></div>`).join('')||'<div class="sub">还没有记录</div>'};
  document.getElementById('focusPie').innerHTML=(total?pieChart(Object.entries(byType).map(([k,v],i)=>[colors[i%5],v]),120):'<div class="sub" style="padding:26px 0;text-align:center">还没有专注记录</div>')+`<div class="sub" style="margin-top:10px">总时长 ${total} 分钟 · 近 7 天 ${sum(seriesFocus(7))} 分钟</div>`;
  document.getElementById('focusByProj').innerHTML=bar(byProj,'′');
  document.getElementById('focusTotal').innerHTML=`<div class="kpi"><div class="num">${total}′</div><div class="label">累计专注</div></div><div class="kpi" style="margin-top:8px"><div class="num">${DB.focusRecords.length}</div><div class="label">专注次数</div></div><div class="kpi" style="margin-top:8px"><div class="num">${focusOn(todayStr())}′</div><div class="label">今日专注</div></div>`;
  /* 记录表带编辑/删除：以前只能看，记错了只能去改 JSON */
  const rows=DB.focusRecords.map((r,i)=>({r,i})).sort((a,b)=>String(b.r.at).localeCompare(String(a.r.at)));
  document.getElementById('focusTable').innerHTML=`<table class="tbl"><thead><tr><th>时间</th><th>项目</th><th>类型</th><th>时长</th><th>操作</th></tr></thead><tbody>${rows.map(({r,i})=>`<tr><td class="name">${esc(fmtRecAt(r))}</td><td>${esc(r.project)}</td><td>${esc(r.type)}</td><td>${r.minutes} 分钟</td><td>${rowActs('focus',i)}</td></tr>`).join('')||'<tr><td colspan="5" class="sub">还没有专注记录，用首页计时卡片开始一次专注</td></tr>'}</tbody></table>`;
  bindRowActs();
}
let reportRange=14;
function renderReports(){
  /* 以前这里直接抄 kpiRow.innerHTML，卡片一被移除报表页就空白；现在独立计算 */
  setHTML('reportKpi',kpiHTML());
  const n=reportRange,sv=seriesFocus(n),st=seriesTasks(n),days=lastDays(n);
  setHTML('reportChart',lineChart(sv,720,140,'#007AFF'));
  setText('reportChartNote',`${days[0]} ~ ${days[n-1]} · 专注合计 ${sum(sv)} 分钟 · 完成任务 ${sum(st)} 项 · 日均 ${Math.round(sum(sv)/n)} 分钟`);
  const byProj={};DB.focusRecords.forEach(r=>{byProj[r.project]=(byProj[r.project]||0)+r.minutes});
  const mxp=Math.max(1,...Object.values(byProj));
  setHTML('reportProj',Object.entries(byProj).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar-row"><span class="bl" title="${esc(k)}">${esc(k)}</span><div class="bar"><i style="width:${v/mxp*100}%"></i></div><span class="bv">${v}′</span></div>`).join('')||'<div class="sub">还没有专注记录</div>');
  const byStatus={};DB.experiments.forEach(e=>{byStatus[e.status]=(byStatus[e.status]||0)+1});
  const mxs=Math.max(1,...Object.values(byStatus));
  setHTML('reportExp',Object.entries(byStatus).map(([k,v])=>`<div class="bar-row"><span class="bl">${esc(k)}</span><div class="bar"><i style="width:${v/mxs*100}%"></i></div><span class="bv">${v} 次</span></div>`).join('')||'<div class="sub">还没有实验记录</div>');
  const byState={todo:0,doing:0,done:0};DB.tasks.forEach(t=>{byState[t.state||(t.done?'done':'todo')]++});
  setHTML('reportTask',TSTATE.map(([s,l])=>`<div class="bar-row"><span class="bl">${l}</span><div class="bar"><i style="width:${byState[s]/Math.max(1,DB.tasks.length)*100}%"></i></div><span class="bv">${byState[s]} 项</span></div>`).join('')
    +`<div class="sub" style="margin-top:8px">近 ${n} 天完成 ${sum(st)} 项${DB.tasks.length?'':' · 还没有任务'}</div>`);
  const byCat={};DB.budget.forEach(b=>{byCat[b.cat]=(byCat[b.cat]||0)+(+b.amount||0)});
  const spent=sum(DB.budget.map(b=>+b.amount||0));
  setHTML('reportBudget',Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar-row"><span class="bl">${esc(k)}</span><div class="bar"><i style="width:${v/Math.max(1,spent)*100}%"></i></div><span class="bv">¥${v}</span></div>`).join('')
    +`<div class="sub" style="margin-top:8px">已支出 ¥${spent.toLocaleString()} / 预算 ¥${(+DB.budgetTotal||0).toLocaleString()}（${Math.round(spent/Math.max(1,DB.budgetTotal)*100)}%）</div>`);
}

/* ===================== 专注计时器 ===================== */
let timer={running:false,paused:false,phase:'work',left:25*60,total:25*60,tick:null};
function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function setPreset(w,b){
  setText('focusPresetTag',w+' + '+b);
  timer.work=w*60;timer.rest=b*60;
  if(!timer.running){timer.phase='work';timer.left=timer.work;drawTimer();}
}
function drawTimer(){
  const el=document.getElementById('timerNum');
  if(!el)return;                       /* 专注卡片被移除时计时照常走，只是不画 */
  el.textContent=fmt(timer.left);
  el.className='timer-num'+(timer.phase==='break'?' breaking':timer.running&&!timer.paused?' running':'');
  setText('timerPhase',timer.phase==='break'?'休息':'专注');
  const s=document.getElementById('btnTimerStart');
  if(s){s.textContent=timer.paused?'继续':timer.running?'进行中…':'开始';s.disabled=timer.running&&!timer.paused;}
}
function tickTimer(){
  if(!timer.running||timer.paused)return;
  timer.left--;
  if(timer.left<=0){
    if(timer.phase==='work'){toast('专注完成！休息一下');timer.phase='break';timer.left=timer.rest;}
    else{finishFocus(true);return;}
  }
  drawTimer();
}
function finishFocus(auto){
  if(timer.tick){clearInterval(timer.tick);timer.tick=null;}
  const mins=Math.round((timer.total-Math.max(timer.left,0))/60);
  if(mins>=1&&!auto||auto&&mins>=1){
    /* 专注卡片可能已被移出 Dashboard，此时按「未指定」记账，计时本身照常 */
    const pj=document.getElementById('timerProject'),tp=document.getElementById('timerType');
    DB.focusRecords.push({id:uid('f'),project:(pj&&pj.value)||'未指定',type:(tp&&tp.value)||'实验操作',minutes:mins,at:nowStamp()});
    toast('已记录专注 '+mins+' 分钟');
  }
  timer.running=false;timer.paused=false;timer.phase='work';timer.left=timer.work;timer.total=timer.work;
  saveDB();drawTimer();renderKpi();renderFocusPage();
  if(activeLayout().some(w=>w.id==='heatmap'))renderHeatCard();
  queueResize();
}
/* 计时器 UI 现在是可移除的 Dashboard 卡片，绑定必须能重复执行：
   卡片每次重建后由 after() 再调一次，而不是在脚本加载时一次性绑定。 */
function bindTimerUI(){
  const sel=document.getElementById('timerProject');
  if(sel)sel.innerHTML=DB.projects.map(p=>`<option>${esc(p.name)}</option>`).join('')+'<option>未指定</option>';
  document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{
    document.querySelectorAll('[data-preset]').forEach(x=>x.classList.remove('active'));b.classList.add('active');
    const [w,rest]=b.dataset.preset.split(',').map(Number);setPreset(w,rest);
  });
  const s=document.getElementById('btnTimerStart');
  if(s)s.onclick=()=>{
    if(timer.running&&!timer.paused)return;
    if(!timer.running){timer.total=timer.left;}
    timer.running=true;timer.paused=false;
    if(!timer.tick)timer.tick=setInterval(tickTimer,1000);
    drawTimer();
  };
  const p=document.getElementById('btnTimerPause');
  if(p)p.onclick=()=>{if(!timer.running)return;timer.paused=!timer.paused;drawTimer();toast(timer.paused?'已暂停':'继续')};
  const st=document.getElementById('btnTimerStop');
  if(st)st.onclick=()=>{if(timer.running||timer.paused){finishFocus(false)}else toast('计时尚未开始')};
  drawTimer();
}
document.getElementById('btnQuickFocus').onclick=()=>{openView('home');const c=document.querySelector('#dashGrid [data-w="focus"]');if(c)c.scrollIntoView({behavior:'smooth',block:'center'});else toast('专注计时卡片已被移除，可在「+ 添加卡片」中加回')};

/* ===================== 子页交互 ===================== */
document.querySelectorAll('[data-tview]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('[data-tview]').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  const v=b.dataset.tview;
  document.getElementById('taskBoard').style.display=v==='board'?'':'none';
  document.getElementById('taskListWrap').style.display=v==='list'?'':'none';
  const cal=document.getElementById('taskCal');
  cal.style.display=(v==='day'||v==='week')?'':'none';
  cal.dataset.mode=v==='week'?'week':'day';
  renderTaskCal();bindTaskEvents();
});
document.querySelectorAll('[data-labtab]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('[data-labtab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  labTab=b.dataset.labtab;renderLab();
});
['expFilterProj','expFilterType','expFilterStatus'].forEach(id=>document.getElementById(id).addEventListener('change',renderExpTable));
document.getElementById('btnNewTask').onclick=()=>newTaskModal();
document.getElementById('btnNewProject').onclick=()=>newProjectModal();
document.getElementById('btnNewExp').onclick=()=>newExpModal();
document.getElementById('btnNewLit').onclick=()=>newLitModal();
function dlCSV(name,rows){
  const csv=rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
  toast('已导出 '+name);
}
function dlJSON(name,obj){
  const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
  toast('已导出 '+name);
}
document.getElementById('btnFocusExport').onclick=()=>dlCSV('专注记录.csv',[['日期','开始','项目','类型','分钟'],...DB.focusRecords.map(r=>[String(r.at).slice(0,10),(String(r.at).match(/T(\d{2}:\d{2})/)||[])[1]||'',r.project,r.type,r.minutes])]);
document.getElementById('btnReportExport').onclick=()=>{const sv=seriesFocus(reportRange),st=seriesTasks(reportRange),days=lastDays(reportRange);
  dlCSV('统计报表.csv',[['指标','数值'],['统计区间',days[0]+' ~ '+days[reportRange-1]],['专注合计(分)',sum(sv)],['完成任务',sum(st)],['进行中项目',DB.projects.length],['待办任务',DB.tasks.filter(t=>!t.done).length],['文献待读',DB.literatures.filter(l=>l.status!=='已读完').length],['经费支出',sum(DB.budget.map(b=>+b.amount||0))],[],['日期','专注(分)','完成任务'],...days.map((d,i)=>[d,sv[i],st[i]])])};

/* ===================== Window controls ===================== */
async function winAction(fn){
  if(IN_TAURI){try{await fn()}catch(e){toast('窗口操作失败：'+e)}}
  else{toast('浏览器预览模式：窗口控制需 Tauri 运行时')}
}
if(IN_TAURI){
  const W=window.__TAURI__?.window||window.__TAURI_INTERNALS__;
  document.getElementById('btnClose').onclick=()=>winAction(()=>W.getCurrentWindow().close());
  document.getElementById('btnMin').onclick=()=>winAction(()=>W.getCurrentWindow().minimize());
  document.getElementById('btnMax').onclick=()=>winAction(()=>W.getCurrentWindow().toggleMaximize());
}else{
  ['btnClose','btnMin','btnMax'].forEach(id=>document.getElementById(id).onclick=()=>toast('浏览器预览模式'));
}

