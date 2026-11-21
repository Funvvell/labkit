// LabKit · entities.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== 通用表单弹窗 + 各台账的新建 ===================== */
function formModal(title,fields,onOK,okLabel){
  const mask=document.createElement('dialog');mask.className='modal-mask';
  const titleId='fm_title_'+Date.now().toString(36);
  mask.setAttribute('aria-labelledby',titleId);
  const box=document.createElement('div');box.className='roi-modal wide';
  const fhtml=fields.map((f,i)=>{
    const id='fm_'+i,errId='fm_err_'+i;let ctl;
    const req=f.req?' required aria-required="true"':'';
    const described=` aria-describedby="${errId}"`;
    if(f.type==='select')ctl=`<select id="${id}"${req}${described}>${f.options.map(o=>`<option${String(o)===String(f.value)?' selected':''}>${esc(o)}</option>`).join('')}</select>`;
    else if(f.type==='textarea')ctl=`<textarea id="${id}"${req}${described} placeholder="${esc(f.ph||'')}">${esc(f.value||'')}</textarea>`;
    else ctl=`<input id="${id}" type="${f.type||'text'}"${req}${described} value="${esc(f.value==null?'':f.value)}" placeholder="${esc(f.ph||'')}">`;
    return `<div class="fld${f.type==='textarea'||f.full?' full':''}"><label class="lbl2" for="${id}">${esc(f.label)}</label>${ctl}<div class="fld-err" id="${errId}" aria-live="polite"></div></div>`;
  }).join('');
  box.innerHTML=`<h4 id="${titleId}">${esc(title)}</h4><div class="grid2">${fhtml}</div>
    <div class="btn-row"><button class="btn pri" id="fm_ok">${esc(okLabel||'保存')}</button><button class="btn sec" id="fm_cancel">取消</button></div>`;
  mask.appendChild(box);document.body.appendChild(mask);
  const close=()=>{closeLayer(mask);if(mask.parentNode)mask.remove()};
  mask.addEventListener('close',()=>{if(mask.parentNode)mask.remove()});
  mask.addEventListener('click',e=>{if(e.target===mask)close()});
  box.querySelector('#fm_cancel').onclick=close;
  box.querySelector('#fm_ok').onclick=()=>{
    const out={};let firstBad=null;
    for(let i=0;i<fields.length;i++){
      const el=box.querySelector('#fm_'+i),err=box.querySelector('#fm_err_'+i),v=el.value.trim();
      if(err)err.textContent='';
      el.removeAttribute('aria-invalid');
      if(fields[i].req&&!v){
        if(err)err.textContent='请填写「'+fields[i].label+'」';
        el.setAttribute('aria-invalid','true');
        if(!firstBad)firstBad=el;
      }
      out[fields[i].k]=fields[i].type==='number'?(v===''&&fields[i].nullable?null:(Number(v)||0)):v;
    }
    if(firstBad){firstBad.focus();return}
    close();onOK(out);
  };
  openLayer(mask);
  setTimeout(()=>{const f=box.querySelector('input,textarea,select');if(f)f.focus()},30);
}
/* ===================== 台账 CRUD：一套注册表喂九个页面 =====================
   以前九个 newXModal 只能「新建」，子页表格是只读的，记错一个字就得去改 JSON。
   现在每类实体只描述三件事：字段、落库规则、刷新哪些视图；
   entityModal(kind,i) 里 i 为空就是新建、否则是编辑第 i 条，删除同理。 */
