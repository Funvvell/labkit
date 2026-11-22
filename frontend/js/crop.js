// LabKit · crop.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== Crop workspace（复刻原版交互：拖拽平移 / 拖 ROI / 角点缩放 / 空格创建 / Ctrl+Z） ===================== */
let rois=[]; let slideSrc=null; let currentSlidePath='';
let baseW=0,baseH=0,imgW=0,imgH=0;
let view={zoom:1,panX:0,panY:0};
let selected=new Set(), primaryIdx=-1, lastMouse=null, mag=20, ratio='16:9';
let slideInfo=null;
let undoStack=[], redoStack=[];
let pendingOpen=null;      /* {path,gen} — SDPC open queued on the decoder worker */
let exporting=false;       /* an export job is in flight (button becomes cancel) */
let exportFailed=0;        /* 首个失败原因，导出结束时一并提示，不再只报一个数字 */
let exportFirstErr='';
let roiDb=[], roiDbReady=false;  /* persisted ROIs of ALL slides, backend format */
let slideMeta=null;             /* engine / vendor / mpp / label-macro from Rust */
let decoderReady=false, decoderPromise=null;
let exportFmt='tiff', exportQuality=95, exportFmtLabel='TIFF';
const WSI_RE=/\.(sdpc|svs|ndpi|vms|vmu|mrxs|scn|bif|czi|zvi|dcm|vsi|avs|j2k|j2c|tif|tiff)$/i;
const stage=document.getElementById('stage'); const frame=document.getElementById('slideFrame');
const viewport=document.getElementById('viewport');
const slideImg=document.getElementById('slideImg'); const roiLayer=document.getElementById('roiLayer');
const miniNav=document.getElementById('miniNav'); const dropHint=document.getElementById('dropHint');

function setSlide(src,name){
  slideSrc=src;
  clearTiles();
  slideImg.onload=async()=>{
    layoutSlide();
    /* Restore persisted ROIs of this slide (regular images have no path). */
    rois=currentSlidePath?roiDb.filter(r=>r.slide_path===currentSlidePath).map(r=>({x:r.x,y:r.y,w:r.w,h:r.h})):[];
    selected.clear();primaryIdx=-1;undoStack=[];redoStack=[];drawRois();
    requestPaint();
  };
  slideImg.src=src;
  document.getElementById('miniImg').src=src;
  frame.classList.remove('hidden');miniNav.classList.remove('hidden');dropHint.classList.add('hidden');
  const fileEl=document.getElementById('cropFile');
  fileEl.textContent=(name||'切片')+' · 已载入预览';
  fileEl.title=name||'切片';
}
/* ---- 切片元数据 / label / macro ---- */
function fmtInt(n){n=Number(n)||0;return n.toLocaleString('en-US')}
function renderSlideMeta(meta,info){
  const el=document.getElementById('cropMeta');if(!el)return;
  meta=meta||{};info=info||{};
  el.hidden=false;
  const fmt=document.getElementById('cmFormat');
  const props=meta.properties||{};
  const propText=Object.keys(props).map(k=>k+' = '+props[k]).join('\n');
  fmt.textContent=meta.format||'WSI';
  fmt.title=[meta.engine||'',meta.vendor?('厂商 '+meta.vendor):'',propText].filter(Boolean).join('\n');
  document.getElementById('cmDims').textContent=fmtInt(info.full_w)+' × '+fmtInt(info.full_h)+' px';
  const mpp=meta.mppX||meta.mppY||info.mpp;
  document.getElementById('cmMpp').textContent=mpp?(+mpp).toFixed(3).replace(/\.?0+$/,'')+' µm/px':'mpp 未知';
  document.getElementById('cmMag').textContent=meta.objectivePower?(+meta.objectivePower)+'×':'倍率未知';
  document.getElementById('cmLevels').textContent=(meta.levelCount||(info.levels?info.levels.length:0))+' 层金字塔';
  const vendor=document.getElementById('cmVendor');
  vendor.textContent=meta.vendor?('厂商 '+meta.vendor):'';
  updateDpiNote();
}
function clearSlideMeta(){
  const el=document.getElementById('cropMeta');if(el)el.hidden=true;
  renderAssoc(null,null);
  slideMeta=null;
}
function renderAssoc(labelUrl,macroUrl){
  const wrap=document.getElementById('cropAssoc');if(!wrap)return;
  const l=document.getElementById('assocLabel'),m=document.getElementById('assocMacro');
  const li=document.getElementById('assocLabelImg'),mi=document.getElementById('assocMacroImg');
  if(labelUrl&&li){li.src=labelUrl;l.hidden=false}else{l.hidden=true;if(li)li.removeAttribute('src')}
  if(macroUrl&&mi){mi.src=macroUrl;m.hidden=false}else{m.hidden=true;if(mi)mi.removeAttribute('src')}
  wrap.hidden=!(labelUrl||macroUrl);
  l.onclick=labelUrl?()=>showImagePreview(labelUrl,'切片标签图'):null;
  m.onclick=macroUrl?()=>showImagePreview(macroUrl,'切片宏观图'):null;
}
function showImagePreview(url,title){
  const mask=document.createElement('dialog');mask.className='modal-mask';mask.setAttribute('aria-label',title);
  // 预览浮层：宽度交给 CSS（.roi-modal.preview），按钮用 data-act 定位，
  // 不用 id —— 同时开两个预览时 id 会撞。
  const box=document.createElement('div');box.className='roi-modal preview';
  box.innerHTML='<h4>'+esc(title)+'</h4><img alt="预览" class="roi-preview-img">'
    +'<div class="btn-row"><button class="btn sec" data-act="close">关闭</button></div>';
  box.querySelector('img').src=url;
  mask.appendChild(box);document.body.appendChild(mask);
  const close=()=>{closeLayer(mask);if(mask.parentNode)mask.remove()};
  box.querySelector('[data-act="close"]').onclick=close;
  mask.addEventListener('click',e=>{if(e.target===mask)close()});
  openLayer(mask);
}
function exportDpiSummary(){
  const mpp=slideInfo&&slideInfo.mpp;
  if(mpp)return '导出将写入 '+Math.round(25400/mpp)+' dpi（按 mpp '+mpp+' µm/px 换算）。';
  return '该切片没有 mpp，导出文件不写 DPI 标签。';
}
function updateDpiNote(){
  const el=document.getElementById('expDpiNote');if(!el)return;
  el.textContent=exportDpiSummary();
}
async function ensureSdpcDecoder(){
  if(decoderReady)return true;
  const panel=document.getElementById('cropDllHelp');if(panel)panel.hidden=false;
  const title=document.getElementById('cropDllTitle'),msg=document.getElementById('cropDllMsg');
  if(title)title.textContent='正在准备 SDPC 解码组件';
  if(msg)msg.textContent='首次打开 .sdpc 需要下载约 62 MB 的厂商解码组件（来自 PyPI 官方包，SHA-256 校验，之后离线可用）。';
  const retry=document.getElementById('cropDllRetry');if(retry)retry.hidden=true;
  const bar=document.getElementById('cropDllBar');if(bar)bar.style.width='0%';
  const pct=document.getElementById('cropDllPct');if(pct)pct.textContent='0%';
  if(!decoderPromise){
    decoderPromise=invoke('ensure_sdpc_decoder')
      .then(()=>{decoderReady=true;if(panel)panel.hidden=true;toast('SDPC 解码组件已就绪');return true})
      .catch(e=>{if(title)title.textContent='SDPC 解码组件下载失败';if(msg)msg.textContent=String(e);if(retry)retry.hidden=false;throw e})
      .finally(()=>{decoderPromise=null});
  }
  return decoderPromise;
}
if(IN_TAURI&&window.__TAURI__&&window.__TAURI__.event&&window.__TAURI__.event.listen){
  window.__TAURI__.event.listen('labkit:sdpc-download',ev=>{
    const p=(ev&&ev.payload)||{};const bar=document.getElementById('cropDllBar');const pctEl=document.getElementById('cropDllPct');
    const msg=document.getElementById('cropDllMsg');
    let pct=0;
    if(p.stage==='download'&&p.total>0)pct=Math.min(100,Math.round(p.received*100/p.total));
    else if(p.stage==='verify')pct=100;
    else if(p.stage==='extract')pct=100;
    else if(p.stage==='done')pct=100;
    if(bar)bar.style.width=pct+'%';
    if(pctEl)pctEl.textContent=p.stage==='checking'?'检查组件…':(p.stage==='download'?pct+'%':(p.stage==='verify'?'校验中…':(p.stage==='extract'?'解压中…':'完成')));
    if(msg&&p.stage==='download'&&p.total>0)msg.textContent='正在下载解码组件：'+(p.received/1048576).toFixed(1)+' / '+(p.total/1048576).toFixed(1)+' MB';
  }).catch(()=>{});
}
/* ---- ROI 会话持久化（~/.liver_portal_crop/session_rust.json，跨切片合并） ---- */
async function ensureRoiDb(){
  if(roiDbReady)return;
  try{roiDb=await invoke('load_rois')||[];}catch(e){roiDb=[];}
  roiDbReady=true;
}
function persistRois(){
  if(!IN_TAURI||!currentSlidePath||!roiDbReady)return;
  const mine=rois.map((r,i)=>({id:currentSlidePath+'#'+i,slide_path:currentSlidePath,x:r.x,y:r.y,w:r.w,h:r.h,angle:0,created_at:''}));
  roiDb=roiDb.filter(r=>r.slide_path!==currentSlidePath).concat(mine);
  // 只回写本切片的 ROI 并声明权威切片，Rust 侧保留其它窗口的切片（跨窗口合并写）。
  invoke('save_rois',{rois:mine,slides:[currentSlidePath]}).catch(e=>toast('ROI 保存失败：'+e,5200));
}
function layoutSlide(){
  imgW=(slideInfo&&slideInfo.full_w)||slideImg.naturalWidth||100;
  imgH=(slideInfo&&slideInfo.full_h)||slideImg.naturalHeight||100;
  const st=stage.getBoundingClientRect();
  const k=Math.min(st.width*0.9/imgW, st.height*0.9/imgH);
  baseW=Math.max(80,imgW*k); baseH=Math.max(80,imgH*k);
  frame.style.width=baseW+'px'; frame.style.height=baseH+'px';
  const nk=Math.min(150/imgW,112/imgH);
  miniNav.style.width=Math.max(60,imgW*nk)+'px';
  miniNav.style.height=Math.max(45,imgH*nk)+'px';
  setViewTarget(1,0,0,true);
}
function applyCanvasView(){
  viewport.style.transform=`translate(${view.panX}px,${view.panY}px) scale(${view.zoom})`;
  document.getElementById('zoomLabel').textContent=Math.round(view.zoom*100)+'%';
  drawRois(true);
  updateNavViewbox();
  scheduleTiles();
}
/* 导航缩略图视野框实时定位（原版语义），点击跳转 */
function updateNavViewbox(){
  const nav=document.getElementById('miniNav');
  const box=nav.querySelector('.viewbox');
  const stR=stage.getBoundingClientRect(),frR=frame.getBoundingClientRect();
  const fx=frR.left-stR.left,fy=frR.top-stR.top;
  const vx0=Math.max(0,(0-fx-view.panX)/view.zoom),vy0=Math.max(0,(0-fy-view.panY)/view.zoom);
  const vx1=Math.min(baseW,(stR.width-fx-view.panX)/view.zoom),vy1=Math.min(baseH,(stR.height-fy-view.panY)/view.zoom);
  const sf=dispToImg();
  const ix0=vx0*sf,iy0=vy0*sf,ix1=vx1*sf,iy1=vy1*sf;
  const kx=nav.clientWidth/Math.max(imgW,1),ky=nav.clientHeight/Math.max(imgH,1);
  box.style.left=(ix0*kx)+'px';box.style.top=(iy0*ky)+'px';
  box.style.width=Math.max(3,(ix1-ix0)*kx)+'px';box.style.height=Math.max(3,(iy1-iy0)*ky)+'px';
}
miniNav.addEventListener('click',e=>{
  if(!slideSrc)return;
  const r=miniNav.getBoundingClientRect();
  const ix=((e.clientX-r.left)/r.clientWidth)*imgW;
  const iy=((e.clientY-r.top)/r.clientHeight)*imgH;
  const sf=dispToImg();
  setViewTarget(view.zoom,baseW/2-(ix/sf)*view.zoom,baseH/2-(iy/sf)*view.zoom);
});
function toView(e){
  const r=frame.getBoundingClientRect();
  return {x:(e.clientX-r.left-view.panX)/view.zoom, y:(e.clientY-r.top-view.panY)/view.zoom};
}
function dispToImg(){return (imgW&&baseW)?imgW/baseW:1}
/* 缩放上下限照抄 Python 语义：Python wheelEvent 直接 scale()，无相对倍率上限，
   可以放大到 1:1 原生像素甚至更高。这里按绝对比例 m11（屏幕px/level-0 px，
   等价 Qt transform().m11()）限制，覆盖全部有用倍率并防止数值退化。 */
