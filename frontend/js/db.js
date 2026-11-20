// LabKit · db.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== 工作台数据库 =====================
   全部页面（首页卡片 + 九个子页）共用这一份数据，落盘到
   ~/.liver_portal_crop/labkit_db.json（见 Rust src/store.rs）。
   下面只是**首次启动的示例数据**，设置页可一键清空后从零开始记。 */
const DB = {
  isDemo:true,
  ui:{density:'normal'},
  /* P1：偏好/收藏/最近/工具状态的统一落盘袋（Store 门面读写，随台账原子写+备份）。
     必须在种子里存在：loadDBFromDisk 只回填 DB 已有的键。 */
  _store:{},
  /* P1：磁盘修订号（Rust 每次成功写入 +1，前端只读不回写），用于窗口聚焦时兜底对账 */
  _rev:0,
  /* 首次启动示例数据：全部为虚构内容，仅用于演示各页面与卡片的数据形态。
     不含任何真实课题、样本编号、文献或课题组信息；设置页可一键清空。 */
  projects:[
    {id:'p1',name:'示例项目：方法学验证',code:'DEMO-01',owner:'示例用户',start:'2026-03',end:'2027-03',stage:'实验',progress:42,milestones:[['开题',1],['预实验',1],['样本采集',1],['检测',0],['初稿',0],['投稿',0]],risk:'设备排期待定'},
    {id:'p2',name:'示例项目：数据分析流程',code:'DEMO-02',owner:'示例用户',start:'2026-06',end:'2026-12',stage:'数据分析',progress:65,milestones:[['开题',1],['样本采集',1],['检测',1],['数据分析',1],['初稿',0],['投稿',0]],risk:'样本余量不足'},
    {id:'p3',name:'示例项目：论文写作与投稿',code:'DEMO-03',owner:'示例用户',start:'2026-09',end:'2027-02',stage:'写作',progress:25,milestones:[['开题',1],['图表制作',1],['初稿',0],['内审',0],['投稿',0],['修回',0]],risk:'截止日期临近'},
  ],
  tasks:[
    {id:'t1',name:'示例任务：缓冲液配制与分装',pri:'urgent',proj:'p1',exp:'EXP-DEMO-01',due:'今天 18:00',tags:['试剂'],done:false,state:'doing',key:true},
    {id:'t2',name:'整理原始数据并出 QC 报告',pri:'important',proj:'p2',exp:'EXP-DEMO-02',due:'明天',tags:['数据分析'],done:false,state:'todo'},
    {id:'t3',name:'抗体稀释与预实验',pri:'normal',proj:'p1',exp:'',due:'周三',tags:['WB'],done:false,state:'todo'},
    {id:'t4',name:'组会 PPT：阶段汇报',pri:'urgent',proj:'p2',exp:'',due:'周五',tags:['写文章'],done:false,state:'todo',key:true},
    {id:'t5',name:'引物设计：候选 panel',pri:'important',proj:'p3',exp:'',due:'周四',tags:['qPCR'],done:false,state:'todo'},
    {id:'t6',name:'每周组会（重复任务）',pri:'normal',proj:'',exp:'',due:'每周五',tags:['组会'],done:true,state:'done',doneAt:daysAgoISO(1)},
    {id:'t7',name:'细胞换液（重复任务）',pri:'normal',proj:'p1',exp:'',due:'每天',tags:['细胞'],done:true,state:'done',doneAt:daysAgoISO(2)},
    {id:'t8',name:'读文献：方法学综述 3 篇精读',pri:'normal',proj:'',exp:'',due:'本周',tags:['文献'],done:false,state:'todo'},
  ],
  /* at 是真实的本地时间戳（YYYY-MM-DDTHH:MM），周趋势 / 报表全部由它推导，
     不再有任何写死的统计数组。 */
  focusRecords:[
    {id:'f1',project:'示例项目：数据分析流程',type:'数据分析',minutes:75,at:daysAgoISO(0)+'T09:00'},
    {id:'f2',project:'示例项目：方法学验证',type:'实验操作',minutes:50,at:daysAgoISO(0)+'T10:30'},
    {id:'f3',project:'示例项目：数据分析流程',type:'写论文',minutes:50,at:daysAgoISO(1)+'T14:00'},
    {id:'f4',project:'示例项目：论文写作与投稿',type:'读文献',minutes:25,at:daysAgoISO(1)+'T16:00'},
    {id:'f5',project:'示例项目：方法学验证',type:'实验操作',minutes:50,at:daysAgoISO(2)+'T09:00'},
    {id:'f6',project:'示例项目：数据分析流程',type:'数据分析',minutes:50,at:daysAgoISO(3)+'T13:00'},
    {id:'f7',project:'示例项目：数据分析流程',type:'数据分析',minutes:75,at:daysAgoISO(5)+'T10:00'},
  ],
  experiments:[
    {id:'EXP-DEMO-01',proj:'示例项目：方法学验证',type:'动物',date:'11-17',who:'示例用户',status:'进行中',note:'第 4 周给药，体重记录正常'},
    {id:'EXP-DEMO-02',proj:'示例项目：论文写作与投稿',type:'qPCR',date:'11-16',who:'示例用户',status:'失败',note:'Ct 值漂移，疑似逆转录效率低，需重做'},
    {id:'EXP-DEMO-03',proj:'示例项目：数据分析流程',type:'测序',date:'11-15',who:'示例用户',status:'完成',note:'上机完成，QC 通过'},
    {id:'EXP-DEMO-04',proj:'示例项目：方法学验证',type:'WB',date:'11-14',who:'示例合作者',status:'待重复',note:'条带空白，改用新膜重跑'},
    {id:'EXP-DEMO-05',proj:'示例项目：数据分析流程',type:'细胞',date:'11-13',who:'示例用户',status:'完成',note:'细胞传代至第 8 代'},
    {id:'EXP-DEMO-06',proj:'示例项目：方法学验证',type:'统计分析',date:'11-12',who:'示例用户',status:'待开展',note:'待原始数据导出'},
  ],
  literatures:[
    {title:'示例文献：方法学验证设计综述',meta:'示例期刊 · 2026',status:'待精读'},
    {title:'示例文献：组学数据 QC 流程指南',meta:'示例期刊 · 2025',status:'已读完'},
    {title:'示例文献：统计报告规范解读',meta:'示例期刊 · 2025',status:'笔记待整理'},
    {title:'示例文献：参考基因稳定性方法比较',meta:'示例期刊 · 2024',status:'已读完'},
    {title:'示例文献：动物实验报告清单（综述）',meta:'示例 DOI · 2024',status:'待精读'},
  ],
  reagents:[
    {name:'示例一抗（Anti-Target）',no:'DEMO-AB1',lot:'LOT-001',loc:'4°C 冰箱 B',open:'10-02',exp:'2026-12-02',left:'80%'},
    {name:'示例 RNA 提取试剂',no:'DEMO-R1',lot:'LOT-002',loc:'试剂柜 2',open:'09-20',exp:'2027-09-20',left:'35%'},
    {name:'逆转录试剂盒',no:'DEMO-RT',lot:'LOT-003',loc:'-20°C',open:'09-18',exp:'2026-11-30',left:'50%'},
    {name:'SDS-PAGE 凝胶配制套装',no:'DEMO-G1',lot:'LOT-004',loc:'室温层析柜',open:'—',exp:'2027-01-10',left:'100%'},
  ],
  instruments:[
    {name:'荧光定量 PCR 仪',cal:'2026-10-12',next:'2027-04-12',note:'运行正常'},
    {name:'超高效液相色谱串联质谱',cal:'2026-06-30',next:'2026-12-30',note:'排期紧张'},
    {name:'化学发光成像仪',cal:'2026-08-01',next:'2027-02-01',note:'—'},
  ],
  reminders:[
    {text:'组会 PPT 截止',date:'周五',color:'var(--red)'},
    {text:'逆转录试剂盒过期',date:'11-30',color:'var(--orange)'},
    {text:'设备校准到期',date:'12-15',color:'var(--orange)'},
    {text:'仪器机时确认',date:'12-20',color:'var(--accent)'},
  ],
  /* 台账：经费、仪器预约、实验速记、最近切片。
     调研里这几项是课题组最高频的痛点（试剂过期/机时冲突/预算超支/记录散落）。 */
  budget:[
    {id:'b1',item:'耗材采购',cat:'耗材',amount:4860,date:'2026-11-05',note:'含示例一抗'},
    {id:'b2',item:'仪器机时费',cat:'测试费',amount:3200,date:'2026-11-12',note:'8 个样本'},
    {id:'b3',item:'实验动物与饲养',cat:'动物',amount:2150,date:'2026-10-28',note:'示例数量'},
  ],
  budgetTotal:30000,
  bookings:[
    {id:'k1',inst:'荧光定量 PCR 仪',date:'2026-11-19',slot:'09:00-11:00',who:'示例用户',proj:'示例项目：论文写作与投稿'},
    {id:'k2',inst:'超高效液相色谱串联质谱',date:'2026-11-20',slot:'14:00-18:00',who:'示例合作者',proj:'示例项目：数据分析流程'},
  ],
  notes:[
    {id:'n1',text:'逆转录 Ct 漂移排查：先换新的 RT 酶 aliquot，再做 RNA 完整性电泳；若仍漂移则查引物二聚体。',at:'2026-11-16 21:10'},
  ],
  recentSlides:[],
};
/* ---- 持久化：磁盘为准，localStorage 只当缓存与迁移来源 ----
   以前只写 localStorage，WebView2 清一次浏览数据就全没了，也拿不到文件。
   现在启动先读 ~/.liver_portal_crop/labkit_db.json，改动防抖写盘（原子写 + .bak）。 */