const PRI_CN={normal:'普通',important:'重要',urgent:'紧急'};
const PRI_EN={'普通':'normal','重要':'important','紧急':'urgent'};
const ST_CN={todo:'待办',doing:'进行中',done:'完成'};
const ST_EN={'待办':'todo','进行中':'doing','完成':'done'};
const projOpts=()=>['未指定'].concat(DB.projects.map(p=>p.name));
/* 清空示例数据后项目/仪器可能为空，下拉必须仍有可选项，否则表单会提交 undefined */
const nameOpts=(arr,fb)=>{const a=arr.map(x=>x.name);return a.length?a:[fb]};
const projName=id=>{const p=DB.projects.find(x=>x.id===id);return p?p.name:'未指定'};
function slotOverlap(a,b){
  const p=s=>{const m=String(s).match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);return m?[+m[1]*60+ +m[2],+m[3]*60+ +m[4]]:null};
  const x=p(a),y=p(b);if(!x||!y)return false;
  return x[0]<y[1]&&y[0]<x[1];
}
const ENT={
  task:{name:'任务',arr:()=>DB.tasks,head:0,label:r=>r.name,
    fields:r=>[
      {k:'name',label:'任务名称',req:1,full:1,ph:'例如：第 5 周给药与体重记录',value:r?r.name:''},
      {k:'pri',label:'优先级',type:'select',options:['普通','重要','紧急'],value:r?PRI_CN[r.pri]||'普通':'普通'},
      {k:'state',label:'状态',type:'select',options:['待办','进行中','完成'],value:r?ST_CN[r.state||(r.done?'done':'todo')]:'待办'},
      {k:'due',label:'截止（可写文字）',value:r?r.due:'今天',ph:'今天 / 明天 / 周五 / 每周五'},
      {k:'dueDate',label:'具体日期（可留空）',type:'date',value:r?r.dueDate||'':''},
      {k:'proj',label:'归属项目',type:'select',options:projOpts(),value:r?projName(r.proj):'未指定'},
      {k:'exp',label:'关联实验 ID',value:r?r.exp||'':'',ph:'EXP-DEMO-01'},
      {k:'tags',label:'标签（逗号分隔）',ph:'动物, WB',value:r?(r.tags||[]).join(', '):''},
      {k:'key',label:'今日重点',type:'select',options:['否','是'],value:r&&r.key?'是':'否'},
    ],
    apply:(v,r)=>{
      const p=DB.projects.find(x=>x.name===v.proj),st=ST_EN[v.state]||'todo';
      const o=Object.assign(r||{id:uid('t')},{name:v.name,pri:PRI_EN[v.pri]||'normal',proj:p?p.id:'',exp:v.exp||'',
        due:v.due||'今天',dueDate:v.dueDate||'',tags:v.tags?v.tags.split(/[,，]/).map(s=>s.trim()).filter(Boolean):[],
        key:v.key==='是',state:st,done:st==='done'});
      o.doneAt=st==='done'?(r&&r.doneAt?r.doneAt:todayStr()):'';
      return o;
    },
    refresh:()=>{refreshHome();renderReports()}},
  project:{name:'项目',arr:()=>DB.projects,label:r=>r.name,
    fields:r=>[
      {k:'name',label:'项目名称',req:1,full:1,value:r?r.name:''},
      {k:'code',label:'项目编号',ph:'DEMO-04',value:r?r.code:''},
      {k:'owner',label:'负责人',value:r?r.owner:userName()},
      {k:'start',label:'开始（YYYY-MM）',value:r?r.start:todayStr().slice(0,7)},
      {k:'end',label:'结束（YYYY-MM）',value:r?r.end:''},
      {k:'stage',label:'阶段',type:'select',options:['开题','实验','数据分析','写作','投稿','结题'],value:r?r.stage:'实验'},
      {k:'progress',label:'进度 %',type:'number',value:r?r.progress:0},
      {k:'risk',label:'风险提示',value:r?r.risk||'':'',ph:'样本量不足 / 机时排不上'},
      {k:'milestones',label:'里程碑（每行一个，已完成的行首加 *）',type:'textarea',full:1,
        value:r?(r.milestones||[]).map(([n,d])=>(d?'*':'')+n).join('\n'):'开题\n样本采集\n检测\n数据分析\n初稿\n投稿'},
    ],
    apply:(v,r)=>Object.assign(r||{id:uid('p')},{name:v.name,code:v.code||'—',owner:v.owner||'—',start:v.start,end:v.end,
      stage:v.stage,progress:Math.max(0,Math.min(100,+v.progress||0)),risk:v.risk||'',
      milestones:String(v.milestones||'').split('\n').map(s=>s.trim()).filter(Boolean).map(s=>[s.replace(/^\*/,''),s.startsWith('*')?1:0])}),
    refresh:()=>{refreshHome();renderReports();bindTimerUI()}},
  exp:{name:'实验记录',arr:()=>DB.experiments,head:0,label:r=>r.id,
    fields:r=>[
      {k:'id',label:'实验 ID',value:r?r.id:'E-'+new Date().getFullYear()+'-'+(DB.experiments.length+100)},
      {k:'proj',label:'归属项目',type:'select',options:nameOpts(DB.projects,'未指定'),value:r?r.proj:undefined},
      {k:'type',label:'类型',type:'select',options:['动物','细胞','qPCR','WB','测序','统计分析','其他'],value:r?r.type:'qPCR'},
      {k:'date',label:'日期',value:r?r.date:todayStr().slice(5),ph:'MM-DD 或 YYYY-MM-DD'},
      {k:'status',label:'状态',type:'select',options:['待开展','进行中','完成','失败','待重复'],value:r?r.status:'进行中'},
      {k:'who',label:'执行人',value:r?r.who:userName()},
      {k:'note',label:'摘要 / 备注',type:'textarea',full:1,ph:'条件、现象、结论、下一步',value:r?r.note||'':''},
    ],
    apply:(v,r)=>Object.assign(r||{},{id:v.id,proj:v.proj,type:v.type,date:v.date,who:v.who,status:v.status,note:v.note}),
    refresh:()=>{refreshHome();renderExpTable();renderReports()}},
  lit:{name:'文献',arr:()=>DB.literatures,head:0,label:r=>r.title,
    fields:r=>[
      {k:'title',label:'标题',req:1,full:1,value:r?r.title:''},
      {k:'meta',label:'来源 / 年份',ph:'Nat Metab · 2026',value:r?r.meta:''},
      {k:'status',label:'状态',type:'select',options:['待精读','已读完','笔记待整理'],value:r?r.status:'待精读'},
      {k:'doi',label:'DOI / 链接',full:1,value:r?r.doi||'':''},
      {k:'note',label:'读书笔记',type:'textarea',full:1,value:r?r.note||'':''},
    ],
    apply:(v,r)=>Object.assign(r||{id:uid('l')},{title:v.title,meta:v.meta||'—',status:v.status,doi:v.doi||'',note:v.note||''}),
    post:(o)=>{if(typeof zoteroMirrorStatus==='function')zoteroMirrorStatus(o)},
    refresh:()=>{refreshHome();renderLiterature()}},
  reagent:{name:'试剂',arr:()=>DB.reagents,head:0,label:r=>r.name,
    fields:r=>[
      {k:'name',label:'名称',req:1,full:1,value:r?r.name:''},
      {k:'no',label:'货号',value:r?r.no:''},
      {k:'lot',label:'批次',value:r?r.lot:''},
      {k:'loc',label:'存放位置',ph:'-20°C 冰箱 A',value:r?r.loc:''},
      {k:'open',label:'开封日期',value:r?r.open||'':todayStr().slice(5)},
      {k:'exp',label:'有效期',type:'date',value:r&&/^\d{4}-/.test(r.exp||'')?r.exp:''},
      {k:'left',label:'余量',ph:'100% / 2 支',value:r?r.left:'100%'},
    ],
    apply:(v,r)=>reagentApplyLeft(Object.assign(r||{id:uid('r')},{name:v.name,no:v.no||'—',lot:v.lot||'—',loc:v.loc||'—',
      open:v.open||todayStr().slice(5),exp:v.exp||'—'}),v.left||'100%'),
    refresh:()=>{refreshHome();renderLab();renderKpi()}},
  instrument:{name:'仪器',arr:()=>DB.instruments,label:r=>r.name,
    fields:r=>[
      {k:'name',label:'仪器名称',req:1,full:1,value:r?r.name:''},
      {k:'cal',label:'上次校准',type:'date',value:r?r.cal:''},
      {k:'next',label:'下次校准',type:'date',value:r?r.next:''},
      {k:'note',label:'状态备注',full:1,value:r?r.note||'':''},
    ],
    apply:(v,r)=>Object.assign(r||{id:uid('i')},{name:v.name,cal:v.cal||'—',next:v.next||'—',note:v.note||'—'}),
    refresh:()=>{refreshHome();renderLab()}},
  booking:{name:'仪器预约',arr:()=>DB.bookings,label:r=>r.inst+' '+r.date,
    fields:r=>[
      {k:'inst',label:'仪器',type:'select',options:nameOpts(DB.instruments,'未登记仪器'),value:r?r.inst:undefined},
      {k:'date',label:'日期',type:'date',value:r?r.date:todayStr()},
      {k:'slot',label:'时段',ph:'09:00-11:00',value:r?r.slot:'09:00-11:00'},
      {k:'who',label:'使用人',value:r?r.who:userName()},
      {k:'proj',label:'用途 / 项目',type:'select',options:projOpts(),value:r?(r.proj||'未指定'):'未指定'},
    ],
    /* 机时冲突检测：编辑时要排除自己，否则改个使用人都会被判成冲突 */
    check:(v,r)=>{
      const clash=DB.bookings.find(b=>b!==r&&b.inst===v.inst&&b.date===v.date&&slotOverlap(b.slot,v.slot));
      return clash?'时段冲突：'+clash.who+' 已预约 '+clash.slot+'，请换时段':'';
    },
    apply:(v,r)=>Object.assign(r||{id:uid('k')},{inst:v.inst,date:v.date,slot:v.slot,who:v.who,proj:v.proj==='未指定'?'':v.proj}),
    post:()=>DB.bookings.sort((a,b)=>(a.date+a.slot).localeCompare(b.date+b.slot)),
    refresh:()=>{refreshHome();renderLab()}},
  budget:{name:'经费记录',arr:()=>DB.budget,head:0,label:r=>r.item,
    fields:r=>[
      {k:'item',label:'事项',req:1,full:1,value:r?r.item:''},
      {k:'cat',label:'类别',type:'select',options:['耗材','测试费','动物','差旅','版面费','其他'],value:r?r.cat:'耗材'},
      {k:'amount',label:'金额（元）',type:'number',value:r?r.amount:''},
      {k:'date',label:'日期',type:'date',value:r?r.date:todayStr()},
      {k:'note',label:'备注',full:1,value:r?r.note||'':''},
    ],
    apply:(v,r)=>Object.assign(r||{id:uid('b')},{item:v.item,cat:v.cat,amount:+v.amount||0,date:v.date,note:v.note}),
    refresh:()=>{refreshHome();renderReports()}},
  note:{name:'速记',arr:()=>DB.notes,head:0,label:r=>String(r.text).slice(0,20),
    fields:r=>[{k:'text',label:'内容',type:'textarea',req:1,full:1,ph:'随手记下现象、排查思路、待办…',value:r?r.text:''}],
    apply:(v,r)=>Object.assign(r||{id:uid('n'),at:nowStamp()},{text:v.text}),
    refresh:()=>refreshHome()},
  reminder:{name:'截止提醒',arr:()=>DB.reminders,label:r=>r.text,
    fields:r=>[
      {k:'text',label:'事项',req:1,full:1,ph:'基金结题 / 投稿 deadline / 伦理年审',value:r?r.text:''},
      {k:'date',label:'日期',type:'date',value:r&&/^\d{4}-/.test(r.date||'')?r.date:todayStr()},
      {k:'color',label:'紧急程度',type:'select',options:['一般','较急','紧急'],value:r?(r.color==='var(--red)'?'紧急':r.color==='var(--orange)'?'较急':'一般'):'一般'},
    ],
    apply:(v,r)=>Object.assign(r||{id:uid('m')},{text:v.text,date:v.date,color:{'一般':'var(--accent)','较急':'var(--orange)','紧急':'var(--red)'}[v.color]||'var(--accent)'}),
    refresh:()=>{refreshHome();renderLitRemind()}},
  focus:{name:'专注记录',arr:()=>DB.focusRecords,label:r=>r.project+' '+r.minutes+'′',
    fields:r=>[
      {k:'project',label:'项目',type:'select',options:DB.projects.map(p=>p.name).concat('未指定'),value:r?r.project:'未指定'},
      {k:'type',label:'类型',type:'select',options:['实验操作','数据分析','读文献','写论文','组会/汇报'],value:r?r.type:'实验操作'},
      {k:'minutes',label:'时长（分钟）',type:'number',req:1,value:r?r.minutes:25},
      {k:'day',label:'日期',type:'date',value:r?String(r.at).slice(0,10):todayStr()},
      {k:'time',label:'开始时间',ph:'09:00',value:r?(String(r.at).match(/T(\d{2}:\d{2})/)||[])[1]||'09:00':'09:00'},
    ],
    apply:(v,r)=>Object.assign(r||{id:uid('f')},{project:v.project,type:v.type,minutes:Math.max(1,+v.minutes||0),
      at:(v.day||todayStr())+'T'+(/^\d{2}:\d{2}$/.test(v.time||'')?v.time:'09:00')}),
    refresh:()=>{refreshHome();renderFocusPage();renderReports()}},
};
function entityModal(kind,i){
  const e=ENT[kind];if(!e)return;
  const arr=e.arr(),rec=(i==null||i<0)?null:arr[i];
  formModal((rec?'编辑':'新建')+e.name,e.fields(rec),v=>{
    if(e.check){const err=e.check(v,rec);if(err){toast(err,4200);return}}
    const o=e.apply(v,rec);
    if(!rec){if(e.head===0)arr.unshift(o);else arr.push(o)}else arr[i]=o;
    if(e.post)e.post(o,rec);
    DB.isDemo=false;
    saveDB();e.refresh();queueResize();
    toast((rec?'已更新':'已新建')+e.name+'：'+e.label(o));
  },rec?'保存':'创建');
}
function entityDelete(kind,i){
  const e=ENT[kind];if(!e)return;
  const arr=e.arr(),r=arr[i];if(!r)return;
  confirmModal('删除'+e.name,'确定删除「'+e.label(r)+'」？删除会立即写入磁盘，需要找回可在设置页导入之前的备份。',()=>{
    arr.splice(i,1);saveDB();e.refresh();queueResize();toast('已删除'+e.name);
  },'删除');
}
function confirmModal(title,msg,onOK,okLabel,onCancel,cancelLabel){
  const mask=document.createElement('dialog');mask.className='modal-mask';
  const titleId='cf_title_'+Date.now().toString(36);
  mask.setAttribute('aria-labelledby',titleId);
  const box=document.createElement('div');box.className='roi-modal';
  box.innerHTML=`<h4 id="${titleId}">${esc(title)}</h4><div class="sub" style="margin:8px 0 16px;line-height:1.75">${esc(msg)}</div>
    <div class="btn-row"><button class="btn danger" id="cf_ok">${esc(okLabel||'确定')}</button><button class="btn sec" id="cf_no" autofocus>${esc(cancelLabel||'取消')}</button></div>`;
  mask.appendChild(box);document.body.appendChild(mask);
  const close=()=>{closeLayer(mask);if(mask.parentNode)mask.remove()};
  mask.addEventListener('close',()=>{if(mask.parentNode)mask.remove()});
  mask.addEventListener('click',ev=>{if(ev.target===mask)close()});
  box.querySelector('#cf_no').onclick=()=>{close();if(typeof onCancel==='function')onCancel()};
  box.querySelector('#cf_ok').onclick=()=>{close();onOK()};
  openLayer(mask);
}
/* 兼容旧调用名：首页卡片和子页按钮都还在用这些名字 */
function newTaskModal(){entityModal('task')}
function newProjectModal(){entityModal('project')}
function newExpModal(){entityModal('exp')}
function newLitModal(){entityModal('lit')}
function newReagentModal(){entityModal('reagent')}
function newBookingModal(){entityModal('booking')}
function newBudgetModal(){entityModal('budget')}
function newNoteModal(){entityModal('note')}
function newReminderModal(){entityModal('reminder')}
function newInstrumentModal(){entityModal('instrument')}
function newFocusModal(){entityModal('focus')}