function clampZoom(z){const k=(imgW&&baseW)?baseW/imgW:1;return Math.min(32,Math.max(1e-4,z*k))/k;}
/* ---- 平滑缩放：滚轮/适配/导航设置目标视图，rAF 指数逼近（~120ms 收敛），
   消除逐格跳变的割裂感；拖拽平移保持直跟（零延迟）。 ---- */
let viewTarget=null, viewRaf=0;
function setViewTarget(z,px,py,instant){
  if(instant){viewTarget=null;if(viewRaf){cancelAnimationFrame(viewRaf);viewRaf=0;}view={zoom:z,panX:px,panY:py};viewMoving=false;applyCanvasView();return;}
  viewTarget={zoom:z,panX:px,panY:py};viewMoving=true;
  if(!viewRaf)viewRaf=requestAnimationFrame(stepView);
}
function stepView(){
  viewRaf=0;
  if(!viewTarget)return;
  const t=viewTarget,k=0.32;
  view.zoom+=(t.zoom-view.zoom)*k;
  view.panX+=(t.panX-view.panX)*k;
  view.panY+=(t.panY-view.panY)*k;
  if(Math.abs(t.zoom-view.zoom)<t.zoom*0.002&&Math.abs(t.panX-view.panX)<0.4&&Math.abs(t.panY-view.panY)<0.4){
    view={zoom:t.zoom,panX:t.panX,panY:t.panY};viewTarget=null;viewMoving=false;applyCanvasView();return;
  }
  applyCanvasView();
  viewRaf=requestAnimationFrame(stepView);
}