const DB_KEY='labkit.db.v1';
let dbStatus='init',dbError='',dbSavedAt='',dbPath='';
function readCache(){try{const r=localStorage.getItem(DB_KEY);return r?JSON.parse(r):null}catch(e){return null}}
function writeCache(){try{localStorage.setItem(DB_KEY,JSON.stringify(DB))}catch(e){}}

/* 老数据兼容：把「今天 09:00-10:15」这类相对时间换成真实时间戳，
   给缺 id 的记录补 id，给任务补 state/doneAt。只在读盘后跑一次。 */
function migrateDB(){
  const relDay={'今天':0,'昨天':1,'前天':2};
  (DB.focusRecords||[]).forEach(r=>{
    if(!r.id)r.id=uid('f');
    if(/^\d{4}-\d{2}-\d{2}T/.test(r.at||''))return;
    const s=String(r.at||'');
    const tm=s.match(/(\d{1,2}):(\d{2})/);
    let off=0;
    for(const k in relDay)if(s.includes(k))off=relDay[k];
    if(off===0&&/周[一二三四五六日]/.test(s)){
      const want='日一二三四五六'.indexOf(s.match(/周([一二三四五六日])/)[1]);
      off=(new Date().getDay()-want+7)%7;
    }
    r.at=daysAgoISO(off)+'T'+(tm?pad2(+tm[1])+':'+tm[2]:'09:00');
  });
  (DB.tasks||[]).forEach(t=>{
    if(!t.state)t.state=t.done?'done':'todo';
    if(t.done&&!t.doneAt)t.doneAt=todayStr();
    if(!t.done)t.doneAt='';
  });
  ['literatures','reagents','instruments'].forEach(k=>(DB[k]||[]).forEach(r=>{if(!r.id)r.id=uid(k[0])}));
  (DB.notes||[]).forEach(n=>{if(n.at&&!n.at.includes('T'))n.at=n.at.replace(' ','T')});
  if(!Array.isArray(DB.recentSlides))DB.recentSlides=[];
  if(typeof DB.budgetTotal!=='number')DB.budgetTotal=30000;
  if(typeof DB.isDemo!=='boolean')DB.isDemo=false;
}

