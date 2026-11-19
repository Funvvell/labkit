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
  projects:[
    {id:'p1',name:'PFKFB3 过表达与 MASH',code:'MASH-2026-03',owner:'示例用户',start:'2026-03',end:'2027-03',stage:'实验',progress:42,milestones:[['开题',1],['动物造模',1],['样本采集',1],['检测',0],['初稿',0],['投稿',0]],risk:'LC-MS 排期待定'},
    {id:'p2',name:'胆汁酸代谢组学',code:'BA-LCMS-26',owner:'示例用户',start:'2026-06',end:'2026-12',stage:'数据分析',progress:65,milestones:[['开题',1],['样本采集',1],['检测',1],['数据分析',1],['初稿',0],['投稿',0]],risk:'样本余量不足'},
    {id:'p3',name:'肝纤维化 qPCR 验证',code:'FIB-Q-26',owner:'示例用户',start:'2026-09',end:'2027-02',stage:'实验',progress:25,milestones:[['开题',1],['引物设计',1],['样本采集',0],['检测',0],['初稿',0],['投稿',0]],risk:'动物伦理 12 月到期'},
  ],
  tasks:[
    {id:'t1',name:'MASH 小鼠灌胃第 4 周',pri:'urgent',proj:'p1',exp:'E-2026-114',due:'今天 18:00',tags:['动物'],done:false,state:'doing',key:true},
    {id:'t2',name:'整理 LC-MS 原始数据并出 QC 报告',pri:'important',proj:'p2',exp:'E-2026-108',due:'明天',tags:['数据分析'],done:false,state:'todo'},
    {id:'t3',name:'WB 抗体配制与转膜预实验',pri:'normal',proj:'p1',exp:'',due:'周三',tags:['WB'],done:false,state:'todo'},
    {id:'t4',name:'组会 PPT：LC-MS 阶段汇报',pri:'urgent',proj:'p2',exp:'',due:'周五',tags:['写文章'],done:false,state:'todo',key:true},
    {id:'t5',name:'引物设计：纤维化标志物 panel',pri:'important',proj:'p3',exp:'',due:'周四',tags:['qPCR'],done:false,state:'todo'},
    {id:'t6',name:'每周组会（重复任务）',pri:'normal',proj:'',exp:'',due:'每周五',tags:['组会'],done:true,state:'done',doneAt:daysAgoISO(1)},
    {id:'t7',name:'细胞换液（重复任务）',pri:'normal',proj:'p1',exp:'',due:'每天',tags:['细胞'],done:true,state:'done',doneAt:daysAgoISO(2)},
    {id:'t8',name:'读文献：PFKFB3 相关 3 篇精读',pri:'normal',proj:'',exp:'',due:'本周',tags:['文献'],done:false,state:'todo'},
  ],
  /* at 是真实的本地时间戳（YYYY-MM-DDTHH:MM），周趋势 / 报表全部由它推导，
     不再有任何写死的统计数组。 */
  focusRecords:[
    {id:'f1',project:'胆汁酸代谢组学',type:'数据分析',minutes:75,at:daysAgoISO(0)+'T09:00'},
    {id:'f2',project:'PFKFB3 过表达与 MASH',type:'实验操作',minutes:50,at:daysAgoISO(0)+'T10:30'},
    {id:'f3',project:'胆汁酸代谢组学',type:'写论文',minutes:50,at:daysAgoISO(1)+'T14:00'},
    {id:'f4',project:'肝纤维化 qPCR 验证',type:'读文献',minutes:25,at:daysAgoISO(1)+'T16:00'},
    {id:'f5',project:'PFKFB3 过表达与 MASH',type:'实验操作',minutes:50,at:daysAgoISO(2)+'T09:00'},
    {id:'f6',project:'胆汁酸代谢组学',type:'数据分析',minutes:50,at:daysAgoISO(3)+'T13:00'},
    {id:'f7',project:'胆汁酸代谢组学',type:'数据分析',minutes:75,at:daysAgoISO(5)+'T10:00'},
  ],
  experiments:[
    {id:'E-2026-114',proj:'PFKFB3 过表达与 MASH',type:'动物',date:'11-17',who:'示例用户',status:'进行中',note:'第 4 周灌胃，体重记录正常'},
    {id:'E-2026-113',proj:'肝纤维化 qPCR 验证',type:'qPCR',date:'11-16',who:'示例用户',status:'失败',note:'Ct 值漂移，疑似逆转录效率低，需重做'},
    {id:'E-2026-112',proj:'胆汁酸代谢组学',type:'测序',date:'11-15',who:'示例用户',status:'完成',note:'LC-MS 上机完成，QC 通过'},
    {id:'E-2026-111',proj:'PFKFB3 过表达与 MASH',type:'WB',date:'11-14',who:'师兄',status:'待重复',note:'条带空白，改用新膜重跑'},
    {id:'E-2026-110',proj:'胆汁酸代谢组学',type:'细胞',date:'11-13',who:'示例用户',status:'完成',note:'HepG2 传代至第 8 代'},
    {id:'E-2026-109',proj:'PFKFB3 过表达与 MASH',type:'统计分析',date:'11-12',who:'示例用户',status:'待开展',note:'待 LC-MS 数据导出'},
  ],
  literatures:[
    {title:'PFKFB3 drives glycolysis in MASLD progression',meta:'Nat Metab · 2026',status:'待精读'},
    {title:'Bile acid profiling by LC-MS/MS in NASH models',meta:'JLR · 2025',status:'已读完'},
    {title:'Hepatic stellate cell activation markers',meta:'Hepatology · 2025',status:'笔记待整理'},
    {title:'GeNorm vs NormFinder reference validation',meta:'Biotechniques · 2024',status:'已读完'},
    {title:'MASH 小鼠模型构建指南（综述）',meta:'DOI:10.10xx · 2024',status:'待精读'},
  ],
  reagents:[
    {name:'Anti-PFKFB3 抗体',no:'ab12345',lot:'L2630',loc:'4°C 冰箱 B',open:'10-02',exp:'2026-12-02',left:'80%'},
    {name:'Trizol',no:'R0016',lot:'T1120',loc:'试剂柜 2',open:'09-20',exp:'2027-09-20',left:'35%'},
    {name:'逆转录试剂盒',no:'RR037A',lot:'K0918',loc:'-20°C',open:'09-18',exp:'2026-11-30',left:'50%'},
    {name:'SDS-PAGE 凝胶配制套装',no:'P0012',lot:'G0722',loc:'室温层析柜',open:'—',exp:'2027-01-10',left:'100%'},
  ],
  instruments:[
    {name:'荧光定量 PCR 仪',cal:'2026-10-12',next:'2027-04-12',note:'运行正常'},
    {name:'超高效液相色谱串联质谱',cal:'2026-06-30',next:'2026-12-30',note:'12 月排期紧张'},
    {name:'化学发光成像仪',cal:'2026-08-01',next:'2027-02-01',note:'—'},
  ],
  reminders:[
    {text:'组会 PPT 截止',date:'周五',color:'var(--red)'},
    {text:'逆转录试剂盒过期',date:'11-30',color:'var(--orange)'},
    {text:'动物伦理年审到期',date:'12-15',color:'var(--orange)'},
    {text:'LC-MS 机时确认',date:'12-20',color:'var(--accent)'},
  ],
  /* 台账：经费、仪器预约、实验速记、最近切片。
     调研里这几项是课题组最高频的痛点（试剂过期/机时冲突/预算超支/记录散落）。 */
  budget:[
    {id:'b1',item:'抗体与试剂盒采购',cat:'耗材',amount:4860,date:'2026-11-05',note:'含 Anti-PFKFB3'},
    {id:'b2',item:'LC-MS 机时费',cat:'测试费',amount:3200,date:'2026-11-12',note:'8 个样本'},
    {id:'b3',item:'小鼠与饲料',cat:'动物',amount:2150,date:'2026-10-28',note:'40 只 C57'},
  ],
  budgetTotal:30000,
  bookings:[
    {id:'k1',inst:'荧光定量 PCR 仪',date:'2026-11-19',slot:'09:00-11:00',who:'示例用户',proj:'肝纤维化 qPCR 验证'},
    {id:'k2',inst:'超高效液相色谱串联质谱',date:'2026-11-20',slot:'14:00-18:00',who:'师兄',proj:'胆汁酸代谢组学'},
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
}

