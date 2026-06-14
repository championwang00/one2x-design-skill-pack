/**
 * One2X 主库：把可匹配的数值绑定到 Shape 变量（Radius/*、Space/s*）。
 * 用途：在 Figma「开发」→ 你自己的插件里粘贴运行；或把逻辑拷进一次性插件。也可用 MCP use_figma 单次小块。
 *
 * 约定：
 * - 圆角：本地变量名 Radius/0 … Radius/40、Radius/Full（≥500px 视为 Full）
 * - 间距：Space/s0…s10 对应 0,4,8,12,16,20,24,32,40,48,64
 * - 绑定字段：padding*、itemSpacing、counterAxisSpacing（仅 number）、四角 radius
 * - 已绑定的属性跳过；单节点异常跳过并计数
 * - 进度：figma.root sharedPluginData namespace `one2x_ds` key `bindShapeFloats` JSON `{pi,si}`
 * - 跑完全文后 key 被清空。要重来：setSharedPluginData(ns, key, '') 或 RESET=true
 *
 * 一次性跑完（推荐）：设 RUN_UNTIL_DONE = true，在 Figma 桌面端开发插件里 Run 一次；内部循环调用 run() 直到 fileDone。
 * 每轮之间会 await YIELD_MS，减轻长时间阻塞感；卡顿时可把 YIELD_MS 调到 1–5 或略减小 CHUNK。
 *
 * MCP：单次 HTTP 易 504 / 超时，只适合小块续跑或抽查；主流程不要用 MCP 当「整文件循环」。
 */
var NS = 'one2x_ds';
var CUR = 'bindShapeFloats';
var CHUNK = 50;
var MAX_INNER = 1;
var RESET = false;
/** 为 true 时：反复执行 run() 直到整文件完成（适合本地插件一次 Run）。默认 false 与旧行为一致。 */
var RUN_UNTIL_DONE = false;
/** 每完成一轮 run() 后的等待（毫秒），让 UI 喘口气；0 表示仅让出一次微任务。 */
var YIELD_MS = 0;

var PX_TO_SPACE = {
  0: 'Space/s0',
  4: 'Space/s1',
  8: 'Space/s2',
  12: 'Space/s3',
  16: 'Space/s4',
  20: 'Space/s5',
  24: 'Space/s6',
  32: 'Space/s7',
  40: 'Space/s8',
  48: 'Space/s9',
  64: 'Space/s10',
};

async function loadMaps() {
  var cols = await figma.variables.getLocalVariableCollectionsAsync();
  var shape = null;
  for (var i = 0; i < cols.length; i++) {
    if (cols[i].name === 'Shape') shape = cols[i];
  }
  if (!shape) throw new Error('no Shape');
  var spaceByName = {};
  var radiusByName = {};
  for (var j = 0; j < shape.variableIds.length; j++) {
    var v = await figma.variables.getVariableByIdAsync(shape.variableIds[j]);
    if (!v || v.resolvedType !== 'FLOAT') continue;
    if (v.name.indexOf('Space/') === 0) spaceByName[v.name] = v;
    if (v.name.indexOf('Radius/') === 0) radiusByName[v.name] = v;
  }
  return { spaceByName: spaceByName, radiusByName: radiusByName };
}

function spaceVar(spaceByName, px) {
  var nm = PX_TO_SPACE[px];
  return nm ? spaceByName[nm] : null;
}

function radiusVar(radiusByName, px) {
  if (typeof px !== 'number' || isNaN(px)) return null;
  if (radiusByName['Radius/' + px]) return radiusByName['Radius/' + px];
  if (px >= 500 && radiusByName['Radius/Full']) return radiusByName['Radius/Full'];
  return null;
}

async function bindCorners(n, radiusByName, st) {
  if (!('topLeftRadius' in n)) return;
  var bv = n.boundVariables;
  var tl = n.topLeftRadius;
  var tr = n.topRightRadius;
  var bl = n.bottomLeftRadius;
  var br = n.bottomRightRadius;
  var same = tl === tr && tr === bl && bl === br;
  if (same) {
    if (bv && bv.topLeftRadius && bv.topRightRadius && bv.bottomLeftRadius && bv.bottomRightRadius) return;
    var rv = radiusVar(radiusByName, tl);
    if (!rv) return;
    try {
      await n.setBoundVariable('topLeftRadius', rv);
      await n.setBoundVariable('topRightRadius', rv);
      await n.setBoundVariable('bottomLeftRadius', rv);
      await n.setBoundVariable('bottomRightRadius', rv);
      st.r += 4;
    } catch (e) {
      st.re++;
    }
  } else {
    var ps = [
      ['topLeftRadius', tl],
      ['topRightRadius', tr],
      ['bottomLeftRadius', bl],
      ['bottomRightRadius', br],
    ];
    for (var k = 0; k < ps.length; k++) {
      var prop = ps[k][0];
      if (bv && bv[prop]) continue;
      var rv2 = radiusVar(radiusByName, ps[k][1]);
      if (!rv2) continue;
      try {
        await n.setBoundVariable(prop, rv2);
        st.r++;
      } catch (e2) {
        st.re++;
      }
    }
  }
}