async function loadDBFromDisk(){
  let disk=null;
  if(IN_TAURI){
    try{disk=await invoke('db_load')}
    catch(e){dbError=String(e);dbStatus='error'}
  }
  const cache=readCache();
  const firstRun=!disk&&!cache;
  window.__labkitFirstRun=firstRun;   // P3：首启由欢迎遮罩决定示例/空白，不自动写种子
  const src=disk||cache;
  if(src&&typeof src==='object')Object.keys(src).forEach(k=>{if(k in DB)DB[k]=src[k]});
  migrateDB();
  if(disk){dbStatus='saved';}   // P5：磁盘读回成功即「已落盘」，不再停留在「读取中…」
  if(IN_TAURI&&!disk&&cache){
    // 老版本只存在浏览器里的数据，首次启动搬进磁盘，之后就再也不依赖浏览器
    await flushDB();
    dbStatus==='saved'&&toast('已把浏览器里的旧记录迁移到磁盘文件',4200);
  }else if(IN_TAURI&&!disk&&!firstRun){
    await flushDB();
  }else if(!IN_TAURI){
    dbStatus='browser';
  }
  if(IN_TAURI)invoke('db_info').then(i=>{if(i&&i.path){dbPath=i.path;renderSettings()}}).catch(()=>{});
  _dbBase=dbSnapshot();_dbRev=DB._rev||0;
}

