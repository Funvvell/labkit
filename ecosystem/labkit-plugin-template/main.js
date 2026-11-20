/* LabKit 入门示例插件（classic script，零构建）
   契约见主仓库 docs/PLUGIN_DEV.md；视觉 token 见 docs/DESIGN_SYSTEM.md。 */
(function () {
  'use strict';

  LabKit.registerTool(
    {
      id: 'hello',
      name: '示例：倍数计算',
      group: '社区插件',
      desc: '输入的数字乘以 2 —— 演示工具注册与统一壳层',
      py: 'bsjs beishu jisuan',
      help: '输入任意数字，点「计算」得到二倍值。仅演示插件契约，无科研用途。',
      source: 'LabKit 插件模板（MIT）',
      persist: true,
    },
    function (host) {
      host.innerHTML =
        '<div class="tfield">输入数字<input id="starterX" class="native-input" type="number" value="21"></div>' +
        '<button class="btn pri" id="starterGo" style="margin-top:10px">计算</button>' +
        '<pre id="starterOut" class="tnote" style="margin-top:10px">结果：—</pre>';
      host.querySelector('#starterGo').onclick = function () {
        var v = Number(host.querySelector('#starterX').value || 0);
        host.querySelector('#starterOut').textContent = '结果：' + (v * 2);
      };
      host.__lkExample = function () {
        host.querySelector('#starterX').value = '21';
        host.querySelector('#starterGo').click();
      };
    }
  );

  LabKit.registerWidget({
    id: 'hello-card',
    title: '示例卡片',
    desc: '多尺寸形态演示',
    size: '2x2',
    sizes: ['1x1', '1x2', '2x2', '4x2'],
    body: function (size) {
      return size.w <= 1 && size.h <= 1
        ? '<div id="starterMini"></div>'
        : '<div id="starterFull"></div>';
    },
    render: function (el, size) {
      var n = (window.TOOL_META || []).filter(function (t) { return t.plugin === 'starter'; }).length;
      var mini = el.querySelector('#starterMini'), full = el.querySelector('#starterFull');
      if (mini) mini.innerHTML = '<div class="big-num">' + n + '</div><div class="sub">示例工具</div>';
      if (full) full.innerHTML = '<div class="sub">已注册 ' + n + ' 个示例工具 · 卡片尺寸 ' + size.w + '×' + size.h + '</div>';
    },
  });
})();
