// C4 Protocol 多步计时器 —— easytimer.js（MIT，见 NOTICE.md）+ 薄步骤器
(function () {
  window.LabKitTools['timer'] = function (host) {
    host.innerHTML = `
      <div class="tool-section">
        <h3>实验流程步骤</h3>
        <div class="hint">每步名称 + 时长；开始后自动倒计时并推进，到点提示音 + 弹窗提醒。可暂停/跳步/重置。</div>
        <div id="tm-steps"></div>
        <div class="trow">
          <label class="tfield w-md"><span>步骤名</span><input type="text" id="tm-name" value="孵育"></label>
          <label class="tfield w-sm"><span>时长</span><input type="number" id="tm-dur" value="10" min="1"></label>
          <label class="tfield w-sm"><span>单位</span><select id="tm-unit"><option value="60" selected>分钟</option><option value="1">秒</option><option value="3600">小时</option></select></label>
          <button class="tbtn sec" id="tm-add">+ 添加步骤</button>
          <button class="tbtn sec" id="tm-preset">载入示例（PCR）</button>
        </div>
      </div>
      <div class="tool-section">
        <h3>运行</h3>
        <div class="tm-run">
          <div class="timer-display" id="tm-clock" role="timer">00:00:00</div>
          <div class="tm-run-info">
            <div class="tm-current" id="tm-current">未开始</div>
            <div class="tnote" id="tm-progress" aria-live="polite"></div>
          </div>
        </div>
        <div class="trow">
          <button class="tbtn pri" id="tm-start">开始</button>
          <button class="tbtn sec" id="tm-pause">暂停</button>
          <button class="tbtn sec" id="tm-skip">跳过本步</button>
          <button class="tbtn sec" id="tm-reset">重置</button>
          <label class="tcheck"><input type="checkbox" id="tm-sound" checked> 到点提示音</label>
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
          <b class="tm-idx">${i + 1}</b><span class="tm-name">${esc(s.name)}</span>
          <span class="tnote flat">${s.seconds >= 3600 ? (s.seconds / 3600) + ' h' : s.seconds >= 60 ? (s.seconds / 60) + ' min' : s.seconds > 0 ? s.seconds + ' s' : '手动'}</span>
          <button class="tbtn sec xs" data-del="${i}" aria-label="删除步骤 ${i + 1}">删除</button>
        </div>`).join('') || '<div class="tempty">暂无步骤</div>';
      $('tm-steps').querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (running) return toast('运行中不可修改'); steps.splice(+b.dataset.del, 1); renderSteps(); });
    }
    function fmt(sec) {
      const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
      return [h, m, s].map(x => String(x).padStart(2, '0')).join(':');
    }
    /* 复用一个 AudioContext：每次到点都 new 一个且不 close，连续跑几步就会顶到浏览器的
       context 上限，提示音从此失效（且不可恢复）。 */
    let audioCtx = null;
    function beep() {
      if (!$('tm-sound').checked) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const t0 = audioCtx.currentTime;
        [[880, 0, 0.35], [1174, 0.4, 0.5]].forEach(([freq, delay, dur]) => {
          const o = audioCtx.createOscillator(), g = audioCtx.createGain();
          o.frequency.value = freq; g.gain.value = 0.15;
          o.connect(g); g.connect(audioCtx.destination);
          o.start(t0 + delay); o.stop(t0 + delay + dur);
        });
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
      /* 0 秒步骤是「手动标记步」（如 35 轮循环），不建倒计时，等用户点跳过 */
      if (!s.seconds) {
        if (timer) { timer.stop(); timer = null; }
        $('tm-clock').textContent = '00:00:00';
        $('tm-progress').textContent = '标记步：点「跳过本步」继续';
        addLog(`标记步：${s.name}`);
        renderSteps(); return;
      }
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
      /* 保留 0 秒的「循环 35×」标记步：原先被 filter(seconds>0) 过滤，示例流程本身少一步 */
      steps = [
        { name: '预变性 95°C', seconds: 180 }, { name: '变性 95°C', seconds: 15 },
        { name: '退火 58°C', seconds: 30 }, { name: '延伸 72°C', seconds: 30 },
        { name: '循环 35×（手动重复变性→延伸）', seconds: 0 }, { name: '终延伸 72°C', seconds: 300 }
      ];
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
    /* 统一壳重置：计时器状态全在内存里，停表 + 清步骤即可 */
    host.__lkReset = () => {
      if (timer) { try { timer.stop(); } catch (e) { /* 未启动 */ } }
      timer = null; running = false; idx = -1; steps = []; log = [];
      return true;
    };
    renderSteps();
  };
})();