/* ---- P1 多窗口同步：合并写 + db-changed 广播 ----
   每窗口维护 _dbBase（加载/每次成功保存后的逐键快照），flushDB diff 出 changed 顶层键；
   Rust 锁内读盘 → 仅覆盖 changed 键（_store 逐子键合并，null=删除墓碑）→ 原子写 → rev+1
   → emit("db-changed")。不同窗口写各自 toolform:<id> / 实体键互不抹掉。
   同一键并发编辑 = 后写覆盖（键级 LWW）；实体级三方合并为后续增强。 */
let _dbBase=null,_dbRev=0,_dbDirty=false,_dbApplying=false,_dbViewPending=false,_dbMO=null,_dbCloseFlushed=false;
let _dbFlushing=false,_dbPendingRemote=null,_dbWriteSeq=0;
const _dbOrigin='w'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);
function dbSnapshot(){const c={};Object.keys(DB).forEach(k=>{if(k!=='_rev')c[k]=DB[k]});return JSON.parse(JSON.stringify(c))}
function dbChangedKeys(){
  if(!_dbBase)return null;               // 无基线（首次写）→ 整库写，兼容旧契约
  const out=[];
  Object.keys(DB).forEach(k=>{if(k!=='_rev'&&JSON.stringify(DB[k])!==JSON.stringify(_dbBase[k]))out.push(k)});
  Object.keys(_dbBase).forEach(k=>{if(!(k in DB))out.push(k)});
  return out;
}
let _dbT=0;
function saveDB(){
  writeCache();
  _dbDirty=true;
  dbStatus='saving';renderDbStatus();
  clearTimeout(_dbT);
  _dbT=setTimeout(flushDB,400);
}
async function flushDB(){
  clearTimeout(_dbT);_dbT=0;
  writeCache();
  if(!IN_TAURI){dbStatus='browser';_dbBase=dbSnapshot();_dbDirty=false;renderDbStatus();dbDrainPending();return}
  const changed=dbChangedKeys();
  if(changed&&changed.length===0){dbStatus='saved';_dbDirty=false;renderDbStatus();dbDrainPending();return dbPath}
  _dbFlushing=true;
  try{
    const p=await invoke('db_save',{data:DB,changed:changed||undefined,origin:_dbOrigin});
    dbPath=p||dbPath;dbError='';dbStatus='saved';dbSavedAt=nowStamp().replace('T',' ');
    _dbBase=dbSnapshot();_dbDirty=false;_dbWriteSeq++;
  }catch(e){
    dbError=String(e);dbStatus='error';
    toast('保存到磁盘失败：'+dbError+'（记录已暂存浏览器，请勿清理浏览数据）',7000);
    if(typeof notifyPush==='function')notifyPush('台账保存失败：'+dbError,'settings');
  }
  _dbFlushing=false;
  renderDbStatus();
  dbDrainPending();
}
/* 本窗口写盘在途时到达的远端事件被暂存（那时读盘会读到缺少本地改动的旧快照，
   直接 adopt 会抹掉刚提交的数据）；写盘落地后补处理，读到的盘已含双方改动 */