async function bindAL(n, spaceByName, st) {
  if (!('layoutMode' in n) || n.layoutMode === 'NONE') return;
  var bv = n.boundVariables;
  var props = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing'];
  if ('counterAxisSpacing' in n) props.push('counterAxisSpacing');
  for (var p = 0; p < props.length; p++) {
    var prop = props[p];
    if (bv && bv[prop]) continue;
    var val = n[prop];
    if (typeof val !== 'number' || isNaN(val)) continue;
    var sv = spaceVar(spaceByName, val);
    if (!sv) continue;
    try {
      await n.setBoundVariable(prop, sv);
      st.s++;
    } catch (e) {
      st.se++;
    }
  }
}

async function bindOne(n, maps, st) {
  try {
    await bindCorners(n, maps.radiusByName, st);
    await bindAL(n, maps.spaceByName, st);
  } catch (e) {
    st.skip++;
  }
}

async function run() {
  var maps = await loadMaps();
  var state = { pi: 0, si: 0 };
  if (!RESET) {
    var raw = figma.root.getSharedPluginData(NS, CUR);
    if (raw) {
      try {
        var o = JSON.parse(raw);
        if (typeof o.pi === 'number' && typeof o.si === 'number') state = o;
      } catch (e3) {}
    }
  }
  var pages = [];
  for (var pc = 0; pc < figma.root.children.length; pc++) {
    if (figma.root.children[pc].type === 'PAGE') pages.push(figma.root.children[pc]);
  }
  if (state.pi >= pages.length) {
    figma.root.setSharedPluginData(NS, CUR, '');
    return { fileDone: true, message: 'already complete', pages: pages.length };
  }
  var st = { r: 0, s: 0, re: 0, se: 0, skip: 0, nodes: 0, chunks: 0 };
  var lastPageName = '';
  var doneFile = false;
  var cachedAll = null;
  var cachedPi = -1;
  while (state.pi < pages.length && st.chunks < MAX_INNER && !doneFile) {
    var page = pages[state.pi];
    lastPageName = page.name;
    await figma.setCurrentPageAsync(page);
    if (cachedPi !== state.pi) {
      cachedAll = page.findAll(function (n) {
        return 'topLeftRadius' in n || ('layoutMode' in n && n.layoutMode !== 'NONE');
      });
      cachedPi = state.pi;
    }
    var all = cachedAll;
    if (state.si >= all.length) {
      state.pi++;
      state.si = 0;
      cachedAll = null;
      cachedPi = -1;
      if (state.pi >= pages.length) {
        doneFile = true;
        figma.root.setSharedPluginData(NS, CUR, '');
      }
      continue;
    }
    var to = Math.min(state.si + CHUNK, all.length);
    for (var i = state.si; i < to; i++) {
      st.nodes++;
      await bindOne(all[i], maps, st);
    }
    st.chunks++;
    state.si = to;
    if (state.si >= all.length) {
      state.pi++;
      state.si = 0;
      cachedAll = null;
      cachedPi = -1;
      if (state.pi >= pages.length) {
        doneFile = true;
        figma.root.setSharedPluginData(NS, CUR, '');
      }
    }
  }
  if (!doneFile) figma.root.setSharedPluginData(NS, CUR, JSON.stringify(state));
  return {
    fileDone: doneFile,
    cursor: doneFile ? null : state,
    lastPage: lastPageName,
    chunkStats: { r: st.r, s: st.s, re: st.re, se: st.se, skip: st.skip, nodesThisCall: st.nodes, chunkPasses: st.chunks },
  };
}

async function runUntilDone() {
  var total = { r: 0, s: 0, re: 0, se: 0, skip: 0, nodes: 0, chunkPasses: 0, rounds: 0 };
  var lastRes = null;
  while (true) {
    var res = await run();
    lastRes = res;
    total.rounds++;
    if (res.chunkStats) {
      total.r += res.chunkStats.r;
      total.s += res.chunkStats.s;
      total.re += res.chunkStats.re;
      total.se += res.chunkStats.se;
      total.skip += res.chunkStats.skip;
      total.nodes += res.chunkStats.nodesThisCall;
      total.chunkPasses += res.chunkStats.chunkPasses;
    }
    if (res.fileDone) {
      return {
        fileDone: true,
        runUntilDone: true,
        lastPage: res.lastPage,
        message: res.message,
        pages: res.pages,
        totalStats: total,
        lastRound: res,
      };
    }
    await new Promise(function (resolve) {
      setTimeout(resolve, YIELD_MS);
    });
  }
}

if (RUN_UNTIL_DONE) {
  return await runUntilDone();
}
return await run();