/* ---- 撤销 / 重做（与原版 Ctrl+Z/Y 语义一致：批量操作单步回退） ---- */
function snapshot(){undoStack.push(JSON.stringify(rois));if(undoStack.length>50)undoStack.shift();redoStack.length=0;}
function clearSel(){selected.clear();primaryIdx=-1;}
function selectOnly(i){selected.clear();selected.add(i);primaryIdx=i;}
function undo(){if(!undoStack.length){toast('没有可撤销的操作');return}redoStack.push(JSON.stringify(rois));rois=JSON.parse(undoStack.pop());clearSel();drawRois();persistRois();toast('已撤销');}
function redo(){if(!redoStack.length){toast('没有可重做的操作');return}undoStack.push(JSON.stringify(rois));rois=JSON.parse(redoStack.pop());clearSel();drawRois();persistRois();toast('已重做');}

function drawRois(skipList){
  const sf=dispToImg(), z=view.zoom;
  /* roiLayer 在缩放容器外、按屏幕坐标绘制：Chrome 会把缩放容器内的亚像素
     border/width 钳制到 ≥1 base px 再乘 zoom，高倍率下边框/手柄被放大成粗块。
     sx/sy：level-0 px → 屏幕 px（相对 frame 原点，与 viewport 变换一致）。 */
  const sx=v=>view.panX+v/sf*z, sy=v=>view.panY+v/sf*z;
  roiLayer.innerHTML='';
  rois.forEach((ro,i)=>{
    const d=document.createElement('div');
    d.className='roi-rect'+(selected.has(i)?' sel':'');
    d.style.left=sx(ro.x)+'px';d.style.top=sy(ro.y)+'px';
    d.style.width=(ro.w/sf*z)+'px';d.style.height=(ro.h/sf*z)+'px';
    /* --rok = m11（每 level-0 px 的屏幕 px）：线宽 2/2.5 场景单位随缩放，照抄 Python 非 cosmetic 画笔 */
    d.style.setProperty('--rok',(z/sf)+'px');
    roiLayer.appendChild(d);
  });
  /* 手柄挂在 layer 上（不挂在 rect 内，避免 rect 边框挤偏手柄定位）；
     屏幕恒定 8px，照抄 Python ItemIgnoresTransformations；CSS translate(-50%,-50%) 居中 */
  if(primaryIdx>=0&&rois[primaryIdx]){
    const ro=rois[primaryIdx];
    const pts={nw:[0,0],n:[0.5,0],ne:[1,0],e:[1,0.5],se:[1,1],s:[0.5,1],sw:[0,1],w:[0,0.5]};
    for(const k of Object.keys(pts)){
      const h=document.createElement('span');
      h.className='roi-handle '+k;
      h.style.left=sx(ro.x+pts[k][0]*ro.w)+'px';
      h.style.top=sy(ro.y+pts[k][1]*ro.h)+'px';
      roiLayer.appendChild(h);
    }
  }
  /* 纯视图变化（缩放/平移）时 ROI 数据没变，跳过右侧列表重建：
     否则每帧都要重建整份列表 DOM 并重新绑定监听，ROI 多时明显拖慢缩放。 */
  if(!skipList){renderRoiList();document.getElementById('roiCount').textContent=rois.length+' 个区域';}
}
function renderRoiList(){
  const list=document.getElementById('roiList');
  list.innerHTML=rois.length?rois.map((ro,i)=>`
    <div class="roi-item ${selected.has(i)?'sel':''}" data-i="${i}">
      <div class="roi-bar" style="background:${selected.has(i)?'var(--accent)':i%3===1?'var(--orange)':i%3===2?'var(--green)':'var(--accent)'}"></div>
      <div class="roi-meta"><b>ROI ${i+1}</b><span>x ${ro.x} y ${ro.y} · ${ro.w}×${ro.h} px</span></div>
      <svg class="roi-check" viewBox="0 0 24 24" fill="none" style="--dot:${i%3===1?'var(--orange,#FF9F0A)':i%3===2?'var(--green,#30D158)':'var(--accent,#007AFF)'}"><circle class="roi-check-dot" cx="12" cy="12" r="9"/><path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>`).join(''):'';
  list.querySelectorAll('.roi-item').forEach(el=>{
    el.addEventListener('click',()=>{selectOnly(Number(el.dataset.i));drawRois();fitToRoi(false);});
    el.addEventListener('dblclick',()=>{selectOnly(Number(el.dataset.i));drawRois();openRoiEditor(Number(el.dataset.i));});
  });
}
/* 命中检测（显示坐标） */
function hitRoi(vx,vy){
  const sf=dispToImg();
  for(let i=rois.length-1;i>=0;i--){
    const r=rois[i],x=r.x/sf,y=r.y/sf,w=r.w/sf,h=r.h/sf;
    if(vx>=x-3&&vx<=x+w+3&&vy>=y-3&&vy<=y+h+3)return i;
  }
  return -1;
}
function hitHandle(vx,vy){
  if(primaryIdx<0)return null;
  const sf=dispToImg();const r=rois[primaryIdx];
  const x=r.x/sf,y=r.y/sf,w=r.w/sf,h=r.h/sf;
  const rr=8/view.zoom;   /* 命中区屏幕恒定 8px */
  const c={nw:[x,y],n:[x+w/2,y],ne:[x+w,y],e:[x+w,y+h/2],se:[x+w,y+h],s:[x+w/2,y+h],sw:[x,y+h],w:[x,y+h/2]};
  for(const k of Object.keys(c)){if(Math.abs(vx-c[k][0])<rr&&Math.abs(vy-c[k][1])<rr)return k;}
  return null;
}
function fitToRoi(showToast){
  if(primaryIdx>=0&&rois[primaryIdx]){
    const sf=dispToImg();const r=rois[primaryIdx];
    const z=clampZoom(Math.min(baseW*0.8/(r.w/sf),baseH*0.8/(r.h/sf)));
    const cx=(r.x+r.w/2)/sf, cy=(r.y+r.h/2)/sf;
    setViewTarget(z,baseW/2-cx*z,baseH/2-cy*z);
    if(showToast)toast('已适配选中 ROI');
  }else{setViewTarget(1,0,0);if(showToast)toast('已适配窗口');}
}
function placeRoiAt(){
  if(!slideSrc||!lastMouse)return;
  /* 照抄 Python _place_roi_at_frame：框宽/高输入值本身就是 level-0 像素尺寸
     （autoCalcFrame 已按当前倍率/mpp 换算），直接取用，不再二次缩放。
     范围对齐 Python QSpinBox 的 64..999999。 */
  const fw=Math.min(999999,Math.max(64,parseInt(document.getElementById('frameW').value)||512));
  const fh=Math.min(999999,Math.max(64,parseInt(document.getElementById('frameH').value)||512));
  const sf=dispToImg();
  const cx=lastMouse.x*sf, cy=lastMouse.y*sf;
  let X=Math.round(cx-fw/2), Y=Math.round(cy-fh/2);
  X=Math.max(0,Math.min(X,imgW-fw)); Y=Math.max(0,Math.min(Y,imgH-fh));
  snapshot();
  rois.push({x:X,y:Y,w:fw,h:fh});
  selectOnly(rois.length-1);
  drawRois();persistRois();toast('已创建 ROI '+rois.length+'（'+fw+'×'+fh+' px @'+mag+'×）· 拖动移动 / 手柄调整');
}

