// LabKit · boot.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== Boot =====================
   必须先把磁盘上的台账读回来再渲染，否则首屏会闪一下示例数据。 */
(async function initHome(){
  const d=new Date();
  document.getElementById('homeDate').textContent=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 · 星期${'日一二三四五六'[d.getDay()]}`;
  const h=d.getHours();
  const greet=h<6?'夜深了':h<11?'早安':h<14?'午安':h<18?'下午好':'晚上好';
  document.getElementById('greetTitle').textContent=greet+'，VVEll';
  await loadDBFromDisk();
  applyDensity();
  buildDash(true);
  refreshHome();
  renderLiterature();renderLab();renderFocusPage();renderReports();renderSettings();
})();
invoke('init_engine').catch(()=>{});
invoke('app_info').then(info=>{if(info&&info.version)document.querySelector('.side-foot').textContent='v'+info.version+' · Rust + Tauri'}).catch(()=>{});
ensureRoiDb();
/* Restore the last qPCR run (wells + design) from the independent session file. */
if(IN_TAURI){
  invoke('qpcr_load_session').then(run=>{
    if(!run||!run.wells||!run.wells.length)return;
    afterWells(run.wells);
    const d=run.design||{};
    if(d.reference_targets&&d.reference_targets.length)qState.refSet=new Set(d.reference_targets);
    if(d.calibrator_sample)qState.calibrator=d.calibrator_sample;
    if(d.ref_strategy)qState.refStrategy=d.ref_strategy;
    if(d.efficiency)qState.eff={...d.efficiency};
    document.getElementById('groupInput').value=Object.entries(d.sample_groups||{}).map(([k,v])=>k+'='+v).join('\n');
    document.querySelectorAll('#refSeg button').forEach(b=>b.classList.toggle('active',b.dataset.ref===qState.refStrategy));
    renderQConfig();
    scheduleQ();
  }).catch(()=>{});
}
