// D5 报告规范清单 —— PRISMA 2020 (CC-BY 4.0) / STROBE / CONSORT 2010 / MIQE  essentials
// 出处：Page MJ et al. BMJ 2021;372:n71 (PRISMA 2020, CC-BY 4.0)；von Elm E et al. Lancet 2007;370:1453 (STROBE)；
//       Schulz KF et al. BMJ 2010;340:c332 (CONSORT 2010)；Bustin SA et al. Clin Chem 2009;55:611 (MIQE)。
// PRISMA 条目依 BMJ 原文 Table 1 结构（27 项含子项）；MIQE 为 essentials 精选子集（非全 85 条）。
(function () {
  const CHECKLISTS = {
    prisma: {
      name: 'PRISMA 2020（系统综述/Meta）', cite: 'Page MJ, et al. BMJ 2021;372:n71. CC-BY 4.0',
      items: [
        ['标题', '1', '标题中明确标识本报告为系统综述'],
        ['摘要', '2', '按 PRISMA 2020 for Abstracts 清单报告摘要'],
        ['引言', '3', '在现有知识背景下阐述综述的 rationale'],
        ['引言', '4', '明确陈述研究问题/目标（参照 PICOS 要素）'],
        ['方法', '5', '说明纳入/排除标准，以及如何分组进行合成'],
        ['方法', '6', '描述所有信息来源（数据库/注册库/网站/机构/参考文献追溯），注明最后检索日期'],
        ['方法', '7', '呈现所有数据库/注册库/网站的完整检索策略（含过滤器与限制）'],
        ['方法', '8', '说明研究筛选流程：几人筛、是否独立、自动化工具细节'],
        ['方法', '9', '说明数据提取流程：几人提、是否独立、自动化工具细节'],
        ['方法', '10a', '列出并定义所有 sought 结局；说明是否寻求该结局域全部兼容结果及子集选择方法'],
        ['方法', '10b', '列出并定义所有其他变量（PICOS、资助、假设等）'],
        ['方法', '11', '描述纳入研究偏倚风险评估的方法/工具（人数、独立性、自动化）'],
        ['方法', '12', '说明每个结局使用的效应量（RR/OR/MD/HR 等）'],
        ['方法', '13a', '描述决定哪些研究纳入每次合成的流程（如制表）'],
        ['方法', '13b', '描述合成前的数据准备（缺失数据处理、指标转换）'],
        ['方法', '13c', '描述单个研究与合成结果的制表/可视化方法'],
        ['方法', '13d', '描述合成方法（Meta 分析模型、异质性处理、软件）'],
        ['方法', '13e', '描述探索异质性来源的方法（亚组、Meta 回归）'],
        ['方法', '13f', '描述评估合成结果稳健性的敏感性分析'],
        ['方法', '14', '描述评估缺失结果所致报告偏倚风险的方法（发表偏倚/选择性报告）'],
        ['方法', '15', '描述评估证据体确定性/置信度的方法（如 GRADE）'],
        ['结果', '16a', '描述检索与筛选流程结果（建议流程图）'],
        ['结果', '16b', '引用看似符合纳入标准但被排除的研究并说明理由'],
        ['结果', '17', '引用每项纳入研究并呈现其特征'],
        ['结果', '18', '呈现每项纳入研究的偏倚风险评估'],
        ['结果', '19', '呈现所有结局：各组汇总统计量 + 效应估计与精度（建议森林图）'],
        ['结果', '20a', '简述贡献于合成的研究的特征与偏倚风险'],
        ['结果', '20b', '呈现所有统计合成结果（森林图、异质性指标）'],
        ['结果', '20c', '呈现异质性来源调查的结果'],
        ['结果', '20d', '呈现敏感性分析结果'],
        ['结果', '21', '呈现每次合成中缺失结果所致报告偏倚风险评估'],
        ['结果', '22', '呈现每个结局的证据确定性评估'],
        ['讨论', '23a', '结合其他证据解释结果'],
        ['讨论', '23b', '讨论纳入证据的局限性'],
        ['讨论', '23c', '讨论综述流程本身的局限性'],
        ['讨论', '23d', '讨论对实践/政策/未来研究的启示'],
        ['其他', '24a', '提供注册号与注册库名称，或声明未注册'],
        ['其他', '24b', '说明方案获取途径，或声明未制定方案'],
        ['其他', '24c', '描述并解释对注册/方案的修订'],
        ['其他', '25', '描述资金/非资金支持来源及资助者角色'],
        ['其他', '26', '声明综述作者的利益冲突'],
        ['其他', '27', '报告数据提取表/提取数据/分析代码/其他材料的公开可获取性及位置'],
      ]
    },
    strobe: {
      name: 'STROBE（观察性研究：队列/病例对照/横断面）', cite: 'von Elm E, et al. Lancet 2007;370:1453-1457',
      items: [
        ['标题摘要', '1a', '标题或摘要中指明研究设计（队列/病例对照/横断面）'],
        ['标题摘要', '1b', '摘要对做了什么、发现什么给出平衡概述'],
        ['引言', '2', '解释科学背景与立题依据'],
        ['引言', '3', '陈述具体目标，包括预先设定的假设'],
        ['方法', '4', '在论文前部呈现研究设计的关键要素'],
        ['方法', '5', '描述场所、地点与关键日期（招募/暴露/随访/数据收集）'],
        ['方法', '6a', '合格标准、研究对象来源与选择方法（队列含随访方法；病例对照含病例确认与对照选择依据）'],
        ['方法', '6b', '匹配标准与暴露/非暴露（或病例/对照）人数'],
        ['方法', '7', '明确定义所有结局、暴露、预测因子、潜在混杂与效应修饰因子'],
        ['方法', '8', '每个变量的数据来源与测量方法（组间可比性）'],
        ['方法', '9', '描述控制潜在偏倚来源的努力'],
        ['方法', '10', '解释样本量的确定依据'],
        ['方法', '11', '解释定量变量的处理方式（分组切点及理由）'],
        ['方法', '12a', '描述所有统计方法（含控制混杂的方法）'],
        ['方法', '12b', '描述亚组与交互作用分析方法'],
        ['方法', '12c', '解释缺失数据的处理'],
        ['方法', '12d', '队列：失访处理；病例对照：匹配处理；横断面：考虑抽样策略的分析方法'],
        ['方法', '12e', '描述敏感性分析'],
        ['结果', '13a', '报告各阶段人数（潜在合格→确认合格→纳入→完成随访→分析）'],
        ['结果', '13b', '给出各阶段未参与的原因'],
        ['结果', '13c', '考虑使用流程图'],
        ['结果', '14a', '给出研究对象特征（人口学/临床/社会）及暴露与潜在混杂信息'],
        ['结果', '14b', '标明每个变量缺失数据的人数'],
        ['结果', '14c', '队列：总结随访时间（平均/中位/总计）'],
        ['结果', '15', '报告结局事件数或随时间的汇总测量（病例对照报告暴露分布；横断面报告结局汇总）'],
        ['结果', '16a', '给出未调整估计及（如适用）调整混杂后的估计与精度（95%CI），说明调整了哪些混杂及理由'],
        ['结果', '16b', '连续变量分组时报告分组边界'],
        ['结果', '16c', '如相关，将相对风险转换为有意义时段的绝对风险'],
        ['结果', '17', '报告其他分析（亚组/交互/敏感性）'],
        ['讨论', '18', '参照研究目标总结关键结果'],
        ['讨论', '19', '讨论局限性（偏倚/不精确的来源、方向与大小）'],
        ['讨论', '20', '结合目标、局限、分析多重性与同类研究给出审慎解释'],
        ['讨论', '21', '讨论外推性（外部真实性）'],
        ['其他', '22', '给出资金来源与资助者角色'],
      ]
    },
    consort: {
      name: 'CONSORT 2010（随机对照试验）', cite: 'Schulz KF, et al. BMJ 2010;340:c332',
      items: [
        ['标题摘要', '1a', '标题中标识为随机试验'],
        ['标题摘要', '1b', '结构化摘要：设计/方法/结果/结论'],
        ['引言', '2a', '科学背景与立题依据'],
        ['引言', '2b', '具体目标或假设'],
        ['方法', '3a', '试验设计描述（平行/析因等）含分配比'],
        ['方法', '3b', '试验开始后的重要方法变更（如合格标准）及理由'],
        ['方法', '4a', '受试者合格标准'],
        ['方法', '4b', '数据收集的场所与地点'],
        ['方法', '5', '干预措施细节足以复制（含给予方式与时机）'],
        ['方法', '6a', '完全定义预先指定的主要/次要结局（含评估方式与时点）'],
        ['方法', '6b', '试验开始后结局指标变更及理由'],
        ['方法', '7a', '样本量确定方法'],
        ['方法', '7b', '如适用：期中分析与终止规则'],
        ['方法', '8a', '随机分配序列生成方法'],
        ['方法', '8b', '随机化类型与限制细节（区组及区组大小）'],
        ['方法', '9', '分配隐藏机制（编号容器/中心电话等），描述至干预分配前的隐藏步骤'],
        ['方法', '10', '谁生成序列、谁招募、谁分配'],
        ['方法', '11a', '如实施盲法：谁被设盲（受试者/医护/结局评估者）及方式'],
        ['方法', '11b', '如相关：干预相似性描述'],
        ['方法', '12a', '主要/次要结局组间比较的统计方法'],
        ['方法', '12b', '附加分析方法（亚组/调整）'],
        ['结果', '13a', '各组随机分配数、接受预定治疗数、完成方案数、纳入主要结局分析数'],
        ['结果', '13b', '随机化后的失访与排除及理由'],
        ['结果', '14a', '招募与随访时段日期'],
        ['结果', '14b', '试验结束或停止的原因'],
        ['结果', '15', '各组基线人口学与临床特征表'],
        ['结果', '16', '各分析纳入人数（分母）及是否按原分配组分析（ITT）'],
        ['结果', '17a', '各主要/次要结局：各组结果、效应估计与精度（95%CI）'],
        ['结果', '17b', '二分类结局建议同时呈现绝对与相对效应'],
        ['结果', '18', '其他分析结果（区分预先指定与探索性）'],
        ['结果', '19', '各组所有重要危害或意外效应'],
        ['讨论', '20', '试验局限（潜在偏倚/不精确/分析多重性）'],
        ['讨论', '21', '外推性（外部真实性/适用性）'],
        ['讨论', '22', '与结果一致的解释，权衡获益与危害，结合其他证据'],
        ['其他', '23', '注册号与注册库名称'],
        ['其他', '24', '完整试验方案获取途径'],
        ['其他', '25', '资金与其他支持（设备/药品）来源及资助者角色'],
      ]
    },
    miqe: {
      name: 'MIQE essentials（qPCR 精选）', cite: 'Bustin SA, et al. Clin Chem 2009;55:611-622（essentials 子集）',
      items: [
        ['实验设计', 'E1', '定义实验组与对照组（含生物学重复数）'],
        ['实验设计', 'E2', '说明样本量/重复数的确定依据'],
        ['样本', 'S1', '描述样本来源、采集与处理（含伦理批准）'],
        ['样本', 'S2', '说明样本保存条件与时间'],
        ['核酸提取', 'N1', '描述提取方法与试剂盒（含 DNase 处理）'],
        ['核酸提取', 'N2', '报告核酸质量评估（A260/280、RIN 或凝胶）'],
        ['核酸提取', 'N3', '报告核酸定量方法与浓度'],
        ['逆转录', 'R1', '描述 RT 酶/引物策略（oligo-dT/随机/基因特异）与反应条件'],
        ['逆转录', 'R2', '说明 RT 输入 RNA 量与一致性'],
        ['逆转录', 'R3', '设置 no-RT 对照评估基因组 DNA 污染'],
        ['靶标', 'T1', '说明靶基因/转录本选择依据与引物覆盖的转录本'],
        ['靶标', 'T2', '提供靶序列登录号（RefSeq/Ensembl）'],
        ['寡核苷酸', 'O1', '提供引物/探针序列、位置与修饰'],
        ['寡核苷酸', 'O2', '报告引物设计软件/参数与特异性验证（BLAST）'],
        ['寡核苷酸', 'O3', '报告扩增子长度'],
        ['方案', 'P1', '描述 qPCR 化学（染料/探针）、仪器与耗材'],
        ['方案', 'P2', '报告反应体系各组分浓度与体积'],
        ['方案', 'P3', '报告循环条件（变性/退火/延伸温度与时间、循环数）'],
        ['方案', 'P4', '设置 NTC（无模板对照）'],
        ['验证', 'V1', '报告标准曲线：稀释梯度、R²、斜率、扩增效率（90-110%）'],
        ['验证', 'V2', '报告熔解曲线/产物特异性验证（单峰/凝胶/测序）'],
        ['验证', 'V3', '报告 LOD/LOQ（如适用）'],
        ['验证', 'V4', '报告技术重复与生物学重复的 CV/一致性'],
        ['验证', 'V5', '说明内参基因选择与稳定性验证（geNorm/NormFinder）'],
        ['数据分析', 'D1', '说明 Cq 确定方法（阈值/基线设定）'],
        ['数据分析', 'D2', '说明定量方法（ΔΔCq/标准曲线/Pfaffl）及效率校正'],
        ['数据分析', 'D3', '说明归一化策略（内参/总 RNA/外源 spike-in）'],
        ['数据分析', 'D4', '报告统计方法与显著性判定'],
        ['数据分析', 'D5', '提供原始 Cq 数据（补充材料）'],
      ]
    },
  };

  window.LabKitTools['checklists'] = function (host) {
    const opts = Object.entries(CHECKLISTS).map(([k, c]) => `<option value="${k}">${c.name}</option>`).join('');
    host.innerHTML = `
      <div class="tool-section">
        <h3>报告规范自查</h3>
        <div class="hint">逐条勾选并填写页码/备注；进度自动保存到本机。导出 Markdown 可直接附投稿材料。</div>
        <div class="trow">
          <label class="tfield">清单<select id="ck-sel">${opts}</select></label>
          <button class="tbtn sec" id="ck-all">全选</button>
          <button class="tbtn sec" id="ck-none">清空</button>
          <button class="tbtn pri" id="ck-export">导出 Markdown</button>
          <button class="tbtn sec" id="ck-copy">复制</button>
        </div>
        <div class="tnote" id="ck-cite"></div>
        <div class="ck-progress" id="ck-progress"></div>
        <div class="tout" id="ck-items"></div>
        <div class="tout"><div class="tmono ck-md tbody-scroll" id="ck-md" hidden></div></div>
      </div>`;
    const $ = id => host.querySelector('#' + id);
    let cur = 'prisma', state = {}, md = '';
    function load() {
      try { state = JSON.parse(Store.get('tool:checklist-' + cur, null) || '{}'); } catch (e) { state = {}; }
    }
    function save() { Store.set('tool:checklist-' + cur, JSON.stringify(state)); }
    function render() {
      const c = CHECKLISTS[cur];
      $('ck-cite').textContent = '出处：' + c.cite;
      $('ck-items').innerHTML = c.items.map(([sec, id, text], i) => {
        const s = state[id] || {};
        return `<div class="chk-item"><input type="checkbox" data-i="${i}" aria-label="完成 ${esc(id)}" ${s.done ? 'checked' : ''}>
          <span class="chk-sec">${esc(sec)} ${esc(id)}</span>
          <span class="chk-body">${esc(text)}<br><input type="text" class="ck-note" data-note="${i}" value="${esc(s.note || '')}" placeholder="页码/备注（可选）" aria-label="${esc(id)} 的页码或备注"></span></div>`;
      }).join('');
      $('ck-items').querySelectorAll('input[type=checkbox]').forEach(cb => cb.onchange = () => {
        const id = c.items[+cb.dataset.i][1];
        state[id] = Object.assign(state[id] || {}, { done: cb.checked }); save(); progress();
      });
      $('ck-items').querySelectorAll('[data-note]').forEach(inp => inp.oninput = () => {
        const id = c.items[+inp.dataset.note][1];
        state[id] = Object.assign(state[id] || {}, { note: inp.value }); save();
      });
      progress();
    }
    function progress() {
      const c = CHECKLISTS[cur];
      const done = c.items.filter(([, id]) => (state[id] || {}).done).length;
      $('ck-progress').textContent = `完成 ${done} / ${c.items.length} 条（${Math.round(done / c.items.length * 100)}%）`;
    }
    function buildMD() {
      const c = CHECKLISTS[cur];
      let out = `# ${c.name} 自查清单\n\n> 出处：${c.cite}\n> 导出：LabKit · ${new Date().toLocaleString('zh-CN', { hour12: false })}\n\n`;
      let sec = '';
      for (const [s, id, text] of c.items) {
        if (s !== sec) { out += `\n## ${s}\n\n`; sec = s; }
        const st = state[id] || {};
        out += `- [${st.done ? 'x' : ' '}] **${id}** ${text}` + (st.note ? ` — _${st.note}_` : '') + '\n';
      }
      const done = c.items.filter(([, id]) => (state[id] || {}).done).length;
      out += `\n---\n完成度：${done}/${c.items.length}\n`;
      return out;
    }
    $('ck-sel').onchange = () => { cur = $('ck-sel').value; load(); render(); $('ck-md').hidden = true; };
    $('ck-all').onclick = () => { CHECKLISTS[cur].items.forEach(([, id]) => state[id] = Object.assign(state[id] || {}, { done: true })); save(); render(); };
    $('ck-none').onclick = () => {
      const done = CHECKLISTS[cur].items.filter(([, id]) => (state[id] || {}).done).length;
      if (!done) { toast('当前清单已是空的'); return; }
      confirmModal('清空勾选？', `「${CHECKLISTS[cur].name}」已勾选 ${done} 条将被重置，备注一并清除。`, () => { state = {}; save(); render(); }, '清空');
    };
    $('ck-export').onclick = () => {
      md = buildMD();
      $('ck-md').textContent = md;
      $('ck-md').hidden = false;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
      a.download = CHECKLISTS[cur].name + '_自查清单.md';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      toast('Markdown 已导出');
    };
    $('ck-copy').onclick = () => { md = buildMD(); navigator.clipboard.writeText(md).then(() => toast('清单 Markdown 已复制')); };
    host.__lkReset = () => { state = {}; Store.set('tool:checklist-' + cur, null); return true; };
    load(); render();
  };
})();