/* ---- 统一交互：命中 ROI → 拖动；命中角点 → 缩放；空白 → 平移 ---- */
let drag=null;
frame.addEventListener('mousedown',e=>{
  if(!slideSrc||e.button!==0)return; e.preventDefault();
  const v=toView(e);
  const hf=hitHandle(v.x,v.y);
  if(hf){snapshot();drag={type:'resize',corner:hf,orig:{...rois[primaryIdx]}};return;}
  const hit=hitRoi(v.x,v.y);
  if(hit>=0){
    if(e.ctrlKey||e.metaKey){
      if(selected.has(hit)){selected.delete(hit);if(primaryIdx===hit)primaryIdx=selected.size?[...selected][selected.size-1]:-1;}
      else{selected.add(hit);primaryIdx=hit;}
      drawRois();drag={type:'none'};return;
    }
    if(!selected.has(hit)){selectOnly(hit);drawRois();}
    const ids=[...selected];
    snapshot();drag={type:'move',start:v,orig:ids.map(i=>({...rois[i]})),ids};
    return;
  }
  clearSel();drawRois();
  viewTarget=null;if(viewRaf){cancelAnimationFrame(viewRaf);viewRaf=0;}
  drag={type:'pan',sx:e.clientX,sy:e.clientY,px:view.panX,py:view.panY};
  frame.classList.add('panning');
});
window.addEventListener('mousemove',e=>{
  if(document.getElementById('view-crop').classList.contains('active'))lastMouse=toView(e);
  if(!drag)return;
  if(drag.type==='pan'){
    view.panX=drag.px+(e.clientX-drag.sx); view.panY=drag.py+(e.clientY-drag.sy);
    viewMoving=true;
    /* ROI 层在屏幕空间：平移必须同步重绘 ROI/导航框并补瓦片，否则拖拽时 ROI 脱位 */
    applyCanvasView();
    return;
  }
  if(drag.type==='none')return;
  const v=toView(e), sf=dispToImg();
  if(drag.type==='move'){
    const dx=Math.round((v.x-drag.start.x)*sf), dy=Math.round((v.y-drag.start.y)*sf);
    drag.ids.forEach((id,k)=>{
      const o=drag.orig[k], r=rois[id];
      r.x=Math.max(0,Math.min(imgW-r.w,o.x+dx));
      r.y=Math.max(0,Math.min(imgH-r.h,o.y+dy));
    });
    drawRois();
  }else if(drag.type==='resize'){
    const o=drag.orig, c=drag.corner;
    const vx=v.x*sf, vy=v.y*sf;
    let x1=o.x,y1=o.y,x2=o.x+o.w,y2=o.y+o.h;
    if(c.includes('w'))x1=Math.min(vx,x2-20);
    if(c.includes('e'))x2=Math.max(vx,x1+20);
    if(c.includes('n'))y1=Math.min(vy,y2-20);
    if(c.includes('s'))y2=Math.max(vy,y1+20);
    const r=rois[primaryIdx];
    r.x=Math.round(x1);r.y=Math.round(y1);r.w=Math.round(x2-x1);r.h=Math.round(y2-y1);
    drawRois();
  }
});
window.addEventListener('mouseup',()=>{
  if(!drag)return;
  if(drag.type==='pan'){frame.classList.remove('panning');viewMoving=false;requestPaint();}
  if(drag.type==='move'||drag.type==='resize')persistRois();
  drag=null;
});
/* 滚轮缩放：以鼠标位置为中心（原版 WHEEL_FACTOR 1.15），目标视图平滑逼近 */
stage.addEventListener('wheel',e=>{
  if(!slideSrc)return;e.preventDefault();
  const f=e.deltaY<0?1.15:1/1.15;
  const cur=viewTarget||view;
  const z2=clampZoom(cur.zoom*f);
  const r=frame.getBoundingClientRect();
  const mx=e.clientX-r.left,my=e.clientY-r.top;
  const vx=(mx-cur.panX)/cur.zoom, vy=(my-cur.panY)/cur.zoom;
  setViewTarget(z2,mx-z2*vx,my-z2*vy);
},{passive:false});
/* 键盘：Space 创建 · Del 删除 · Ctrl+Z/Y 撤销重做 · F 适配 */
window.addEventListener('keydown',e=>{
  if(!document.getElementById('view-crop').classList.contains('active')||!slideSrc)return;
  const tag=(e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||tag==='select')return;
  if(e.code==='Space'){e.preventDefault();placeRoiAt();}
  else if(e.key==='Delete'||e.key==='Backspace'){
    if(selected.size){snapshot();const ids=[...selected].sort((a,b)=>b-a);ids.forEach(i=>rois.splice(i,1));clearSel();drawRois();persistRois();toast('已删除 '+ids.length+' 个 ROI');}
  }
  else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='a'){e.preventDefault();rois.forEach((_,i)=>selected.add(i));primaryIdx=rois.length-1;drawRois();toast('已全选 '+rois.length+' 个 ROI');}
  else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='d'){e.preventDefault();
    if(!selected.size)return;snapshot();
    const adds=[...selected].map(i=>({x:rois[i].x+30,y:rois[i].y+30,w:rois[i].w,h:rois[i].h}));
    adds.forEach(a=>rois.push(a));selectOnly(rois.length-1);drawRois();persistRois();toast('已复制 '+adds.length+' 个 ROI');}
  else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!e.shiftKey){e.preventDefault();undo();}
  else if((e.ctrlKey||e.metaKey)&&(e.key.toLowerCase()==='y'||(e.shiftKey&&e.key.toLowerCase()==='z'))){e.preventDefault();redo();}
  else if(e.key.toLowerCase()==='n'||e.key.toLowerCase()==='p'){e.preventDefault();jumpRoi(e.key.toLowerCase()==='n'?1:-1);}
  else if(e.key.toLowerCase()==='f'){fitToRoi(true);}
});
function jumpRoi(dir){
  if(!rois.length)return;
  const sorted=rois.map((r,i)=>({i,r})).sort((a,b)=>(a.r.x-b.r.x)||(a.r.y-b.r.y)||(a.i-b.i));
  const cur=sorted.findIndex(s=>s.i===primaryIdx);
  let next=cur+dir;
  if(next<0)next=sorted.length-1;
  if(next>=sorted.length)next=0;
  selectOnly(sorted[next].i);drawRois();fitToRoi(false);
  toast('ROI '+(sorted[next].i+1)+' / '+rois.length);
}
window.addEventListener('resize',()=>{if(slideSrc&&!drag)layoutSlide()});

document.getElementById('btnUndo').onclick=undo;
document.getElementById('btnRedo').onclick=redo;
document.getElementById('btnDelRoi').onclick=()=>{if(selected.size){snapshot();const ids=[...selected].sort((a,b)=>b-a);ids.forEach(i=>rois.splice(i,1));clearSel();drawRois();persistRois();toast('已删除 '+ids.length+' 个 ROI')}else toast('先点击选中一个 ROI')};
document.getElementById('btnFit').onclick=()=>fitToRoi(true);
/* 倍率/比例：Python 原版换算（fov = FN 22mm / mag，比例按对角线分解，px = mm×1000/mpp） */
function autoCalcFrame(){
  if(ratio==='Free')return;
  if(!slideInfo||!slideInfo.mpp||slideInfo.mpp<=0){return;}
  const FN=22.0, fov=FN/mag;
  let w,h;
  if(ratio==='1:1'){w=h=fov/1.4142;}
  else if(ratio==='4:3'){w=fov*4/5;h=fov*3/5;}
  else if(ratio==='3:2'){w=fov*3/3.606;h=fov*2/3.606;}
  else if(ratio==='16:9'){const dg=Math.sqrt(16*16+9*9);w=fov*16/dg;h=fov*9/dg;}
  else return;
  document.getElementById('frameW').value=Math.round(w*1000/slideInfo.mpp);
  document.getElementById('frameH').value=Math.round(h*1000/slideInfo.mpp);
}
['frameW','frameH'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{}));
document.querySelectorAll('#magSeg button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#magSeg button').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  mag=Number(b.dataset.mag);
  autoCalcFrame();
  toast('倍率 '+mag+'×'+(slideInfo&&slideInfo.mpp?('：框尺寸已按 mpp 换算，导出带 _'+mag+'x 后缀'):'（无 mpp，请手动输入框尺寸）'));
});
document.querySelectorAll('#ratioSeg button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#ratioSeg button').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  ratio=b.dataset.ratio;
  autoCalcFrame();
});

