// LabKit · qpcr.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== qPCR workspace（照原版：三输入 + 分析配置 + QC + 导出） ===================== */
let qState={wells:[],targets:[],samples:[],refSet:new Set(),calibrator:null,refStrategy:'GeometricMean',eff:{}};
let lastAnalysis=null;
const FLAG_MAP={Undetermined:'未检出',Outlier:'离群孔',ExcludedByUser:'手动排除',ExcludedBySource:'来源排除',NoReference:'无内参',NoCalibrator:'无对照'};
function flagText(f){
  if(typeof f==='string')return FLAG_MAP[f]||f;
  const k=Object.keys(f)[0];
  if(k==='HighCv')return '高CV '+Number(Object.values(f)[0]).toFixed(3);
  if(k==='HighSd')return '高SD '+Number(Object.values(f)[0]).toFixed(3);
  return k;
}
function parsePasteLocal(text){
  const lines=text.trim().split(/\r?\n/).filter(Boolean);if(!lines.length)return[];
  const sep=lines[0].includes('\t')?'\t':',';const h=lines[0].split(sep).map(s=>s.trim().toLowerCase());
  const si=h.findIndex(x=>/sample|样本|样品/.test(x)),ti=h.findIndex(x=>/target|gene|基因/.test(x)),ci=h.findIndex(x=>/cq|ct值|ct/.test(x));
  return lines.slice(1).map((line,i)=>{const c=line.split(sep);return{id:'w'+i,sample_id:(c[si]||'').trim(),target_id:(c[ti]||'').trim(),cq:parseFloat(c[ci])||null,plate:'',replicate_group:'',flags:[],excluded:false,source_row:i}}).filter(w=>w.sample_id&&w.target_id);
}
function afterWells(wells){
  qState.wells=wells||[];
  qState.targets=[...new Set(qState.wells.map(w=>w.target_id))];
  qState.samples=[...new Set(qState.wells.map(w=>w.sample_id))];
  const hits=qState.targets.filter(t=>/gapdh|actb|18s|hprt|tbP|rplp0/i.test(t));
  qState.refSet=new Set(hits.length?hits:qState.targets.slice(0,1));
  qState.calibrator=qState.samples.find(s=>/对照|control|ctrl/i.test(s))||qState.samples[0]||null;
  renderQConfig();
}
function renderQConfig(){
  document.getElementById('refTargets').innerHTML=qState.targets.length?qState.targets.map(t=>`<button class="badge ${qState.refSet.has(t)?'task-tag':'normal'}" data-rt="${esc(t)}" style="cursor:pointer;height:22px">${esc(t)}</button>`).join(''):'<span style="font-size:11px;color:var(--muted)">解析数据后自动识别</span>';
  document.querySelectorAll('[data-rt]').forEach(el=>el.onclick=()=>{
    const t=el.dataset.rt;
    if(qState.refSet.has(t))qState.refSet.delete(t);else qState.refSet.add(t);
    renderQConfig();scheduleQ();
  });
  document.getElementById('calibratorSel').innerHTML=qState.samples.map(s=>`<option ${s===qState.calibrator?'selected':''}>${esc(s)}</option>`).join('')||'<option>—</option>';
  /* 每基因扩增效率输入（qPCRtools 语义：E=10^(-1/slope)-1；100% → Livak） */
  document.getElementById('effInputs').innerHTML=qState.targets.length?qState.targets.map(t=>`<div class="eff-row"><span class="g" title="${esc(t)}">${esc(t)}</span><input type="number" step="1" min="50" max="150" data-eff="${esc(t)}" value="${qState.eff[t]!=null?Math.round(qState.eff[t]*100):''}" placeholder="100"></div>`).join(''):'<span style="font-size:11px;color:var(--muted)">解析数据后按基因填写</span>';
  document.querySelectorAll('[data-eff]').forEach(inp=>inp.oninput=()=>{
    const t=inp.dataset.eff,v=parseFloat(inp.value);
    if(isFinite(v)&&v>0&&Math.abs(v-100)>1e-9)qState.eff[t]=v/100;else delete qState.eff[t];
    scheduleQ();
  });
  document.getElementById('stdCurveGene').innerHTML=qState.targets.map(t=>`<option>${esc(t)}</option>`).join('')||'<option>—</option>';
}
document.querySelectorAll('#refSeg button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#refSeg button').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  qState.refStrategy=b.dataset.ref;scheduleQ();
});
/* 配置变更自动重算（防抖 500ms） */
let qTimer=0;
function scheduleQ(){clearTimeout(qTimer);qTimer=setTimeout(()=>{if(qState.wells.length)runQpcr(true);},500);}
document.getElementById('calibratorSel').onchange=e=>{qState.calibrator=e.target.value;scheduleQ();};
['cvTh','sdTh'].forEach(id=>document.getElementById(id).addEventListener('input',scheduleQ));
document.getElementById('groupInput').addEventListener('input',scheduleQ);
/* 标准曲线：log10(稀释度) vs 平均 Cq 线性回归 → slope/R²/E（qPCRtools 定义） */
document.getElementById('btnStdCurve').onclick=()=>{
  const text=document.getElementById('stdCurveInput').value.trim();
  const out=document.getElementById('stdCurveOut');
  if(!text){toast('请先粘贴标准曲线数据');return}
  const pts={};
  text.split(/\r?\n/).forEach(l=>{const c=l.split(/[\t,; ]+/).filter(Boolean);if(c.length<2)return;const d=parseFloat(c[0]),q=parseFloat(c[1]);if(isFinite(d)&&d>0&&isFinite(q)){(pts[d]=pts[d]||[]).push(q);}});
  const xs=Object.keys(pts).map(Number).sort((a,b)=>a-b);
  if(xs.length<3){out.textContent='至少需要 3 个稀释度';return}
  const X=xs.map(d=>Math.log10(d)),Y=xs.map(d=>pts[d].reduce((a,b)=>a+b,0)/pts[d].length);
  const n=X.length,mx=X.reduce((a,b)=>a+b,0)/n,my=Y.reduce((a,b)=>a+b,0)/n;
  let sxy=0,sxx=0,syy=0;for(let i=0;i<n;i++){sxy+=(X[i]-mx)*(Y[i]-my);sxx+=(X[i]-mx)*(X[i]-mx);syy+=(Y[i]-my)*(Y[i]-my);}
  const slope=sxy/sxx,r2=syy>0?(sxy*sxy)/(sxx*syy):0;
  const E=Math.pow(10,-1/slope)-1;
  const gene=document.getElementById('stdCurveGene').value;
  out.textContent=`slope=${slope.toFixed(3)} · R²=${r2.toFixed(4)} · E=${(E*100).toFixed(1)}%`;
  mountStdCurvePlot({X,Y,slope,r2,E,gene,raw:pts});
  if(gene&&gene!=='—'&&isFinite(E)&&E>0&&E<1.5){qState.eff[gene]=E;renderQConfig();scheduleQ();toast('标准曲线效率已应用：'+gene+' '+(E*100).toFixed(1)+'%');}
  else toast('效率超出合理范围（0–150%），未应用');
};
function analyzeLocal(run){
  const wells=run.wells||[];
  const samples=[...new Set(wells.map(w=>w.sample_id))],targets=[...new Set(wells.map(w=>w.target_id))];
  const refs=[...qState.refSet];
  const ref=refs[0]||targets[0]||'';
  const ctrl=qState.calibrator||samples.find(s=>/对照|control|ctrl/i.test(s))||samples[0];
  const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
  const cqOf=(s,t)=>mean(wells.filter(w=>w.sample_id===s&&w.target_id===t&&w.cq!=null).map(w=>w.cq));
  const refCqOf=s=>{const arr=refs.length?refs.map(rt=>cqOf(s,rt)).filter(v=>v!=null):[cqOf(s,ref)].filter(v=>v!=null);return mean(arr);};
  const results=[];
  samples.forEach(s=>targets.filter(t=>!refs.includes(t)).forEach(t=>{
    const tc=cqOf(s,t),tr=refCqOf(s),cc=cqOf(ctrl,t),cr=refCqOf(ctrl);
    let dct=null,ddct=null,fc=null;
    if(tc!=null&&tr!=null)dct=tc-tr;
    if(dct!=null&&cc!=null&&cr!=null)ddct=dct-(cc-cr);
    if(ddct!=null){
      const e=qState.eff[t],er=qState.eff[refs[0]];
      if(e!=null&&Math.abs(e-1)>1e-9)fc=Math.pow(1+e,cc-tc)/Math.pow(1+(er!=null?er:1),cr-tr);
      else fc=Math.pow(2,-ddct);
    }
    results.push({sample_id:s,target_id:t,group:null,mean_cq:tc,n_tech:wells.filter(w=>w.sample_id===s&&w.target_id===t).length,cv:null,delta_ct:dct,delta_delta_ct:ddct,fold_change:fc,efficiency:qState.eff[t]!=null?qState.eff[t]:null,flags:[]});
  }));
  return{results,ref_stability:[],ref_used:refs,warnings:[],stats:[]};
}
async function runQpcr(silent){
  let wells=qState.wells;
  const text=document.getElementById('qpcrPaste').value.trim();
  if(!wells.length){
    if(!text){toast('请先粘贴数据或导入文件');return}
    try{wells=await invoke('qpcr_parse_pasted',{text});}catch(e){}
    if(!wells||!wells.length)wells=parsePasteLocal(text);
    afterWells(wells);
  }
  if(!wells.length){toast('未解析出数据孔');return}
  try{
    const run=await invoke('qpcr_new_run',{wells,sourceName:qState.wells===wells?'工作台数据':'粘贴数据'});
    const groups={};
    document.getElementById('groupInput').value.split(/\r?\n/).forEach(l=>{
      const i=l.indexOf('=');
      if(i>0){const k=l.slice(0,i).trim(),v=l.slice(i+1).trim();if(k&&v)groups[k]=v;}
    });
    run.design={calibrator_sample:qState.calibrator||null,reference_targets:[...qState.refSet],target_ids:qState.targets,sample_groups:groups,cv_threshold:parseFloat(document.getElementById('cvTh').value)||0.05,sd_threshold:parseFloat(document.getElementById('sdTh').value)||null,efficiency:{...qState.eff},ref_strategy:qState.refStrategy};
    let analysis=await invoke('qpcr_analyze',{run});
    if(!analysis||!analysis.results||!analysis.results.length)analysis=analyzeLocal(run);
    lastAnalysis=analysis;
    renderQpcr(analysis,wells.length);
    if(IN_TAURI)invoke('qpcr_save_session',{run}).catch(()=>{});
    if(!silent)toast('分析完成：'+analysis.results.length+' 个结果 · 内参 '+(analysis.ref_used||[]).join('/'));
  }catch(e){toast('分析失败：'+e)}
}
document.getElementById('btnQpcrAnalyze').onclick=runQpcr;
document.getElementById('qSrcCsv').onclick=async()=>{
  if(!IN_TAURI){toast('浏览器预览模式：CSV 导入需 Tauri 运行时');return}
  try{
    const p=await window.__TAURI__.dialog.open({filters:[{name:'表格',extensions:['csv','tsv','txt']}]});if(!p)return;
    const wells=await invoke('qpcr_parse_csv_file',{path:String(p)});
    afterWells(wells);
    document.getElementById('qpcrPaste').value=wells.map(w=>[w.sample_id,w.target_id,w.cq].join('\t')).join('\n');
    toast('已读取 CSV：'+wells.length+' 孔');
  }catch(e){toast('CSV 读取失败：'+e)}
};
document.getElementById('qSrcExcel').onclick=async()=>{
  if(!IN_TAURI){toast('浏览器预览模式：Excel 导入需 Tauri 运行时');return}
  try{
    const p=await window.__TAURI__.dialog.open({filters:[{name:'Excel',extensions:['xlsx','xls']}]});if(!p)return;
    const res=await invoke('qpcr_parse_excel',{path:String(p),sheet:null});
    afterWells(res[0]);
    toast('已读取 Excel（sheet: '+res[1]+'）：'+res[0].length+' 孔');
  }catch(e){toast('Excel 读取失败：'+e)}
};
document.getElementById('qSrcInstr').onclick=async()=>{
  if(!IN_TAURI){toast('浏览器预览模式：仪器导入需 Tauri 运行时');return}
  try{
    const p=await window.__TAURI__.dialog.open({filters:[{name:'仪器原始文件',extensions:['eds','rex','ixo','lc96p','xml','rdml']},{name:'全部文件',extensions:['*']}]});if(!p)return;
    let res;
    try{res=await invoke('qpcr_parse_instrument',{path:String(p)});}
    catch(e1){res=await invoke('qpcr_parse_csv_file',{path:String(p)});toast('仪器格式解析失败，已回退通用表解析');}
    afterWells(res[0]);
    toast('已读取仪器文件（'+res[1]+'）：'+res[0].length+' 孔');
  }catch(e){toast('读取失败：'+e)}
};

