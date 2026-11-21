// C6 试剂/仪器台账 + 效期提醒 —— 数据模型参照 InvenTree (MIT) part/stock/location
// 与现有 labres 页同源（DB.reagents），编辑即同步 Dashboard/提醒；CSV 兼容 InvenTree 列；
// 可选连接已有 InvenTree 服务器 REST API（不内嵌其代码）；效期/低库存走 tauri-plugin-notification。
(function () {
  window.LabKitTools = window.LabKitTools || {};
  const W = window;
  const CATS = ['试剂', '耗材', '抗体', '试剂盒', '培养基', '其他'];

  function days(exp) {
    if (!exp) return null;
    const d = new Date(exp);
    if (isNaN(d)) return null;
    return Math.ceil((d - new Date().setHours(0, 0, 0, 0)) / 86400000);
  }
  function status(r) {
    const d = days(r.exp);
    if (d !== null && d < 0) return { k: 'expired', t: '已过期', c: '#FF453A' };
    if (d !== null && d <= 30) return { k: 'expiring', t: `近效期 ${d}天`, c: '#FF9F0A' };
    if (r.quantity != null && r.min_stock != null && Number(r.quantity) <= Number(r.min_stock)) return { k: 'low', t: '低库存', c: '#AF52DE' };
    return { k: 'ok', t: '正常', c: '#30D158' };
  }
  function persist() {
    if (typeof saveDB === 'function') saveDB();
    if (typeof refreshHome === 'function') refreshHome();
    if (typeof renderLab === 'function') renderLab();
  }

  window.LabKitTools['inventory'] = function (host) {
    const rows = () => DB.reagents || (DB.reagents = []);
    host.innerHTML = `
      <div class="tool-section">
        <div class="trow">
          <input id="ivSearch" type="text" placeholder="搜索名称/货号/批次/位置…" style="flex:1;min-width:160px">
          <label class="tfield">状态<select id="ivStatus"><option value="">全部</option><option value="expired">已过期</option><option value="expiring">近效期≤30天</option><option value="low">低库存</option></select></label>
          <button class="tbtn pri" id="ivAdd">新增条目</button>
          <button class="tbtn sec" id="ivNotify">效期扫描提醒</button>
        </div>
        <div class="trow" style="margin-top:6px">
          <button class="tbtn sec" id="ivCsvOut">导出 CSV（InvenTree 兼容）</button>
          <label class="tbtn sec" style="cursor:pointer">导入 CSV<input id="ivCsvIn" type="file" accept=".csv" style="display:none"></label>
          <button class="tbtn sec" id="ivApiToggle">InvenTree API 模式 ▾</button>
        </div>
        <div id="ivApi" style="display:none;margin-top:8px;padding:8px;border:1px dashed #ccc;border-radius:8px">
          <div class="trow">
            <input id="ivApiUrl" type="text" placeholder="https://inventree.example.org" style="flex:1">
            <input id="ivApiToken" type="password" placeholder="API Token" class="iv-token">
            <button class="tbtn sec" id="ivApiTest">测试连接</button>
            <button class="tbtn sec" id="ivApiPull">拉取 parts 入库</button>
          </div>
          <div class="tnote">仅调用已有 InvenTree 服务器的 REST API（/api/part/），不内嵌其代码。Token 仅存本机 localStorage。</div>
        </div>
      </div>
      <div class="tool-section"><div id="ivTable"></div></div>
      <div class="tool-section"><div id="ivLog" class="tnote"></div></div>`;
    const $ = id => host.querySelector('#' + id);

    function filtered() {
      const q = $('ivSearch').value.trim().toLowerCase();
      const st = $('ivStatus').value;
      return rows().map((r, i) => ({ r, i })).filter(({ r }) => {
        if (q && ![r.name, r.no, r.lot, r.loc, r.category].some(v => (v || '').toLowerCase().includes(q))) return false;
        if (st && status(r).k !== st) return false;
        return true;
      });
    }
    function render() {
      const list = filtered();
      $('ivTable').innerHTML = list.length ? `<table class="ttable"><tr><th>名称</th><th>货号</th><th>批次</th><th>类别</th><th>位置</th><th>存量</th><th>最低</th><th>效期</th><th>状态</th><th>操作</th></tr>` +
        list.map(({ r, i }) => {
          const s = status(r);
          const d = days(r.exp);
          return `<tr><td><b>${esc(r.name)}</b>${r.spec ? `<div class="tnote">${esc(r.spec)}</div>` : ''}</td>
            <td class="tmono">${esc(r.no || '—')}</td><td class="tmono">${esc(r.lot || '—')}</td><td>${esc(r.category || '—')}</td>
            <td>${esc(r.loc || '—')}</td><td>${r.quantity != null ? esc(String(r.quantity)) + esc(r.unit || '') : esc(r.left || '—')}</td>
            <td>${r.min_stock != null ? esc(String(r.min_stock)) : '—'}</td>
            <td>${esc(r.exp || '—')}${d !== null ? `<div class="tnote">${d < 0 ? '已过期' : d + ' 天'}</div>` : ''}</td>
            <td style="color:${s.c}">${s.t}</td>
            <td style="white-space:nowrap">
              <button class="tbtn sec" data-edit="${i}" style="padding:1px 6px">编辑</button>
              <button class="tbtn sec" data-move="${i}" style="padding:1px 6px">出入库</button>
              <button class="tbtn sec" data-del="${i}" style="padding:1px 6px">×</button>
            </td></tr>`;
        }).join('') + '</table>' : '<div class="tnote">无匹配条目。</div>';
      host.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => editModal(rows()[Number(b.dataset.edit)]));
      host.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
        const i = Number(b.dataset.del);
        if (confirm(`删除「${rows()[i].name}」？`)) { rows().splice(i, 1); persist(); render(); }
      });
      host.querySelectorAll('[data-move]').forEach(b => b.onclick = () => moveModal(rows()[Number(b.dataset.move)]));
      const n = rows().length;
      const bad = rows().filter(r => status(r).k !== 'ok').length;
      $('ivLog').textContent = `共 ${n} 条 · ${bad} 条需关注。数据与「仪器/试剂」页、首页卡片同源同步。`;
    }
    function fields(r) {
      return [
        { k: 'name', label: '名称', req: 1, value: r ? r.name : '' },
        { k: 'no', label: '货号 / IPN', value: r ? r.no : '' },
        { k: 'lot', label: '批号', value: r ? r.lot : '' },
        { k: 'category', label: '类别', type: 'select', options: CATS, value: r ? (r.category || '试剂') : '试剂' },
        { k: 'spec', label: '规格', value: r ? r.spec : '', ph: '如 500mL / 100T' },
        { k: 'loc', label: '位置', value: r ? r.loc : '', ph: '试剂柜2 / -20°C' },
        { k: 'quantity', label: '存量', type: 'number', nullable: 1, value: r && r.quantity != null ? r.quantity : '' },
        { k: 'unit', label: '单位', value: r ? r.unit : '', ph: 'mL / 盒 / %' },
        { k: 'min_stock', label: '最低库存', type: 'number', nullable: 1, value: r && r.min_stock != null ? r.min_stock : '' },
        { k: 'exp', label: '效期', type: 'date', value: r ? r.exp : '' },
        { k: 'open', label: '开封日期', type: 'date', value: r ? r.open : '' },
        { k: 'supplier', label: '供应商', value: r ? r.supplier : '' },
        { k: 'notes', label: '备注', type: 'textarea', full: 1, value: r ? r.notes : '' },
      ];
    }
    function editModal(r) {
      formModal(r ? '编辑条目' : '新增条目', fields(r), out => {
        const target = r || {};
        Object.assign(target, out);
        if (!r) { target.id = 'r' + Date.now(); target.movements = []; rows().push(target); }
        reagentSyncLeft(target);
        persist(); render();
        toast('已保存');
      });
    }
    function moveModal(r) {
      formModal(`出入库：${r.name}`, [
        { k: 'delta', label: '变动量（负=出库）', type: 'number', req: 1, value: '' },
        { k: 'note', label: '用途/备注', value: '', ph: '如 WB 实验' },
      ], out => {
        const q = Number(r.quantity || 0) + Number(out.delta);
        r.quantity = Math.max(0, q);
        (r.movements = r.movements || []).push({ date: new Date().toISOString().slice(0, 10), delta: Number(out.delta), note: out.note });
        reagentSyncLeft(r);
        persist(); render();
        toast(`存量更新为 ${r.quantity}${r.unit || ''}`);
      }, '记账');
    }
    $('ivAdd').onclick = () => editModal(null);
    $('ivSearch').oninput = render;
    $('ivStatus').onchange = render;

    // ---- 通知 ----
    async function notifyScan(manual) {
      const today = new Date().toISOString().slice(0, 10);
      if (!manual && Store.get('tool:inv-notify', null) === today) return;
      const expired = rows().filter(r => status(r).k === 'expired');
      const expiring = rows().filter(r => status(r).k === 'expiring');
      const low = rows().filter(r => status(r).k === 'low');
      if (!expired.length && !expiring.length && !low.length) { if (manual) toast('全部正常，无需提醒'); return; }
      const body = [
        expired.length ? `已过期 ${expired.length}：${expired.map(r => r.name).join('、')}` : '',
        expiring.length ? `近效期 ${expiring.length}：${expiring.map(r => r.name).join('、')}` : '',
        low.length ? `低库存 ${low.length}：${low.map(r => r.name).join('、')}` : '',
      ].filter(Boolean).join('\n');
      if (W.__TAURI__) {
        try {
          await W.__TAURI__.core.invoke('plugin:notification|notify', { title: 'LabKit 试剂台账提醒', body });
          toast('系统通知已发送');
        } catch (e) { toast('通知失败：' + e); }
      } else {
        toast('浏览器模式：' + body.replace(/\n/g, '；'));
      }
      Store.set('tool:inv-notify', today);
      if (manual) $('ivLog').innerHTML = `<div class="twarn" style="white-space:pre-wrap">${esc(body)}</div>`;
    }
    $('ivNotify').onclick = () => notifyScan(true);

    // ---- CSV（InvenTree 兼容列）----
    const COLS = ['name', 'no', 'lot', 'category', 'spec', 'loc', 'quantity', 'unit', 'min_stock', 'exp', 'open', 'supplier', 'notes'];
    $('ivCsvOut').onclick = () => {
      const cell = c => { const s = String(c == null ? '' : c); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
      const csv = [COLS.join(',')].concat(rows().map(r => COLS.map(c => cell(r[c])).join(','))).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
      a.download = 'inventory_inventree.csv'; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    };
    $('ivCsvIn').onchange = async ev => {
      const f = ev.target.files[0]; if (!f) return;
      const text = await f.text();
      const res = Papa.parse(text.replace(/^\ufeff/, '').trim(), { header: true, skipEmptyLines: true });
      let added = 0, updated = 0;
      res.data.forEach(row => {
        if (!row.name) return;
        const hit = rows().find(r => r.name === row.name && (r.lot || '') === (row.lot || row.batch || ''));
        const patch = {
          name: row.name, no: row.no || row.IPN || '', lot: row.lot || row.batch || '',
          category: row.category || '', spec: row.spec || row.description || '', loc: row.loc || row.location || '',
          quantity: row.quantity !== '' && row.quantity != null ? Number(row.quantity) : undefined,
          unit: row.unit || row.units || '', min_stock: row.min_stock != null && row.min_stock !== '' ? Number(row.min_stock) : (row.minimum_stock != null && row.minimum_stock !== '' ? Number(row.minimum_stock) : undefined),
          exp: row.exp || row.expiry_date || '', open: row.open || '', supplier: row.supplier || '', notes: row.notes || '',
        };
        if (hit) { Object.assign(hit, patch); reagentSyncLeft(hit); updated++; }
        else { patch.id = 'r' + Date.now() + '_' + added; patch.movements = []; reagentSyncLeft(patch); rows().push(patch); added++; }
      });
      persist(); render();
      ev.target.value = '';
      toast(`导入完成：新增 ${added}，更新 ${updated}`);
    };

    // ---- InvenTree API（可选）----
    $('ivApiToggle').onclick = () => {
      const el = $('ivApi');
      el.style.display = el.style.display === 'none' ? '' : 'none';
      try {
        const cfg = JSON.parse(Store.get('tool:inv-api', null) || '{}');
        $('ivApiUrl').value = cfg.url || ''; $('ivApiToken').value = cfg.token || '';
      } catch (e) { /* 忽略 */ }
    };
    function apiCfg() {
      const cfg = { url: $('ivApiUrl').value.trim().replace(/\/$/, ''), token: $('ivApiToken').value.trim() };
      Store.set('tool:inv-api', JSON.stringify(cfg));
      return cfg;
    }
    /* 桌面 CSP 的 connect-src 只放行 'self' 与 ipc:，前端直接 fetch 外部服务器会被拦死，
       所以桌面走 Rust 只读 IPC（inventree_get）；浏览器演示无此限制，仍用 fetch。 */
    async function invApiGet(cfg, path) {
      if (IN_TAURI) {
        const r = await invoke('inventree_get', { base: cfg.url, path, token: cfg.token });
        return { ok: r.status >= 200 && r.status < 300, status: r.status, json: () => JSON.parse(r.body) };
      }
      const r = await fetch(cfg.url + path, { headers: { Authorization: 'Token ' + cfg.token } });
      return { ok: r.ok, status: r.status, json: () => r.json() };
    }
    $('ivApiTest').onclick = async () => {
      const cfg = apiCfg();
      if (!cfg.url) { toast('填写服务器地址'); return; }
      try {
        const r = await invApiGet(cfg, '/api/');
        toast(r.ok ? '连接成功（InvenTree API 可达）' : '连接失败：HTTP ' + r.status);
      } catch (e) { toast('连接失败：' + e.message); }
    };
    $('ivApiPull').onclick = async () => {
      const cfg = apiCfg();
      if (!cfg.url || !cfg.token) { toast('填写地址与 Token'); return; }
      try {
        const r = await invApiGet(cfg, '/api/part/?limit=500');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();
        const parts = data.results || data || [];
        let n = 0;
        parts.forEach(p => {
          if (!p.name) return;
          const hit = rows().find(x => x.name === p.name);
          const patch = { name: p.name, no: p.IPN || '', notes: p.description || '', min_stock: p.minimum_stock != null ? Number(p.minimum_stock) : undefined, category: (p.category && p.category.name) || '' };
          if (hit) Object.assign(hit, patch);
          else { patch.id = 'r' + Date.now() + '_' + n; patch.movements = []; rows().push(patch); }
          n++;
        });
        persist(); render();
        toast(`已拉取 ${n} 个 part`);
      } catch (e) { toast('拉取失败：' + e.message); }
    };

    render();
    notifyScan(false);
  };
})();