/* ===================== 金字塔瓦片渲染（单 canvas · 设备像素对齐 · 零编码传输） ===================== */
/* 对齐 Python 版 QGraphicsScene 的做法：所有瓦片画进同一个绘图表面。
   旧实现的三个致命点已移除：
   ① 逐瓦片白平衡（chanP90 + 逐像素增益 + toDataURL）——每块 1024² 要在主线程
      做 100 万次乘法再重编码 JPEG，是缩放卡顿的主因；而且每块增益各不相同，
      本身就是"色块拼布"的制造者。原版从不做这件事，现在也不做。
   ② 每块一个被 CSS scale 的 <img> + 淡入动画——Chrome 对每个图层独立取整，
      共享边出现亚像素缝隙，淡入期间还透出底图 → 接缝 + 闪色。
   ③ PNG data URL + 250ms 轮询——现在后端直接回 RGBA 原始字节（ArrayBuffer），
      前端 ImageData 零转换包成 ImageBitmap，请求即等待，无轮询延迟。 */
const TS=1024;
const TILE_BUDGET_PX=40e6;   /* ImageBitmap 缓存预算（≈160MB），超出按 LRU 释放 */
const MAX_INFLIGHT=6;        /* 并发解码请求数：DLL 串行，多了只会排队 */
let tileCache=new Map();     /* key -> {bmp,level,tx,ty,tw,th,px}，Map 顺序即 LRU */
let tilePx=0;
let inflight=new Set();
let desired=[];              /* 当前视口需要但尚未缓存的瓦片，按距中心排序 */
let failedAt=new Map();      /* key -> 时间戳，失败退避，避免空转重请求 */
let tileEpoch=0;             /* 仅在金字塔层级切换时递增，让后端丢弃过期请求 */
let lastLevel=-1;
let paintRaf=0;
let viewMoving=false;

function tileKeyOf(l,x,y,w,h){return l+'_'+x+'_'+y+'_'+w+'_'+h;}
function cacheTouch(k){
  const e=tileCache.get(k);
  if(e){tileCache.delete(k);tileCache.set(k,e);}
  return e;
}
function cachePut(k,e){
  tileCache.set(k,e);tilePx+=e.px;
  while(tilePx>TILE_BUDGET_PX&&tileCache.size>1){
    const old=tileCache.keys().next().value;
    const oe=tileCache.get(old);
    tileCache.delete(old);tilePx-=oe.px;
    try{oe.bmp.close();}catch(_){}
  }
}
function clearTiles(){
  tileCache.forEach(e=>{try{e.bmp.close();}catch(_){}});
  tileCache.clear();tilePx=0;inflight.clear();desired=[];failedAt.clear();lastLevel=-1;
}
function bestLevelFor(scale){
  if(!slideInfo||!slideInfo.levels)return 0;
  const target=1/Math.max(scale,1e-9);
  let best=0;
  slideInfo.levels.forEach(lv=>{if(lv.downsample<=target)best=lv.level;});
  return best;
}
/* 视图几何：level-0 像素 → 画布设备像素。与 viewport 的 CSS 变换严格同源，
   所以 canvas 里的瓦片与 DOM 里的 ROI 永远对齐。 */
function viewGeom(){
  const stR=stage.getBoundingClientRect(), frR=frame.getBoundingClientRect();
  const dpr=window.devicePixelRatio||1;
  const sf=dispToImg();
  return {
    dpr, w:stR.width, h:stR.height,
    k:(view.zoom/sf)*dpr,
    ox:(frR.left-stR.left+view.panX)*dpr,
    oy:(frR.top-stR.top+view.panY)*dpr
  };
}
function requestPaint(){
  if(paintRaf)return;
  paintRaf=requestAnimationFrame(()=>{paintRaf=0;paint();});
}
/* 旧版这里是 200ms 重置式防抖：平滑缩放每帧都重置定时器，导致整个手势期间
   一块瓦片都不请求，松手后才开始加载。现在改为 rAF 合帧，边动边加载。 */
function scheduleTiles(){requestPaint();}

function paint(){
  const cv=document.getElementById('tileCanvas');
  if(!cv)return;
  const ctx=cv.getContext('2d');
  const g=viewGeom();
  const cw=Math.max(1,Math.round(g.w*g.dpr)), ch=Math.max(1,Math.round(g.h*g.dpr));
  if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch;}
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,cw,ch);
  if(!slideSrc||!imgW||!imgH||!slideImg.naturalWidth){cv.classList.add('hidden');return;}
  cv.classList.remove('hidden');
  const X=x=>g.ox+x*g.k, Y=y=>g.oy+y*g.k;
  const IL=Math.round(X(0)),IT=Math.round(Y(0)),IR=Math.round(X(imgW)),IB=Math.round(Y(imgH));
  /* 图像投影：跟随图像，取代原 <img> 的 box-shadow */
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,.22)';ctx.shadowBlur=24*g.dpr;ctx.shadowOffsetY=8*g.dpr;
  ctx.fillStyle='#fff';ctx.fillRect(IL,IT,Math.max(1,IR-IL),Math.max(1,IB-IT));
  ctx.restore();
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality=viewMoving?'low':'high';
  /* 底图：整片缩略图 / 普通图片本体。瓦片到位后在同一张画布上覆盖，
     不再有跨图层的淡入混色（旧版 flashes 的来源）。
     只绘制与视口相交的那一块源区域——深放大时整张缩略图会被放大到千万像素级
     矩形，逐帧重采样极其昂贵，裁源后每帧只处理一屏的量。 */
  const nw=slideImg.naturalWidth, nh=slideImg.naturalHeight;
  const cl=(v,lo,hi)=>v<lo?lo:(v>hi?hi:v);
  const sx0=cl((0-g.ox)/g.k,0,imgW), sy0=cl((0-g.oy)/g.k,0,imgH);
  const sx1=cl((cw-g.ox)/g.k,0,imgW), sy1=cl((ch-g.oy)/g.k,0,imgH);
  if(sx1>sx0&&sy1>sy0){
    const u0=sx0/imgW*nw, v0=sy0/imgH*nh, u1=sx1/imgW*nw, v1=sy1/imgH*nh;
    const DL=Math.round(X(sx0)),DT=Math.round(Y(sy0)),DR=Math.round(X(sx1)),DB=Math.round(Y(sy1));
    if(DR>DL&&DB>DT)ctx.drawImage(slideImg,u0,v0,u1-u0,v1-v0,DL,DT,DR-DL,DB-DT);
  }
  if(!slideInfo||!slideInfo.levels||!slideInfo.levels.length){desired=[];return;}

  const levels=slideInfo.levels;
  const thumbLv=levels.length-1;
  const level=Math.min(thumbLv,bestLevelFor(g.k));
  /* 粗层 → 细层依次覆盖；同层按行列排序，让 +1px 搭接总被后画的邻居盖住 */
  const groups=new Map();
  tileCache.forEach(e=>{
    if(e.level<level)return;
    let a=groups.get(e.level);
    if(!a){a=[];groups.set(e.level,a);}
    a.push(e);
  });
  [...groups.keys()].sort((a,b)=>b-a).forEach(lv=>{
    const ds=levels[lv]?levels[lv].downsample:1;
    groups.get(lv).sort((a,b)=>(a.ty-b.ty)||(a.tx-b.tx)).forEach(e=>{
      const L=Math.round(X(e.tx*ds)),T=Math.round(Y(e.ty*ds));
      let R=Math.round(X((e.tx+e.tw)*ds)),B=Math.round(Y((e.ty+e.th)*ds));
      if(R<=L||B<=T||R<0||B<0||L>cw||T>ch)return;
      /* 共享边由同一个 level-0 边界坐标取整得到 → 相邻瓦片整数边严格相等。
         再向右/下多铺 1 设备像素，补掉双线性重采样在边界少采一列源像素
         造成的发丝线；这 1px 会被随后绘制的邻居完全覆盖。 */
      R=Math.min(R+1,IR);B=Math.min(B+1,IB);
      if(R<=L||B<=T)return;
      ctx.drawImage(e.bmp,0,0,e.tw,e.th,L,T,R-L,B-T);
    });
  });

  /* 需要的瓦片：固定 1024 网格。手势进行中只补可见区（+6%），停下来再按
     原版的 30% PRELOAD_MARGIN 预加载周边——移动时要解码的像素少了近一半，
     缩放跟手感明显提升，静止后的预取能力不变。 */
  desired=[];
  if(level<thumbLv){
    const ds=levels[level].downsample, LW=levels[level].width, LH=levels[level].height;
    const margin=viewMoving?0.06:0.30;
    const mx=g.w*margin*g.dpr, my=g.h*margin*g.dpr;
    const x0=(-mx-g.ox)/g.k, x1=(g.w*g.dpr+mx-g.ox)/g.k;
    const y0=(-my-g.oy)/g.k, y1=(g.h*g.dpr+my-g.oy)/g.k;
    const tx0=Math.max(0,Math.floor(x0/ds/TS)*TS), ty0=Math.max(0,Math.floor(y0/ds/TS)*TS);
    const tx1=Math.min(LW,Math.ceil(x1/ds/TS)*TS), ty1=Math.min(LH,Math.ceil(y1/ds/TS)*TS);
    const cx=(x0+x1)/2, cy=(y0+y1)/2, now=performance.now();
    for(let ty=ty0;ty<ty1;ty+=TS)for(let tx=tx0;tx<tx1;tx+=TS){
      const tw=Math.min(TS,LW-tx), th=Math.min(TS,LH-ty);
      if(tw<=0||th<=0)continue;
      const k=tileKeyOf(level,tx,ty,tw,th);
      if(cacheTouch(k))continue;
      const f=failedAt.get(k);
      if(f&&now-f<3000)continue;
      const dx=(tx+tw/2)*ds-cx, dy=(ty+th/2)*ds-cy;
      desired.push({k,level,tx,ty,tw,th,d:dx*dx+dy*dy});
    }
    desired.sort((a,b)=>a.d-b.d);
  }
  /* 只有切换金字塔层级才作废在途请求；同层平移的瓦片仍然有用，不作废。 */
  if(level!==lastLevel){
    lastLevel=level;tileEpoch++;
    if(IN_TAURI)invoke('begin_tiles',{gen:tileEpoch}).catch(()=>{});
  }
  pump();
}