let qSort={k:null,dir:1}, qFilter={t:'',s:''}, qExpanded=new Set();
const GROUP_COLORS=['#007AFF','#30D158','#FF9F0A','#AF52DE','#FF453A','#5AC8FA','#FF2D55','#64D2FF'];
/* Fold Change 分组柱状图：组均值 ± SD，log2 轴，星号来自后端组间检验（HTqPCR 式可视化） */
function fcChartSvg(analysis){
  const res=(analysis.results||[]).filter(r=>r.fold_change!=null);
  if(!res.length)return '';
  const targets=[...new Set(res.map(r=>r.target_id))];
  const groups=[...new Set(res.map(r=>r.group||'未分组'))];
  const stats={};(analysis.stats||[]).forEach(s=>{stats[s.target_id]=s;});
  const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
  const sd=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)*(v-m),0)/(a.length-1));};
  let lo=0,hi=1;const cells=[];
  targets.forEach(t=>groups.forEach(g=>{
    const vals=res.filter(r=>r.target_id===t&&(r.group||'未分组')===g).map(r=>r.fold_change);
    if(!vals.length)return;
    const m=mean(vals),s=sd(vals);
    cells.push({t,g,m,s});
    lo=Math.min(lo,Math.log2(Math.max(1e-6,m-s)));hi=Math.max(hi,Math.log2(m+s));
  }));
  if(!cells.length)return '';
  lo=Math.floor(lo)-0.5;hi=Math.ceil(hi)+0.5;
  const W=640,H=216,padL=44,padB=36,padT=16;
  const y=v=>padT+(hi-Math.log2(Math.max(1e-6,v)))/(hi-lo)*(H-padT-padB);
  const gw=(W-padL-10)/targets.length;
  const bw=Math.min(34,(gw-14)/groups.length);
  let svg=`<svg class="lc-svg" viewBox="0 0 ${W} ${H}" role="img">`;
  for(let k=Math.ceil(lo);k<=Math.floor(hi);k++){
    const yy=y(Math.pow(2,k));
    const lab=k===0?'1':(k===1?'2':(k===-1?'0.5':'2^'+k));
    svg+=`<line x1="${padL}" y1="${yy}" x2="${W-6}" y2="${yy}" stroke="rgba(0,0,0,${k===0?'.22':'.06'})" stroke-width="1"${k===0?' stroke-dasharray="4 3"':''}/><text x="${padL-6}" y="${yy+3}" text-anchor="end" font-size="9" fill="#8e8e93">${lab}</text>`;
  }
  cells.forEach((c,ci)=>{
    const ti=targets.indexOf(c.t),gi=groups.indexOf(c.g);
    const x=padL+ti*gw+7+gi*bw;
    const y0=y(1),y1=y(c.m);
    const top=Math.min(y0,y1),h=Math.max(1.5,Math.abs(y0-y1));
    const col=GROUP_COLORS[gi%GROUP_COLORS.length];
    svg+=`<rect class="fc-bar" style="animation-delay:${ci*0.05}s" x="${x}" y="${top}" width="${Math.max(6,bw-4)}" height="${h}" rx="3" fill="${col}" fill-opacity=".85"/>`;
    if(c.s>0){
      const cx=x+Math.max(6,bw-4)/2,ye1=y(c.m+c.s),ye2=y(Math.max(1e-6,c.m-c.s));
      svg+=`<line x1="${cx}" y1="${ye1}" x2="${cx}" y2="${ye2}" stroke="${col}" stroke-width="1.4"/><line x1="${cx-4}" y1="${ye1}" x2="${cx+4}" y2="${ye1}" stroke="${col}" stroke-width="1.4"/><line x1="${cx-4}" y1="${ye2}" x2="${cx+4}" y2="${ye2}" stroke="${col}" stroke-width="1.4"/>`;
    }
  });
  targets.forEach((t,ti)=>{
    const st=stats[t];
    const star=st?(st.p<0.001?'***':st.p<0.01?'**':st.p<0.05?'*':'ns'):'';
    svg+=`<text x="${padL+ti*gw+gw/2}" y="${H-18}" text-anchor="middle" font-size="10" font-weight="600" fill="#3a3a3c">${esc(t)}</text>`;
    if(star)svg+=`<text x="${padL+ti*gw+gw/2}" y="${H-5}" text-anchor="middle" font-size="9" fill="${star==='ns'?'#8e8e93':'#FF9F0A'}">${star} (p=${Number(st.p).toFixed(3)})</text>`;
  });
  groups.forEach((g,gi)=>{
    svg+=`<rect x="${padL+gi*92}" y="3" width="8" height="8" rx="2" fill="${GROUP_COLORS[gi%GROUP_COLORS.length]}"/><text x="${padL+gi*92+12}" y="11" font-size="9" fill="#636366">${esc(g)}</text>`;
  });
  svg+='</svg>';
  return `<div class="fc-chart"><div class="chart-title">Fold Change（组均值 ± SD，log2 轴；星号=组间检验）</div>${svg}</div>`;
}
function fcChartHost(){
  return '<div class="fc-chart"><div class="chart-title">Fold Change（组均值 ± 误差棒，log2 轴；星号=组间检验 · Plotly 期刊样式）</div>'+
    '<div style="display:flex;gap:8px;align-items:center;margin:4px 0;flex-wrap:wrap"><label style="font-size:11px;color:#666">误差棒 <select id="fcErrMode" style="font-size:11px"><option>SD</option><option>SEM</option><option>CI95</option></select></label><span id="fcPlotBar" style="display:inline-flex;gap:6px;align-items:center"></span></div>'+
    '<div id="fcPlotly"></div></div>';
}
async function mountFcPlot(analysis){
  const el=document.getElementById('fcPlotly');
  if(!el)return;
  try{
    await loadScript('vendor/plotly.min.js');
    await loadScript('tools/qpcr-plots.js');
    const mode=document.getElementById('fcErrMode');
    const draw=()=>window.QpcrPlots.fcChart(el,analysis,{errMode:mode?mode.value:'SD'});
    draw();
    if(mode)mode.onchange=draw;
    window.QpcrPlots.exportBar(document.getElementById('fcPlotBar'),()=>el,'qpcr_foldchange');
  }catch(e){
    const wrap=el.closest('.fc-chart');
    if(wrap)wrap.innerHTML=fcChartSvg(analysis);
  }
}
async function mountStdCurvePlot(d){
  const el=document.getElementById('stdCurvePlot');
  if(!el)return;
  try{
    await loadScript('vendor/plotly.min.js');
    await loadScript('tools/qpcr-plots.js');
    window.QpcrPlots.stdCurve(el,d);
    window.QpcrPlots.exportBar(document.getElementById('stdCurveBar'),()=>el,'qpcr_stdcurve');
  }catch(e){el.innerHTML=''}
}
function renderQpcr(analysis,nwells){
  const res=analysis.results||[];
  const host=document.getElementById('qpcrResult');
  if(!res.length){host.innerHTML='<div class="empty-state">未解析出结果，请检查列名与数据</div>';return}
  const targets=[...new Set(res.map(r=>r.target_id))];
  const cols=[['sample_id','样本'],['target_id','基因'],['n_tech','重复数'],['mean_cq','平均 Cq'],['cv','CV'],['delta_ct','ΔCt'],['delta_delta_ct','ΔΔCt'],['fold_change','Fold Change'],['efficiency','E']];
  let rowsArr=res.map((r,i)=>({r,i}));
  if(qFilter.t)rowsArr=rowsArr.filter(x=>x.r.target_id===qFilter.t);
  if(qFilter.s)rowsArr=rowsArr.filter(x=>x.r.sample_id.toLowerCase().includes(qFilter.s.toLowerCase()));
  if(qSort.k)rowsArr=rowsArr.sort((a,b)=>{const va=a.r[qSort.k],vb=b.r[qSort.k];if(va==null)return 1;if(vb==null)return -1;return (typeof va==='string'?va.localeCompare(vb):va-vb)*qSort.dir;});
  const rows=rowsArr.map(({r,i})=>{
    const flags=(r.flags||[]).map(flagText);
    const key=r.sample_id+'|'+r.target_id;
    let html=`<tr class="main-row" data-ri="${i}">${cols.map(([k])=>{
      let v=r[k];let cls='';
      if(k==='fold_change'&&v!=null){cls=v>=2?'fold-hi':(v<=0.5?'fold-lo':'')}
      const txt=v==null?'—':(typeof v==='number'?(k==='efficiency'?(v*100).toFixed(0)+'%':v.toFixed(3)):esc(v));
      return `<td class="${k==='sample_id'?'name':''} ${cls}">${txt}</td>`;
    }).join('')}<td style="font-family:var(--sans);color:${flags.length?'#8a5a00':'var(--muted)'}">${flags.length?esc(flags.join(' / ')):'—'}</td></tr>`;
    if(qExpanded.has(key)){
      const ws=qState.wells.filter(w=>w.sample_id===r.sample_id&&w.target_id===r.target_id);
      html+=`<tr class="drill-row"><td colspan="${cols.length+1}">${ws.map(w=>`<label class="well-chip ${w.excluded?'excluded':''}"><input type="checkbox" data-wid="${esc(w.id)}" ${w.excluded?'checked':''}>${w.cq==null?'Undet':w.cq.toFixed(2)}${w.flags&&w.flags.length?' · '+esc(w.flags.map(flagText).join(',')):''}</label>`).join('')}<span class="hint-t">勾选=排除该孔，自动重算</span></td></tr>`;
    }
    return html;
  }).join('');
  const allCols=cols.concat([['flags','QC 标记']]);
  host.innerHTML=`<div class="q-filter">
      <select id="qFilterTarget"><option value="">全部基因</option>${targets.map(t=>`<option ${qFilter.t===t?'selected':''}>${esc(t)}</option>`).join('')}</select>
      <input id="qFilterSample" placeholder="筛选样本…" value="${esc(qFilter.s)}">
      <span class="hint-t">点击行展开复孔 · 点击表头排序</span>
    </div>`+fcChartHost()+`<table class="result-table"><thead><tr>${allCols.map(([k,l])=>`<th data-sort="${k}">${l}${qSort.k===k?`<span class="arr">${qSort.dir>0?'▲':'▼'}</span>`:''}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
  document.getElementById('qFilterTarget').onchange=e=>{qFilter.t=e.target.value;renderQpcr(lastAnalysis,qState.wells.length);};
  document.getElementById('qFilterSample').oninput=e=>{
    qFilter.s=e.target.value;renderQpcr(lastAnalysis,qState.wells.length);
    const el=document.getElementById('qFilterSample');el.focus();el.setSelectionRange(el.value.length,el.value.length);
  };
  host.querySelectorAll('th[data-sort]').forEach(th=>th.onclick=()=>{const k=th.dataset.sort;if(qSort.k===k)qSort.dir*=-1;else{qSort.k=k;qSort.dir=1;}renderQpcr(lastAnalysis,qState.wells.length);});
  host.querySelectorAll('tr.main-row').forEach(tr=>tr.onclick=()=>{const r=res[+tr.dataset.ri];const key=r.sample_id+'|'+r.target_id;if(qExpanded.has(key))qExpanded.delete(key);else qExpanded.add(key);renderQpcr(lastAnalysis,qState.wells.length);});
  host.querySelectorAll('input[data-wid]').forEach(cb=>cb.onchange=()=>{const w=qState.wells.find(x=>x.id===cb.dataset.wid);if(w){w.excluded=cb.checked;runQpcr(true);}});
  mountFcPlot(analysis);
  const effTxt=Object.entries(qState.eff).map(([t,e])=>t+' '+(e*100).toFixed(0)+'%').join(', ');
  document.getElementById('qpcrSummary').textContent=res.length+' 个结果 · 内参 '+(analysis.ref_used||[]).join('/')+' · 策略 '+qState.refStrategy+(effTxt?' · Pfaffl '+effTxt:'');
  const stats=document.getElementById('qpcrStats');
  const nex=qState.wells.filter(w=>w.excluded).length;
  stats.innerHTML=`<div class="stat"><div class="k">样本数</div><div class="v">${new Set(res.map(r=>r.sample_id)).size}</div></div>
    <div class="stat"><div class="k">靶基因数</div><div class="v">${new Set(res.map(r=>r.target_id)).size}</div></div>
    <div class="stat"><div class="k">数据孔</div><div class="v">${nwells||qState.wells.length}</div></div>
    <div class="stat"><div class="k">有效结果</div><div class="v">${res.filter(r=>r.fold_change!=null).length}</div></div>
    <div class="stat"><div class="k">排除孔</div><div class="v">${nex}</div></div>`;
  const rs=document.getElementById('qpcrRefStab');
  const stab=analysis.ref_stability||[];
  const gn=analysis.genorm;
  const gnTxt=gn?`<div class="warn" style="background:rgba(0,122,255,.06);color:var(--ink-2)">geNorm 逐步剔除：${esc((gn.exclusion_order||[]).join(' → ')||'无')} · 推荐内参数 <b>${gn.recommended_n}</b><br>配对变异 ${(gn.pairwise_v||[]).map(([n,v])=>'V'+n+'/'+(n+1)+'='+Number(v).toFixed(3)).join('，')||'—'}（&lt;0.15 表示 n 个内参已足够）</div>`:'';
  rs.innerHTML=(stab.length?stab.map(([t,m])=>`<div class="warn" style="background:${m<0.5?'rgba(48,209,88,.08)':m<1?'rgba(255,159,10,.08)':'rgba(255,69,58,.08)'};color:var(--ink-2)"><b>${esc(t)}</b> · M=${Number(m).toFixed(3)}${m<0.5?'（稳定）':m<1?'（可接受）':'（偏不稳定）'}</div>`).join(''):'<span style="font-size:11px;color:var(--muted)">需≥2 个内参基因</span>')+gnTxt;
  const warns=document.getElementById('qpcrWarns');
  const w=analysis.warnings||[];
  warns.innerHTML=w.length?w.map(x=>`<div class="warn">${esc(x)}</div>`).join(''):'<span style="font-size:11px;color:var(--muted)">全部通过质控</span>';
  const gs=document.getElementById('qpcrGroupStats');
  const st=analysis.stats||[];
  gs.innerHTML=st.length?st.map(s=>`<div class="warn" style="background:rgba(0,122,255,.06);color:var(--ink-2)"><b>${esc(s.target_id)}</b> · ${esc(s.method)} · p=${Number(s.p).toFixed(4)}<br>${esc(s.detail)}（${esc((s.groups||[]).join(' vs '))}）</div>`).join(''):'<span style="font-size:11px;color:var(--muted)">配置样本分组后自动计算 Welch t / ANOVA</span>';
}
document.getElementById('btnQpcrExport').onclick=async()=>{
  if(!IN_TAURI){toast('浏览器预览模式：导出需 Tauri 运行时');return}
  if(!lastAnalysis){toast('请先完成一次分析');return}
  try{
    const p=await window.__TAURI__.dialog.save({filters:[{name:'CSV',extensions:['csv']}],defaultPath:'qpcr_result.csv'});
    if(!p)return;
    await invoke('qpcr_export_csv',{path:String(p),analysis:lastAnalysis});
    toast('已导出到 '+String(p));
  }catch(e){toast('导出失败：'+e)}
};

