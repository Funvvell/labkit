// LabKit · notify.js — P3 通知中心：任务截止 / 试剂效期 / 仪器校准 / 提醒 / 系统事件汇总
function notifyItems(){
  const items=[];const today=new Date(todayStr());
  const days=s=>{const d=new Date(s);return isNaN(d)?null:Math.round((d-today)/86400000);};
  (DB.tasks||[]).forEach(t=>{
    if(t.done||!t.due)return;
    items.push({urgent:/今天|明天/.test(t.due),text:t.name,sub:'任务截止 · '+t.due,go:'tasks'});
  });
  (DB.reagents||[]).forEach(r=>{
    if(!r.exp)return;const d=days(r.exp);if(d==null||d>30)return;
    items.push({urgent:d<=7,text:r.name,sub:(d<0?'试剂已过期 · ':'试剂效期 · ')+r.exp+(d>=0?'（剩 '+d+' 天）':''),go:'labres'});
  });
  (DB.instruments||[]).forEach(r=>{
    if(!r.next)return;const d=days(r.next);if(d==null||d>30)return;
    items.push({urgent:d<=7,text:r.name,sub:(d<0?'校准已逾期 · ':'校准到期 · ')+r.next,go:'labres'});
  });
  (DB.reminders||[]).forEach(r=>items.push({urgent:false,text:r.text,sub:'提醒 · '+r.date,go:'home'}));
  (Store.get('notify:log',[])||[]).forEach(n=>items.push({urgent:false,text:n.text,sub:n.at,go:n.go||null}));
  return items;
}
function notifyPush(text,go){
  const a=Store.get('notify:log',[]);a.unshift({text,at:nowStamp().replace('T',' '),go:go||null});
  Store.set('notify:log',a.slice(0,30));notifyBadge();
}
function notifyBadge(){
  const b=document.getElementById('btnBell');if(!b)return;
  const n=notifyItems().filter(i=>i.urgent).length;
  b.classList.toggle('has-dot',n>0);
  b.title=n?n+' 条待处理提醒':'通知中心';
}
function notifyOpen(){
  const mask=document.getElementById('notifyMask'),body=document.getElementById('notifyBody');
  if(!mask||!body)return;
  const items=notifyItems();
  body.innerHTML=items.length
    ?('<div class="notify-list">'+items.map((it,i)=>`<div class="notify-item${it.urgent?' urgent':''}" data-ni="${i}"><span class="ni-dot"></span><div class="ni-txt"><b>${esc(it.text)}</b><small>${esc(it.sub)}</small></div></div>`).join('')+'</div>')
    :'<div class="notify-empty">没有待处理提醒 — 任务截止、试剂效期与仪器校准会在这里汇总</div>';
  mask.hidden=false;
  body.querySelectorAll('[data-ni]').forEach(el=>el.onclick=()=>{
    const it=items[+el.dataset.ni];mask.hidden=true;if(it.go)navigate(it.go);
  });
  notifyBadge();
}
(function notifyInit(){
  const b=document.getElementById('btnBell');if(b)b.onclick=notifyOpen;
  const m=document.getElementById('notifyMask');
  if(m){
    m.addEventListener('click',e=>{if(e.target===m)m.hidden=true;});
    const c=document.getElementById('notifyClose');if(c)c.onclick=()=>m.hidden=true;
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!m.hidden)m.hidden=true;});
  }
})();