/* 并发泵：永远先取离视口中心最近的瓦片。过期请求由后端按 epoch 立即丢弃，
   不会让新瓦片排在一堆废请求后面。 */
function pump(){
  if(!IN_TAURI||!slideInfo||!currentSlidePath)return;
  while(inflight.size<MAX_INFLIGHT&&desired.length){
    const t=desired.shift();
    if(inflight.has(t.k)||tileCache.has(t.k))continue;
    inflight.add(t.k);
    invoke('fetch_tile',{path:currentSlidePath,level:t.level,x:t.tx,y:t.ty,w:t.tw,h:t.th,gen:tileEpoch})
      .then(buf=>{
        inflight.delete(t.k);
        if(!(buf instanceof ArrayBuffer)||buf.byteLength!==t.tw*t.th*4){requestPaint();return;}
        const id=new ImageData(new Uint8ClampedArray(buf),t.tw,t.th);
        return createImageBitmap(id).then(bmp=>{
          failedAt.delete(t.k);
          cachePut(t.k,{bmp,level:t.level,tx:t.tx,ty:t.ty,tw:t.tw,th:t.th,px:t.tw*t.th});
          requestPaint();
        });
      })
      .catch(()=>{inflight.delete(t.k);failedAt.set(t.k,performance.now());requestPaint();})
      .finally(()=>pump());
  }
}
/* 画布按舞台实际尺寸重建：窗口缩放 / 侧栏收放 / 跨屏 DPI 变化都要重绘 */
if(window.ResizeObserver)new ResizeObserver(()=>requestPaint()).observe(stage);
window.addEventListener('resize',()=>requestPaint());
/* 事件轮询：只负责切片打开 / 导出进度 / 错误。
   瓦片不再走这里——fetch_tile 是请求即等待的原始字节通道，没有轮询延迟。 */