let _dbT=0;
function saveDB(){
  writeCache();
  dbStatus='saving';renderDbStatus();
  clearTimeout(_dbT);
  _dbT=setTimeout(flushDB,400);
}
async function flushDB(){
  clearTimeout(_dbT);_dbT=0;
  writeCache();
  if(!IN_TAURI){dbStatus='browser';renderDbStatus();return}
  try{
    const p=await invoke('db_save',{data:DB});
    dbPath=p||dbPath;dbError='';dbStatus='saved';dbSavedAt=nowStamp().replace('T',' ');
  }catch(e){
    dbError=String(e);dbStatus='error';
    toast('保存到磁盘失败：'+dbError+'（记录已暂存浏览器，请勿清理浏览数据）',7000);
    if(typeof notifyPush==='function')notifyPush('台账保存失败：'+dbError,'settings');
  }
  renderDbStatus();
}
/* 关窗/切走前把最后 400ms 内的改动补写掉，避免丢最后一次编辑 */
window.addEventListener('beforeunload',()=>{if(_dbT){clearTimeout(_dbT);_dbT=0;writeCache();if(IN_TAURI)invoke('db_save',{data:DB}).catch(()=>{})}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&_dbT)flushDB()});

const STATUS_CLS = {'待开展':'status-wait','进行中':'status-run','完成':'status-ok','失败':'status-fail','待重复':'status-re'};

