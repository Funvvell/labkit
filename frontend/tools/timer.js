// C4 Protocol 多步计时器 —— easytimer.js（MIT，见 NOTICE.md）+ 薄步骤器
(function () {
  window.LabKitTools['timer'] = function (host) {
    host.innerHTML = `
      <div class="tool-section">
        <h3>实验流程步骤</h3>
        <div class="hint">每步名称 + 时长；开始后自动倒计时并推进，到点提示音 + 弹窗提醒。可暂停/跳步/重置。</div>
        <div id="tm-steps"></div>
        <div class="trow">
          <div class="tfield"><label>步骤名</label><input type="text" id="tm-name" value="孵育" style="width:140px"></div>
          <div class="tfield"><label>时长</label><input type="number" id="tm-dur" value="10" min="1"></div>
          <div class="tfield"><label>单位</label><select id="tm-unit"><option value="60" selected>分钟</option><option value="1">秒</option><option value="3600">小时</option></select></div>
          <button class="tbtn sec" id="tm-add">+ 添加步骤</button>
          <button class="tbtn sec" id="tm-preset">载入示例（PCR）</button>
        </div>
      </div>
      <div class="tool-section">
        <h3>运行</h3>
        <div class="trow" style="align-items:center">
          <div class="timer-display" id="tm-clock">00:00:00</div>
          <div style="flex:1">
            <div id="tm-current" style="font-size:14px;font-weight:600">未开始</div>
            <div class="tnote" id="tm-progress"></div>
          </div>
        </div>
        <div class="trow">
          <button class="tbtn pri" id="tm-start">开始</button>
          <button class="tbtn sec" id="tm-pause">暂停</button>
          <button class="tbtn sec" id="tm-skip">跳过本步</button>
          <button class="tbtn sec" id="tm-reset">重置</button>
          <label style="font-size:12.5px;display:flex;gap:6px;align-items:center"><input type="checkbox" id="tm-sound" checked> 到点提示音</label>
        </div>
        <div class="tout" id="tm-log"></div>
        <div class="trow"><button class="tbtn sec" id="tm-copylog">复制运行记录</button></div>
      </div>`;
    const $ = id => host.querySelector('#' + id);
    let steps = [];
    let idx = -1, timer = null, running = false, log = [];
    function renderSteps() {
      $('tm-steps').innerHTML = steps.map((s, i) =>
        `<div class="timer-step ${i === idx ? 'active' : ''} ${i < idx ? 'done' : ''}">
          <b style="min-width:22px">${i + 1}</b><span style="flex:1">${esc(s.name)}</span>
          <span class="tnote" style="margin:0">${s.seconds >= 3600 ? (s.seconds / 3600) + ' h' : s.seconds >= 60 ? (s.seconds / 60) + ' min' : s.seconds + ' s'}</span>
          <button class="tbtn sec" data-del="${i}" style="padding:3px 9px;font-size:11px">删除</button>
        </div>`).join('') || '<div class="tnote">暂无步骤</div>';
      $('tm-steps').querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (running) return toast('运行中不可修改'); steps.splice(+b.dataset.del, 1); renderSteps(); });
    }
    function fmt(sec) {
      const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
      return [h, m, s].map(x => String(x).padStart(2, '0')).join(':');
    }
    function beep() {
      if (!$('tm-sound').checked) return;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880; g.gain.value = 0.15;
        o.start(); o.stop(ctx.currentTime + 0.35);
        setTimeout(() => { const o2 = ctx.createOscillator(); o2.connect(g); o2.frequency.value = 1174; o2.start(); o2.stop(ctx.currentTime + 0.5); }, 400);
      } catch (e) { /* 无音频环境忽略 */ }
    }
    function stamp() { return new Date().toLocaleTimeString('zh-CN', { hour12: false }); }
    function addLog(msg) { log.push(`[${stamp()}] ${msg}`); $('tm-log').innerHTML = '<div class="tmono">' + log.map(esc).join('\n') + '</div>'; }
    function startStep(i) {
      if (i >= steps.length) {
        running = false; idx = steps.length;
        $('tm-current').textContent = '全部完成';
        $('tm-clock').textContent = '00:00:00';
        addLog('流程完成'); beep(); toast('Protocol 全部步骤完成');
        renderSteps(); return;
      }
      idx = i;
      const s = steps[i];
      $('tm-current').textContent = `第 ${i + 1}/${steps.length} 步：${s.name}`;
      if (timer) timer.stop();
      timer = new easytimer.Timer();
      timer.start({ countdown: true, startValues: { seconds: s.seconds } });
      timer.addEventListener('secondsUpdated', () => {
        $('tm-clock').textContent = timer.getTimeValues().toString();
        $('tm-progress').textContent = `本步剩余 ${timer.getTimeValues().toString()} · 总进度 ${i}/${steps.length}`;
      });
      timer.addEventListener('targetAchieved', () => {
        addLog(`完成：${s.name}（${s.seconds}s）`);
        beep(); toast(`步骤完成：${s.name}`);
        startStep(i + 1);
      });
      $('tm-clock').textContent = fmt(s.seconds);
      renderSteps();
    }
    $('tm-add').onclick = () => {
      const name = $('tm-name').value.trim() || '步骤';
      const sec = Math.max(1, Math.round(parseFloat($('tm-dur').value) * parseFloat($('tm-unit').value)));
      steps.push({ name, seconds: sec }); renderSteps();
    };
    host.__lkExample = () => $('tm-preset').click();
    $('tm-preset').onclick = () => {
      steps = [
        { name: '预变性 95°C', seconds: 180 }, { name: '变性 95°C', seconds: 15 },
        { name: '退火 58°C', seconds: 30 }, { name: '延伸 72°C', seconds: 30 },
        { name: '循环 35×（手动重复变性→延伸）', seconds: 0 }, { name: '终延伸 72°C', seconds: 300 }
      ].filter(s => s.seconds > 0);
      renderSteps();
    };
    $('tm-start').onclick = () => {
      if (!steps.length) return toast('先添加步骤');
      if (running && timer) { timer.start(); return; }
      running = true; log = []; addLog('流程开始');
      startStep(idx >= 0 && idx < steps.length ? idx : 0);
    };
    $('tm-pause').onclick = () => { if (timer && running) { timer.pause(); addLog('暂停'); } };
    $('tm-skip').onclick = () => { if (running && idx >= 0) { addLog(`跳过：${steps[idx].name}`); startStep(idx + 1); } };
    $('tm-reset').onclick = () => { if (timer) timer.stop(); running = false; idx = -1; $('tm-clock').textContent = '00:00:00'; $('tm-current').textContent = '未开始'; $('tm-progress').textContent = ''; renderSteps(); };
    $('tm-copylog').onclick = () => { if (!log.length) return toast('无记录'); navigator.clipboard.writeText(log.join('\n')).then(() => toast('已复制')); };
    renderSteps();
  };
})();