setInterval(async()=>{
  if(!IN_TAURI||(!slideSrc&&!pendingOpen&&!exporting))return;
  try{
    const evs=await invoke('poll_decoder',{max:64});
    (evs||[]).forEach(async ev=>{
      if(ev.kind==='opened'&&pendingOpen&&ev.gen===pendingOpen.gen&&ev.thumb_url){
        const p=pendingOpen.path;pendingOpen=null;
        currentSlidePath=p;
        slideInfo=ev.info;slideMeta=ev.meta||null;clearTiles();
        autoCalcFrame();  /* 照抄 Python file_controller：切片打开后按当前倍率/比例 + 新 mpp 重算框尺寸 */
        renderSlideMeta(slideMeta,slideInfo);
        renderAssoc(ev.label_url||null,ev.macro_url||null);
        setSlide(ev.thumb_url,p.split(/[\\/]/).pop());
        toast('切片已打开：'+ev.info.full_w+'×'+ev.info.full_h+(ev.info.mpp?(' · '+ev.info.mpp+' µm/px'):'')+(slideMeta&&slideMeta.format?(' · '+slideMeta.format):''));
      }else if(ev.kind==='export'&&ev.event&&ev.event.FileDone){
        const fd=ev.event.FileDone;
        if(fd.result&&fd.result.Err){exportFailed++;if(!exportFirstErr)exportFirstErr=(fd.name?fd.name+'：':'')+fd.result.Err;}
      }else if(ev.kind==='export'&&ev.event&&ev.event.Progress){
        const pg=ev.event.Progress;
        if(exporting)['btnExport','btnPreviewExport'].forEach(id=>{
          const b=document.getElementById(id);if(!b)return;
          const tn=[...b.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
          if(tn)tn.textContent='导出中 '+pg.current+'/'+pg.total;
        });
      }else if(ev.kind==='export'&&ev.event&&ev.event.Finished){
        const f=ev.event.Finished;
        exporting=false;updateExportButtons();
        if(f.cancelled)toast('导出已取消');
        else if(f.failed&&!f.ok)toast('导出失败：'+(exportFirstErr||'共 '+f.failed+' 个区域失败'),6000);
        else if(f.failed)toast('导出完成：成功 '+f.ok+' · 失败 '+f.failed+'（'+exportFirstErr+'）',6000);
        else toast('导出完成：成功 '+f.ok+' 个 '+exportFmtLabel);
        if(!f.cancelled&&typeof notifyPush==='function')notifyPush('裁剪导出完成：成功 '+f.ok+' 个 '+exportFmtLabel+(f.failed?' · 失败 '+f.failed:''),null);
        exportFailed=0;exportFirstErr='';
      }else if(ev.kind==='error'){
        if(pendingOpen){
          const po=pendingOpen;pendingOpen=null;
          /* Plain TIFF falls back to the image channel when it is not a pyramid. */
          if(po.fallback&&/\.tif{1,2}$/i.test(po.path)){
            try{currentSlidePath='';slideInfo=null;slideMeta=null;clearTiles();clearSlideMeta();
              const u=await invoke('read_file_as_data_url',{path:po.path});
              setSlide(u,po.path.split(/[\\/]/).pop());return;
            }catch(fe){toast('打开失败：'+fe);return}
          }
          toast('打开失败：'+ev.err);
          if(/DecodeSdpcDll|SDPC 解码组件|下载 SDPC|未找到解码组件/i.test(ev.err)){
            const h=document.getElementById('cropDllHelp');if(h)h.hidden=false;
            const t=document.getElementById('cropDllTitle');if(t)t.textContent='SDPC 解码组件未就绪';
            const m=document.getElementById('cropDllMsg');if(m)m.textContent=ev.err;
            const r=document.getElementById('cropDllRetry');if(r)r.hidden=false;
          }
        }
        else toast('解码提示：'+ev.err);
      }
    });
  }catch(e){}
},250);
/* 精确编辑浮层（双击列表项） */
function openRoiEditor(i){
  const r=rois[i];if(!r)return;
  const mask=document.createElement('dialog');mask.className='modal-mask';mask.setAttribute('aria-label','精确编辑 ROI '+(i+1));
  const box=document.createElement('div');box.className='roi-modal';
  box.innerHTML=`<h4>精确编辑 ROI ${i+1}</h4>
    <div class="grid2">
      <div><div class="lbl2">X（图像像素）</div><input id="em_x" type="number" value="${r.x}"></div>
      <div><div class="lbl2">Y（图像像素）</div><input id="em_y" type="number" value="${r.y}"></div>
      <div><div class="lbl2">宽</div><input id="em_w" type="number" value="${r.w}"></div>
      <div><div class="lbl2">高</div><input id="em_h" type="number" value="${r.h}"></div>
    </div>
    <div class="btn-row"><button class="btn pri" id="em_ok">应用</button><button class="btn sec" id="em_cancel">取消</button></div>`;
  mask.appendChild(box);document.body.appendChild(mask);
  const close=()=>{closeLayer(mask);if(mask.parentNode)mask.remove()};
  mask.addEventListener('close',()=>{if(mask.parentNode)mask.remove()});
  const cancel=box.querySelector('#em_cancel');cancel.onclick=close;
  mask.addEventListener('click',e=>{if(e.target===mask)close()});
  const apply=box.querySelector('#em_ok');apply.onclick=()=>{
    snapshot();
    r.x=Math.max(0,parseInt(box.querySelector('#em_x').value)||0);
    r.y=Math.max(0,parseInt(box.querySelector('#em_y').value)||0);
    r.w=Math.max(20,parseInt(box.querySelector('#em_w').value)||r.w);
    r.h=Math.max(20,parseInt(box.querySelector('#em_h').value)||r.h);
    close();drawRois();persistRois();toast('ROI '+(i+1)+' 坐标已更新');
  };
  openLayer(mask);
  setTimeout(()=>box.querySelector('#em_x')?.focus(),20);
}

/* 按路径打开切片：供「打开切片」按钮、拖拽、以及 Dashboard「最近切片」卡片共用。 */
async function openSlidePath(p){
  p=String(p);
  await ensureRoiDb();
  persistRois();  /* flush the previous slide's ROIs before switching */
  rememberSlide(p);
  const low=p.toLowerCase();
  if(low.endsWith('.sdpc')){
    clearTiles();currentSlidePath='';slideInfo=null;clearSlideMeta();
    try{await ensureSdpcDecoder()}catch(e){return}   /* first open downloads the vendor DLL once */
    try{
      /* Async open on the decoder worker: the DLL handle is opened once and
         cached there; metadata + thumbnail arrive via poll_decoder. */
      const gen=await invoke('enqueue_open',{path:p});
      pendingOpen={path:p,gen,fallback:false};
      toast('正在解码 SDPC 切片…');
    }catch(e){toast('打开失败：'+e)}
    return;
  }
  if(WSI_RE.test(low)){
    clearTiles();currentSlidePath='';slideInfo=null;clearSlideMeta();
    try{
      const gen=await invoke('enqueue_open',{path:p});
      pendingOpen={path:p,gen,fallback:/\.tif{1,2}$/.test(low)};
      toast('正在读取切片…');
      return;
    }catch(e){
      if(!/\.tif{1,2}$/.test(low)){toast('打开失败：'+e);return}
      /* a plain TIFF is not a pyramid — fall through to the image channel */
    }
  }
  currentSlidePath=''; slideInfo=null; clearTiles(); clearSlideMeta();
  const url=await invoke('read_file_as_data_url',{path:p});
  setSlide(url,p.split(/[\\/]/).pop());
}
function rememberSlide(p){
  const name=String(p).split(/[\\/]/).pop();
  DB.recentSlides=(DB.recentSlides||[]).filter(s=>s.path!==p);
  DB.recentSlides.unshift({path:String(p),name,at:todayStr()});
  DB.recentSlides=DB.recentSlides.slice(0,8);
  saveDB();
  if(activeLayout().some(w=>w.id==='slides'))renderSlidesCard();
}
document.getElementById('cropDllHelpClose').onclick=()=>{document.getElementById('cropDllHelp').hidden=true;};
document.getElementById('cropDllRetry').onclick=()=>{ensureSdpcDecoder().catch(()=>{})};
document.getElementById('btnOpenSlide').onclick=async()=>{
  if(IN_TAURI){
    try{
      const p=await window.__TAURI__.dialog.open({filters:[
        {name:'切片（全部支持格式）',extensions:['sdpc','svs','ndpi','vms','vmu','mrxs','scn','bif','czi','zvi','dcm','vsi','avs','j2k','j2c','tif','tiff']},
        {name:'SDPC 数字切片',extensions:['sdpc']},
        {name:'Aperio / 通用 TIFF',extensions:['svs','tif','tiff']},
        {name:'Hamamatsu',extensions:['ndpi','vms','vmu']},
        {name:'3DHISTECH MIRAX',extensions:['mrxs']},
        {name:'Zeiss',extensions:['czi','zvi']},
        {name:'DICOM WSI',extensions:['dcm']},
        {name:'ARGOS / Huron / Leica / Ventana',extensions:['avs','scn','bif']},
        {name:'图片',extensions:['png','jpg','jpeg','bmp']}
      ]});
      if(!p)return;
      await openSlidePath(p);
    }catch(e){toast('打开失败：'+e)}
  }else{
    document.getElementById('filePicker').click();
  }
};
const picker=document.createElement('input');picker.type='file';picker.id='filePicker';
picker.accept='.sdpc,.svs,.ndpi,.vms,.vmu,.mrxs,.scn,.bif,.czi,.zvi,.dcm,.vsi,.avs,.j2k,.j2c,.tif,.tiff,.png,.jpg,.jpeg,.bmp';
picker.hidden=true;document.body.appendChild(picker);
async function openDroppedFile(f){
  if(!f)return;
  if(IN_TAURI&&f.path){await openSlidePath(f.path);return}
  if(f.type&&f.type.startsWith('image/')){slideInfo=null;clearSlideMeta();clearTiles();currentSlidePath='';setSlide(URL.createObjectURL(f),f.name);return}
  toast('浏览器预览模式只支持图片；切片文件请在桌面版中拖入');
}
picker.onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)openDroppedFile(f).catch(err=>toast('打开失败：'+err))};
stage.addEventListener('dragover',e=>{e.preventDefault();stage.classList.add('is-drop')});
stage.addEventListener('dragleave',()=>stage.classList.remove('is-drop'));
stage.addEventListener('drop',e=>{e.preventDefault();stage.classList.remove('is-drop');openDroppedFile(e.dataTransfer.files[0]).catch(err=>toast('打开失败：'+err));});

