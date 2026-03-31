/**
 * One2X 主库：把可匹配的数值绑定到 Shape 变量（Radius/*、space/s*）。
 * 用途：在 Figma「开发」→ 你自己的插件 / MCP use_figma 里粘贴运行；或把逻辑拷进一次性插件。
 *
 * 约定：
 * - 圆角：本地变量名 Radius/0 … Radius/40、Radius/Full（≥500px 视为 Full）
 * - 间距：space/s0…s10 对应 0,4,8,12,16,20,24,32,40,48,64
 * - 绑定字段：padding*、itemSpacing、counterAxisSpacing（仅 number）、四角 radius
 * - 已绑定的属性跳过；单节点异常跳过并计数
 * - 进度：figma.root sharedPluginData namespace `one2x_ds` key `bindShapeFloats` JSON `{pi,si}`
 * - 跑完全文后 key 被清空。要重来：setSharedPluginData(ns, key, '') 或 RESET=true
 *
 * MCP：每次建议 CHUNK=40–50、MAX_INNER=1，避免网关超时；多跑几次直到 fileDone。
 */
var NS = 'one2x_ds';
var CUR = 'bindShapeFloats';
var CHUNK = 50;
var MAX_INNER = 1;
var RESET = false;

var PX_TO_SPACE = {
  0: 'space/s0',
  4: 'space/s1',
  8: 'space/s2',
  12: 'space/s3',
  16: 'space/s4',
  20: 'space/s5',
  24: 'space/s6',
  32: 'space/s7',
  40: 'space/s8',
  48: 'space/s9',
  64: 'space/s10',
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
    if (v.name.indexOf('space/') === 0) spaceByName[v.name] = v;
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

return await run();
