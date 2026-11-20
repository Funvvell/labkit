// LabKit · home-deck.js — 首页「今日科研指挥台」
// 只做摘要与入口，不复制 Dashboard 卡片数据；所有写入仍走既有 modal/Store/DB。
function deckPhaseLabel(){
  const h=new Date().getHours();
  return h<6?'凌晨':h<11?'早上':h<14?'午间':h<18?'下午':'晚上';
}
function deckWhenLabel(d,date){
  if(d===null||d===undefined)return date||'—';
  if(d<0)return '逾期'+(-d)+'天';
  if(d===0)return '今天';
  if(d===1)return '明天';
  return d+'天';
}
function deckWhenClass(d){
  if(d===null||d===undefined)return '';
  if(d<0)return 'danger';
  if(d<=3)return 'warn';
  return '';
}
function deckRecentRows(){
  const metas=window.TOOL_META||[];
  const tv=(typeof toolboxView==='function')?toolboxView():null;
  const hidden=new Set(tv?tv.hidden.map(t=>t.id):[]);
  /* 隐藏的工具不出现在「继续上次」——否则刚在工具箱里藏起来，首页又冒出来 */
  const recent=(Store.recent()||[]).map(id=>metas.find(t=>t.id===id)).filter(t=>t&&!hidden.has(t.id)).slice(0,2);
  const slides=(DB.recentSlides||[]).slice(0,1);
  return {recent,slides};
}
function deckTaskRow(t){
  return `<div class="deck-task${t.done?' done':''}"><input type="checkbox" class="task-check" data-check="${t.id}"${t.done?' checked':''} aria-label="${t.done?'恢复':'完成'}任务：${esc(t.name)}"><span class="nm">${esc(t.name)}</span><span class="due">${esc(t.due||'')}</span></div>`;
}
function renderHomeDeck(){
  const host=document.getElementById('homeDeck');
  if(!host)return;
  const todo=(DB.tasks||[]).filter(t=>!t.done);
  const keys=(DB.tasks||[]).filter(t=>t.key&&!t.done);
  const deadlines=(typeof collectDeadlines==='function'?collectDeadlines():[]).slice(0,3);
  const nowFocus=typeof focusOn==='function'?focusOn(todayStr()):0;
  const nowCount=typeof focusCountOn==='function'?focusCountOn(todayStr()):0;
  const phase=document.getElementById('deckPhase');
  const head=document.getElementById('deckHeadline');
  const summary=document.getElementById('deckSummary');
  if(phase)phase.textContent=deckPhaseLabel()+' · 今日科研指挥台';
  if(head){
    head.textContent=keys.length?('先推进：'+keys[0].name):todo.length?('今天还有 '+todo.length+' 项待办'):'今天从一件小事开始';
  }
  if(summary){
    summary.textContent=todo.length||deadlines.length
      ?(todo.length+' 项待办 · '+deadlines.length+' 个临近节点'+(nowFocus?' · 已专注 '+nowFocus+' 分钟':''))
      :'还没有安排。新建一个任务，或从工具库打开上次的工作。';
  }
  setHTML('deckFocus',(keys.length?keys:todo).slice(0,3).map(deckTaskRow).join('')
    ||'<div class="deck-empty"><b>今日没有重点任务。</b><br>从「＋ 任务」开始，或把已有任务设为今日重点。</div>');
  setHTML('deckDeadlines',deadlines.map(x=>{
    const d=x.d??x.days;
    return `<div class="deck-row"><span class="nm">${esc(x.text)}</span><span class="when ${deckWhenClass(d)}">${esc(deckWhenLabel(d,x.date))}</span></div>`;
  }).join('')||'<div class="deck-empty">近期没有截止事项。<br>专注做眼前这一步。</div>');
  const {recent,slides}=deckRecentRows();
  const recentHTML=recent.map(t=>`<button class="deck-tool" data-tool-id="${esc(t.id)}"><span class="ico">${toolIcon(t.id)}</span><span class="nm">${esc(t.name)}</span><span class="kind">最近</span></button>`).join('');
  const slideHTML=slides.map((s,i)=>`<button class="deck-tool" data-deck-slide="${i}"><span class="ico">${toolIcon('crop')}</span><span class="nm">${esc(s.name||'最近切片')}</span><span class="kind">切片</span></button>`).join('');
  setHTML('deckRecent',recentHTML+slideHTML||'<div class="deck-empty"><b>还没有最近记录。</b><br>打开一个工具后，这里会出现你的继续入口。</div>');
  if(typeof bindTaskEvents==='function')bindTaskEvents();
  if(typeof queueResize==='function')queueResize();
}
let _deckBound=false;
function deckBind(){
  if(_deckBound)return;
  const host=document.getElementById('homeDeck');
  if(!host)return;
  _deckBound=true;
  host.addEventListener('click',e=>{
    const act=e.target.closest('[data-deck-act]');
    if(act){
      const a=act.dataset.deckAct;
      if(a==='palette')paletteOpen();
      else if(a==='new-task')entityModal('task');
      else if(a==='new-exp')entityModal('exp');
      return;
    }
    const slide=e.target.closest('[data-deck-slide]');
    if(slide){
      const s=(DB.recentSlides||[])[+slide.dataset.deckSlide];
      if(!s||typeof openSlidePath!=='function')return;
      navigate('crop');
      openSlidePath(s.path);
    }
  });
  const wc=document.getElementById('wbCommand');
  if(wc)wc.onclick=paletteOpen;
}