function updateExportButtons(){
  ['btnExport','btnPreviewExport'].forEach(id=>{
    const b=document.getElementById(id);
    const tn=[...b.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
    if(tn)tn.textContent=exporting?'取消导出':(id==='btnExport'?'导出':'预览并导出');
  });
}
function openExportDialog(){
  if(!currentSlidePath){toast('请先打开一个切片再导出');return}
  const dlg=document.getElementById('exportDlg');if(!dlg)return;
  updateDpiNote();
  const row=document.getElementById('expQualityRowWrap');
  if(row)row.hidden=exportFmt!=='jpeg';
  const q=document.getElementById('expQuality');if(q)q.value=exportQuality;
  const qv=document.getElementById('expQualityVal');if(qv)qv.textContent=exportQuality;
  document.querySelectorAll('#expFmt button').forEach(x=>x.classList.toggle('active',x.dataset.fmt===exportFmt));
  openLayer(dlg);
}
function currentSlideLabel(){
  if(currentSlidePath){const p=String(currentSlidePath).split(/[\\/]/);return p[p.length-1]||'当前切片'}
  const el=document.getElementById('cropFile');
  return ((el&&el.textContent)||'当前切片').split(' · ')[0];
}
/* 导出选项独立小窗：主窗/分离的裁剪窗都能打开；窗口只负责选格式、质量和目录，
   结果通过 labkit:export-options 事件回传给发起它的裁剪窗口。 */
let exportWindowBusy=false;
async function openExportWindow(){
  if(!currentSlidePath){toast('请先打开一个切片再导出');return}
  if(exportWindowBusy)return;
  if(!IN_TAURI){openExportDialog();return}
  const WW=window.__TAURI__&&window.__TAURI__.webviewWindow;
  if(!WW||typeof WW.WebviewWindow!=='function'){openExportDialog();return}
  exportWindowBusy=true;
  const owner=(typeof WIN_LABEL==='string')?WIN_LABEL:'main';
  const label='export-options';
  const params=new URLSearchParams({
    format:exportFmt,
    quality:String(exportQuality),
    count:String(rois.length),
    owner,
    theme:document.documentElement.dataset.theme==='dark'?'dark':'light',
    slide:currentSlideLabel(),
    dpiNote:exportDpiSummary(),
  });
  const url=new URL('export.html',location.href).href+'?'+params.toString();
  const fallback=()=>{toast('独立导出窗口打开失败，已回退页内弹窗');openExportDialog()};
  try{
    const old=await WW.WebviewWindow.getByLabel(label);
    if(old){try{await old.destroy()}catch(e){}}
    const win=new WW.WebviewWindow(label,{
      url,title:'导出设置 · LabKit',
      width:380,height:360,
      resizable:false,maximizable:false,minimizable:false,
      visible:true,center:true,decorations:false,alwaysOnTop:true,
      skipTaskbar:true,dragDropEnabled:false,shadow:true,
    });
    win.once('tauri://error',fallback);
  }catch(e){fallback()}finally{exportWindowBusy=false}
}
async function performExport(dirOverride){
  try{
    if(!currentSlidePath){toast('请先打开一个切片再导出');return}
    let dir=typeof dirOverride==='string'&&dirOverride?dirOverride:null;
    if(!dir){
      dir=await window.__TAURI__.dialog.open({directory:true,title:'选择导出文件夹'});
      if(!dir)return;
    }
    const mapped=rois.map(r=>({id:String(Date.now())+Math.random().toString(16).slice(2),slide_path:currentSlidePath,x:r.x,y:r.y,w:r.w,h:r.h,angle:0,created_at:''}));
    /* Tauri v2 的命令参数按 camelCase 匹配（宏默认 rename_all="camelCase"，
       且查表是精确匹配、没有 snake_case 回退）。这里必须写 outputDir/magLabel，
       写成 output_dir 会让命令直接报 "missing required key outputDir"。 */
    await invoke('export_rois',{rois:mapped,outputDir:String(dir),magLabel:mag+'x',format:exportFmt,jpegQuality:exportQuality});
    exporting=true;exportFailed=0;updateExportButtons();
    toast('已提交导出 '+rois.length+' 个区域（'+exportFmtLabel+'）到 '+String(dir).split(/[\\/]/).pop()+'（再点一次可取消）');
  }catch(e){toast('导出失败：'+e)}
}
async function doExport(){
  if(exporting){
    try{await invoke('cancel_export');toast('已请求取消导出…');}catch(e){toast('取消失败：'+e)}
    return;
  }
  if(!rois.length){toast('请先创建至少一个 ROI');return}
  if(!currentSlidePath){toast('请先打开一个切片再导出');return}
  if(IN_TAURI)openExportWindow().catch(e=>{toast('独立导出窗口打开失败，已回退页内弹窗');openExportDialog()});
  else toast('浏览器预览模式：导出 '+rois.length+' 个 ROI（真实导出需 Tauri 切片引擎）');
}
if(IN_TAURI&&window.__TAURI__&&window.__TAURI__.event&&window.__TAURI__.event.listen){
  try{
    const pending=window.__TAURI__.event.listen('labkit:export-options',ev=>{
      const p=(ev&&ev.payload)||{};
      const owner=(typeof WIN_LABEL==='string')?WIN_LABEL:'main';
      if(p.owner&&p.owner!==owner)return;
      if(!currentSlidePath||!rois.length){toast('导出设置所属的裁剪窗口已没有可导出区域');return}
      if(exporting){toast('导出正在进行，请先取消或等待完成');return}
      if(['tiff','png','jpeg'].includes(p.format)){
        exportFmt=p.format;
        exportFmtLabel=exportFmt==='jpeg'?'JPEG':(exportFmt==='png'?'PNG':'TIFF');
      }
      const quality=parseInt(p.quality,10);
      if(Number.isFinite(quality))exportQuality=Math.min(100,Math.max(60,quality));
      performExport(typeof p.outputDir==='string'?p.outputDir:'');
    });
    if(pending&&typeof pending.catch==='function')pending.catch(()=>{});
  }catch(e){}
}
document.getElementById('btnExport').onclick=doExport;
document.getElementById('btnPreviewExport').onclick=doExport;
document.getElementById('expCancel').onclick=()=>document.getElementById('exportDlg').close();
document.getElementById('expOk').onclick=()=>{document.getElementById('exportDlg').close();performExport();};
document.querySelectorAll('#expFmt button').forEach(b=>b.onclick=()=>{
  exportFmt=b.dataset.fmt||'tiff';
  exportFmtLabel=exportFmt==='jpeg'?'JPEG':(exportFmt==='png'?'PNG':'TIFF');
  document.querySelectorAll('#expFmt button').forEach(x=>x.classList.toggle('active',x===b));
  const row=document.getElementById('expQualityRowWrap');if(row)row.hidden=exportFmt!=='jpeg';
});
document.getElementById('expQuality').oninput=e=>{
  exportQuality=parseInt(e.target.value)||95;
  document.getElementById('expQualityVal').textContent=exportQuality;
};