function dbDrainPending(){
  if(_dbPendingRemote){const pl=_dbPendingRemote;_dbPendingRemote=null;dbOnRemote(pl)}
}
/* 远端变更：重载磁盘 → 更新基线 → 重渲染（避开正在输入的表单与打开的模态框） */
function dbAdopt(src){
  if(src&&typeof src==='object')Object.keys(src).forEach(k=>{if(k in DB)DB[k]=src[k]});
  _dbRev=DB._rev||0;_dbBase=dbSnapshot();writeCache();
}
async function dbOnRemote(payload){
  if(payload&&payload.origin===_dbOrigin){if(payload.rev)_dbRev=payload.rev;return}
  if(payload&&payload.reset){try{localStorage.removeItem(DB_KEY)}catch(e){};location.reload();return}
  /* 写盘在途 / 已有重载在途 → 排队（取最新一条），不能丢也不能立即读盘：
     此刻读盘会读到缺少本地刚提交改动的旧快照，adopt 会把它抹掉（真机冒烟实测） */
  if(_dbFlushing||_dbApplying){_dbPendingRemote=payload;return}
  _dbApplying=true;
  const seq0=_dbWriteSeq;
  try{
    const src=await invoke('db_load');
    if(_dbFlushing||_dbWriteSeq!==seq0){
      /* 读盘期间本地又落了新写 → 这份快照已过时，交给写盘落地后的 drain 重读 */
      _dbPendingRemote=payload;
    }else{
      dbAdopt(src);
      if(payload&&payload.rev)_dbRev=payload.rev;
      dbRefreshViews();
    }
  }catch(e){}
  _dbApplying=false;
  if(_dbPendingRemote){const pl=_dbPendingRemote;_dbPendingRemote=null;dbOnRemote(pl)}
}
function dbRenderCurrentView(){
  const n=_route.name;
  if(n==='home'){if(typeof dashEdit!=='undefined'&&dashEdit)return;refreshHome();buildDash();}
  else if(n==='tasks')renderTasks();
  else if(n==='projects')renderProjects();
  else if(n==='experiments')renderExperiments();
  else if(n==='literature')renderLiterature();
  else if(n==='labres')renderLab();
  else if(n==='reports')renderReports();
  else if(n==='focus')renderFocusPage();
  else if(n==='toolhub')renderToolHub();
  else if(n==='settings')renderSettings();
  /* tool/crop/qpcr：不重渲染——保护正在输入的表单与画布状态；
     工具输入由各自窗口按 toolform:<id> 键 LWW 保存，互不覆盖 */
}
function dbRefreshViews(){
  if(typeof shellRenderPins==='function')shellRenderPins();
  if(typeof syncPinButtons==='function')syncPinButtons();
  if(typeof shellRenderCats==='function')shellRenderCats();
  if(typeof toolboxInvalidate==='function')toolboxInvalidate();
  if(typeof renderToolHub==='function')renderToolHub();
  if(typeof notifyBadge==='function')notifyBadge();
  if(typeof applyTheme==='function')applyTheme();
  if(typeof applyDensity==='function')applyDensity();
  if(typeof setGreet==='function')setGreet();
  if(document.querySelector('.modal-mask')||(typeof dashEdit!=='undefined'&&dashEdit)
    ||(typeof toolboxIsEditing==='function'&&toolboxIsEditing())){
    _dbViewPending=true;dbWatchIdle();return;
  }
  dbRenderCurrentView();
}
/* 模态关闭 / 退出布局编辑 / 退出工具箱整理后补刷新（观察 #win 子树，仅在有待刷新时挂载） */
function dbWatchIdle(){
  if(_dbMO)return;
  _dbMO=new MutationObserver(()=>{
    if(!_dbViewPending)return;
    if(document.querySelector('.modal-mask')||(typeof dashEdit!=='undefined'&&dashEdit)
      ||(typeof toolboxIsEditing==='function'&&toolboxIsEditing()))return;
    _dbMO.disconnect();_dbMO=null;_dbViewPending=false;
    dbRenderCurrentView();
  });
  _dbMO.observe(document.getElementById('win'),{childList:true,subtree:true});
}
/* 事件丢失兜底：窗口聚焦时先补写本地改动，再对磁盘 rev，落后则重载 */
async function dbFocusSync(){
  if(!IN_TAURI||_dbApplying||_dbFlushing)return;
  try{
    if(_dbDirty)await flushDB();
    const src=await invoke('db_load');
    if(src&&(src._rev||0)>_dbRev){dbAdopt(src);dbRefreshViews();}
  }catch(e){}
}
if(IN_TAURI){
  try{window.__TAURI__.event.listen('db-changed',ev=>dbOnRemote(ev.payload)).catch(()=>{})}catch(e){}
  window.addEventListener('focus',()=>{dbFocusSync()});
  /* 关窗走 changed 合并路径：不丢最后一次编辑，也不抹掉别的窗口的改动。
     preventDefault → 补写 → 再 close（第二次不再拦截），window-state 插件正常保存窗口位置 */
  /* 仅工具窗口保留 JS 关窗守卫（逐个关闭时落盘）。
     主窗口严禁注册：JS onCloseRequested 未 preventDefault 时会向同一通道发
     "allow"，与 Rust 的 prevent_close 竞争并抢先放行，导致主窗在回执前被关闭、
     退出握手永远等不到 main 的 ack。主窗退出由 Rust on_window_event 独占编排。 */
  if(WINDOW_MODE){
    try{
      const W=lkWin().getCurrentWindow();
      W.onCloseRequested(async e=>{
        if(_dbCloseFlushed||!_dbDirty)return;
        e.preventDefault();
        try{await Promise.race([flushDB(),new Promise(r=>setTimeout(r,1500))])}catch(_){}
        _dbCloseFlushed=true;
        W.close().catch(()=>{});
      }).catch(()=>{});
    }catch(e){}
  }

  /* 多窗口退出握手：主窗 CloseRequested → Rust 广播 flush-now → 每窗立即落盘并回执。
     _dbCloseFlushed / changed=[] 早退保证与 onCloseRequested 的 flush 不重复写盘。 */
  window.__TAURI__.event.listen('flush-now',async ev=>{
    const requestId=ev.payload&&ev.payload.requestId;
    if(!requestId)return;
    let ok=true;
    if(!_dbCloseFlushed&&_dbDirty){
      try{await Promise.race([flushDB(),new Promise(r=>setTimeout(r,1500))])}catch(_){}
    }
    ok=!_dbDirty&&!dbError&&dbStatus==='saved';
    invoke('flush_ack',{requestId,ok,label:WIN_LABEL}).catch(()=>{});
  }).catch(()=>{});

  /* 落盘失败/超时：主窗弹窗让用户选「强制退出」或「取消退出」（Rust 保持窗口）。 */
  if(!WINDOW_MODE){
    window.__TAURI__.event.listen('flush-failed',ev=>{
      const p=ev.payload||{},requestId=p.requestId,labels=(p.labels||[]).join('、');
      if(typeof confirmModal!=='function')return;
      confirmModal('退出前未能保存全部窗口',
        '以下窗口的改动尚未写入磁盘：'+(labels||'未知窗口')+'。\n\n强制退出会丢失这些未落盘改动（内容仍暂存本地缓存，下次启动可尝试恢复）；取消则留在应用里稍后重试。',
        ()=>{invoke('exit_decision',{requestId,force:true}).catch(()=>{})},'强制退出',
        ()=>{invoke('exit_decision',{requestId,force:false}).catch(()=>{})},'取消退出');
    }).catch(()=>{});
  }
}
/* 关窗/切走前把最后 400ms 内的改动补写掉，避免丢最后一次编辑 */
window.addEventListener('beforeunload',()=>{if(_dbT){clearTimeout(_dbT);_dbT=0;writeCache();if(IN_TAURI)invoke('db_save',{data:DB,changed:dbChangedKeys()||undefined,origin:_dbOrigin}).catch(()=>{})}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&_dbT)flushDB()});

const STATUS_CLS = {'待开展':'status-wait','进行中':'status-run','完成':'status-ok','失败':'status-fail','待重复':'status-re'};

