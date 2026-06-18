'use strict';

// One2X Skill 可视化预览器（只读）
// 数据来源：仓库内 tokens.css（颜色/圆角/间距/字阶）与各 SKILL.md（技能描述）。

const $ = (s, r = document) => r.querySelector(s);
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// 可复制 prompt 小框：文案取自 design.md / skill 原文，用 skill 时复制即可精准指示样式
const promptHTML = (text) => `<div class="prompt"><span class="prompt-tag">Prompt</span><code class="prompt-text">${esc(text)}</code><button class="prompt-copy" type="button" title="复制 prompt">复制</button></div>`;

const NAV = [
  { id: 'overview', label: '概览', icon: 'DashboardIcon' },
  { id: 'character', label: '气质', icon: 'StyleIcon' },
  { id: 'components', label: '组件', icon: 'Package_2Icon' },
  { id: 'icons', label: '图标', icon: 'StickerIcon' },
  { id: 'color', label: '颜色', icon: 'PaletteIcon' },
  { id: 'typography', label: '字体排印', icon: 'FontIcon' },
  { id: 'radius', label: '圆角', icon: 'CropSquareIcon' },
  { id: 'spacing', label: '间距', icon: 'ResizeIcon' },
  { id: 'layout', label: '布局', icon: 'AspectRatioIcon' },
  { id: 'elevation', label: '层级', icon: 'ContentCopyIcon' },
  { id: 'motion', label: '动效', icon: 'AnimationIcon' },
  { id: 'guidelines', label: '规范', icon: 'ChecklistIcon' },
];

// 组件库实现状态：以 medeo-fe 的 @one2x/o2x-design 代码为准
const PLAYGROUND_URL = 'http://localhost:5010/';
const COMPONENT_COVERAGE = [
  { status: 'live', label: '代码已实现 · 有实时示例', note: '下面 playground 里可直接交互', items: ['Document', 'FileIcon', 'Field', 'Input Field', 'GradientBlur', 'Menu', 'Base Menu Item', 'Motion', 'Popover', 'Tooltip', 'Dialog', 'Drawer', 'Snackbar', 'Tabs', 'Tab Option'] },
  { status: 'code', label: '代码已实现 · 暂无示例', note: '已在库里导出，playground 还没补 example', items: ['Button', 'IconButton', 'Switch', 'Tag', 'TextArea', 'Progress', 'Space', 'HorizontalDivider', 'Mask', 'Layouts'] },
  { status: 'figma', label: '仅 Figma · 代码未实现', note: 'Figma 有源文件（含 🚧 未完成），代码库里还没有', items: ['Alert', 'OTP Field', 'Spinner', 'Avatars 🚧', 'Badges 🚧', 'Checkbox 🚧', 'Chips 🚧', 'Radio 🚧', 'Slider 🚧', 'Navigation 🚧', 'Lists 🚧', 'Media Cover 🚧', 'Picture upload 🚧', 'Suggestions 🚧'] },
];

const state = { tokens: { light: {}, dark: {} }, skills: [], colors: [], colorMap: new Map(), icons: [] };
const players = new Map(); // sectionEl -> [play fns]

// ---------- 数据加载 ----------
async function boot() {
  const cssText = await fetch('/api/file?path=tokens/tokens.css').then((r) => r.json()).then((d) => d.content).catch(() => '');
  $('#tokens').textContent = cssText;
  state.tokens.light = parseBlock(cssText, /:root\s*\{/);
  state.tokens.dark = parseBlock(cssText, /:root\[data-theme="dark"\]\s*\{/);
  const colorsTxt = await fetch('figma-colors.txt').then((r) => r.text()).catch(() => '');
  state.colors = parseColors(colorsTxt);
  state.colorMap = new Map(state.colors.map((c) => [c.name, c]));
  const iconsJson = await fetch('o2x-icons.json').then((r) => r.json()).catch(() => ({}));
  state.icons = Object.entries(iconsJson).map(([key, v]) => {
    const cp = parseInt(String(v.encodedCode || '').replace(/\\/g, ''), 16);
    return { key, name: v.componentName || key, ch: cp ? String.fromCodePoint(cp) : '', snake: v.snakeName || '' };
  }).filter((i) => i.ch);
  state.skills = await loadSkills();
  render();
  initTheme();
  initScrollSpy();
}

function parseColors(txt) {
  return txt.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const [name, light, dark] = l.split('|');
    return { name, light, dark, group: name.split('/')[0] };
  });
}
const cmode = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
const colorOf = (name) => { const c = state.colorMap.get(name); return c ? c[cmode()] : 'transparent'; };
const onText = (bgHex) => { // 依据背景明度选黑/白文字（用于色板 tone 标签）
  const h = (bgHex || '').replace('#', ''); if (h.length < 6) return '#000';
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#000' : '#fff';
};

function parseBlock(css, headerRe) {
  const m = headerRe.exec(css);
  if (!m) return {};
  let i = m.index + m[0].length;
  let depth = 1;
  let buf = '';
  while (i < css.length && depth > 0) {
    const ch = css[i++];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) break; buf += ch; }
    else buf += ch;
  }
  const vars = {};
  for (const line of buf.split(';')) {
    const mm = line.match(/(--[\w-]+)\s*:\s*([^;]+)/);
    if (mm) vars[mm[1].trim()] = mm[2].trim();
  }
  return vars;
}

async function loadSkills() {
  const list = await fetch('/api/list').then((r) => r.json()).then((d) => d.files).catch(() => []);
  const skillFiles = list.filter((f) => /\.cursor\/skills\/[^/]+\/SKILL\.md$/.test(f.path));
  const out = [];
  for (const f of skillFiles) {
    const data = await fetch('/api/file?path=' + encodeURIComponent(f.path)).then((r) => r.json()).catch(() => null);
    if (!data) continue;
    out.push({
      path: f.path,
      dir: f.path.split('/').slice(-2, -1)[0],
      name: fmKey(data.frontmatter, 'name') || f.path,
      description: fmKey(data.frontmatter, 'description') || '',
    });
  }
  return out;
}

function fmKey(fm, key) {
  if (!fm) return '';
  const lines = fm.split('\n');
  const idx = lines.findIndex((l) => new RegExp('^' + key + ':').test(l));
  if (idx === -1) return '';
  let rest = lines[idx].slice(key.length + 1).trim();
  if (/^[|>][+-]?$/.test(rest)) {
    const buf = [];
    for (let j = idx + 1; j < lines.length; j++) {
      if (/^\s+/.test(lines[j]) || lines[j] === '') buf.push(lines[j].trim());
      else break;
    }
    return buf.join(' ').replace(/\s+/g, ' ').trim();
  }
  if ((rest.startsWith('"') && rest.endsWith('"')) || (rest.startsWith("'") && rest.endsWith("'"))) return rest.slice(1, -1);
  return rest;
}

// ---------- 计算值读取 ----------
const computed = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
function toHex(val) {
  if (!val) return '';
  if (val.startsWith('#')) return val.toLowerCase();
  const m = val.match(/rgba?\(([^)]+)\)/);
  if (!m) return val;
  const [r, g, b] = m[1].split(',').map((n) => parseInt(n, 10));
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
}

// ---------- 渲染 ----------
function render() {
  const c = $('#content');
  c.innerHTML = '';
  c.appendChild(el(`
    <header class="hero">
      <p class="eyebrow">One2X Design System · Skill Pack</p>
      <h2>看得见的设计技能</h2>
      <p>这套技能在告诉 Agent 如何按 One2X 规范落地界面。下面把它讲的颜色、字阶、圆角、间距与动效，直接渲染成可以亲眼看、能播放的真实样例。</p>
    </header>
  `));
  c.appendChild(renderInstall());
  c.appendChild(renderOverview());
  c.appendChild(renderCharacter());
  c.appendChild(renderComponents());
  c.appendChild(renderIcons());
  c.appendChild(renderColor());
  c.appendChild(renderTypography());
  c.appendChild(renderRadius());
  c.appendChild(renderSpacing());
  c.appendChild(renderLayout());
  c.appendChild(renderElevation());
  c.appendChild(renderMotion());
  c.appendChild(renderGuidelines());

  // prompt 复制（事件委托，覆盖动态重建的颜色区）
  c.addEventListener('click', (e) => {
    const b = e.target.closest('.prompt-copy');
    if (!b) return;
    const t = b.parentElement.querySelector('.prompt-text')?.textContent || '';
    try { navigator.clipboard.writeText(t); } catch { /* 忽略 */ }
    b.textContent = '已复制'; b.classList.add('done');
    setTimeout(() => { b.textContent = '复制'; b.classList.remove('done'); }, 1400);
  });

  renderNav();
  wireMotion();
  // 进入视口自动播放
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) (players.get(e.target) || []).forEach((p) => p());
  }, { threshold: 0.35 });
  document.querySelectorAll('[data-players]').forEach((n) => io.observe(n));
}

// 获取 / 安装：仓库链接 + 一句话安装
const REPO_URL = 'https://github.com/championwang00/one2x-design-skill-pack';
const CLONE_CMD = 'git clone https://github.com/championwang00/one2x-design-skill-pack.git';

function renderInstall() {
  const box = el(`<div class="install">
    <div class="install-main">
      <div class="install-title">获取这套技能 · One2X Design Skill Pack</div>
      <p class="install-desc">克隆仓库后，把 <code>.cursor/skills/</code>、<code>design.md</code>、<code>tokens/</code> 放进你的项目根目录，Cursor 里就能直接用（默认入口 <code>one2x-design-stack</code>）。</p>
      <div class="install-cmd">
        <code class="mono install-code">${esc(CLONE_CMD)}</code>
        <button class="copy-btn" type="button">复制</button>
      </div>
    </div>
    <a class="install-link" href="${REPO_URL}" target="_blank" rel="noopener">
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
      <span>GitHub 仓库</span><span class="ext">↗</span>
    </a>
  </div>`);
  const btn = box.querySelector('.copy-btn');
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(CLONE_CMD); } catch { /* 忽略 */ }
    btn.textContent = '已复制';
    btn.classList.add('done');
    setTimeout(() => { btn.textContent = '复制'; btn.classList.remove('done'); }, 1400);
  });
  return box;
}

function section(id, title, desc, bodyEl) {
  const s = el(`<section class="block" id="${id}"><div class="sec-head"><h3>${esc(title)}</h3><p>${esc(desc)}</p></div></section>`);
  s.appendChild(bodyEl);
  return s;
}

// 概览
function renderOverview() {
  const cards = state.skills.map((s) => `
    <article class="card skill-card">
      <span class="pill badge">${esc(s.dir)}</span>
      <div class="nm">${esc(s.name)}</div>
      <div class="desc">${esc(s.description)}</div>
    </article>`).join('');
  const body = el(`<div class="grid skill-grid">${cards || '<div class="note">未找到 SKILL.md</div>'}</div>`);
  return section('overview', '技能概览', '这个技能包里的每个 Skill 各自负责什么。名称即 Agent 匹配用的标识，描述决定它何时被加载。', body);
}

// 气质：§1 关键特征 + §3.1 Primary 核心规则 + §13.1 Agent 速查表
const CHARACTER = [
  { k: '双字族', t: '正文与 UI 用 Manrope（Plain）；品牌展示标题用 Nohemi（Brand），与 Typescale 绑定。', tag: 'Manrope · Nohemi' },
  { k: '双主色', t: '常规主按钮用 Inverse Surface（黑）+ Inverse On Surface；只有最高强调的那一个用 Schemes/Primary（紫）+ On Primary。紫色非常克制，每屏 0–1 个。', tag: 'Inverse Surface · Primary' },
  { k: '变量驱动', t: '颜色、字阶、圆角、间距都来自 Figma 📖One2X 变量；Web 以 tokens.css 的 --color-* / --type-* / --space-s* / --shape-radius-* 为准。', tag: 'tokens.css' },
  { k: '命名分两套', t: '圆角 Radius/{数字} = 半径 px；间距 Space/s0…s10 = 阶梯档，名里的数字不是 px。别混。', tag: 'Radius/px · Space/s*' },
  { k: '多模式 Color', t: 'Medeo 产品以 Medeo light / dark 为主；Mebox 为另一套 Color 模式。实现时跟随主题与 tokens.css。', tag: 'Medeo / Mebox' },
  { k: '工程纪律', t: '避免裸 hex、魔法数字字号与间距；列表与表单优先库组件实例（Figma）与 token（代码）。', tag: 'no magic number' },
];
const QUICK_REF = [
  ['页面背景', 'Surface/Surface', '--color-surface-surface'],
  ['卡片 / 顶层表面', 'Surface/Surface Container Lowest', '--color-surface-surface-container-lowest'],
  ['主文本', 'Surface/On Surface', '--color-surface-on-surface'],
  ['次要文本', 'Surface/On Surface Variant', '--color-surface-on-surface-variant'],
  ['默认主按钮 · 背景', 'Surface/Inverse Surface', '--color-surface-inverse-surface'],
  ['默认主按钮 · 文字', 'Surface/Inverse On Surface', '--color-surface-inverse-on-surface'],
  ['最高强调 · 背景', 'Schemes/Primary（克制·每屏0–1个）', '--color-schemes-primary'],
  ['最高强调 · 文字', 'Schemes/On Primary', '--color-schemes-on-primary'],
  ['圆角（示例）', 'Radius/12', 'var(--shape-radius-12)'],
  ['间距（示例）', 'Space/s4', 'var(--space-s4)'],
  ['正文字体', 'Plain', 'var(--font-family-plain)'],
];
const CHARACTER_PROMPTS = {
  双字族: '字体按角色调用：UI 正文与组件文字用 Manrope / var(--font-family-plain)，品牌展示标题用 Nohemi / var(--font-family-brand)，并绑定 Typescale。',
  双主色: '默认主按钮用 Inverse Surface（黑）+ Inverse On Surface；只有最高强调那一个才用 Schemes/Primary（紫）+ On Primary，每屏 0–1 个。',
  变量驱动: '颜色、字阶、圆角、间距都从 Figma One2X Variables 与 tokens.css 取值；Web 使用 --color-* / --type-* / --space-s* / --shape-radius-*。',
  命名分两套: '圆角 Radius/{数字} 的数字就是半径 px；间距 Space/s0–s10 是阶梯档，数字不是 px；不要把 Radius 与 Space 命名规则混用。',
  '多模式 Color': '实现颜色时跟随主题模式：Medeo 产品默认 Medeo light / dark；Mebox 是另一套 Color 模式，不要跨模式手动取色。',
  工程纪律: '实现时禁止裸 hex、魔法字号与任意间距；列表、表单、按钮、菜单优先复用组件库实例与 tokens，而不是手写一套假组件。',
};

function renderCharacter() {
  const body = el('<div></div>');

  body.appendChild(el('<div class="group-title">关键特征 · Key Characteristics</div>'));
  const grid = el('<div class="grid char-grid"></div>');
  for (const c of CHARACTER) {
    grid.appendChild(el(`<article class="card char-card">
      <div class="char-k">${esc(c.k)}</div>
      <div class="char-t">${esc(c.t)}</div>
      <span class="char-tag mono">${esc(c.tag)}</span>
      ${promptHTML(CHARACTER_PROMPTS[c.k] || c.t)}
    </article>`));
  }
  body.appendChild(grid);

  // §3.1 双主色核心规则
  body.appendChild(el('<div class="group-title">核心规则 · 双主色（黑做默认，紫只点睛）</div>'));
  body.appendChild(el(`<div class="card prim-card">
    <p class="prim-lead">One2X 有<b>两个主色</b>，按强调分工，紫色<b>非常克制</b>：<b>常规主按钮用 Inverse Surface（黑）</b>，<b>只有最需要突出的那一个用 Schemes/Primary（紫）</b>。先想用黑，再想用紫。</p>
    <div class="grid prim-demos">
      <div class="prim-demo ok">
        <div class="prim-bar">
          <button class="rb ghost">取消</button>
          <button class="rb inverse">确认</button>
        </div>
        <div class="prim-cap"><span class="pill" style="background:color-mix(in srgb,var(--color-surface-inverse-surface) 14%,transparent);color:var(--color-surface-on-surface)">默认</span> 常规主按钮 = <code>Inverse Surface</code>（黑）+ <code>Inverse On Surface</code>。</div>
      </div>
      <div class="prim-demo accent">
        <div class="prim-bar">
          <button class="rb ghost">稍后</button>
          <button class="rb primary">立即升级</button>
        </div>
        <div class="prim-cap"><span class="pill good">强调</span> 最需要突出的那一个 → <code>Schemes/Primary</code>（紫），每屏 0–1 个。</div>
      </div>
    </div>
    <div class="note" style="margin-top:var(--space-s4)"><div>紫色非常克制：<b>不要</b>把紫当默认主按钮色，也<b>不要</b>满屏紫，否则品牌焦点被稀释。也别用 <code>Secondary Container</code> 蓝替代这两个主色。</div></div>
    ${promptHTML('常规主按钮用 Surface/Inverse Surface（黑）+ Inverse On Surface；只有最高强调的那一个用 Schemes/Primary（紫）+ On Primary，每屏 0–1 个，紫色要克制。')}
  </div>`));

  // §13.1 Agent 速查表
  body.appendChild(el('<div class="group-title">Agent 速查 · Medeo light 默认取值</div>'));
  const rows = QUICK_REF.map(([role, tok, css]) => `<tr><td>${esc(role)}</td><td class="mono">${esc(tok)}</td><td class="mono qr-css">${esc(css)}</td></tr>`).join('');
  body.appendChild(el(`<div class="card"><table class="qr-table">
    <thead><tr><th>角色</th><th>Figma 变量</th><th>Web token</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`));

  return section('character', '视觉气质 Character',
    'Medeo / One2X 建立在 Material Design 3 的组件语义上，品牌识别来自中性表面上的少量紫色主行动点：大面积灰白阶 + 清晰层级，让 Primary 在关键操作上保持高辨识度。', body);
}

// 组件：直接嵌入 medeo-fe 的真实代码组件库 playground
function renderComponents() {
  const body = el('<div></div>');

  body.appendChild(el('<div class="group-title">实现覆盖 · 以 medeo-fe 代码为准</div>'));
  for (const grp of COMPONENT_COVERAGE) {
    const chips = grp.items.map((i) => `<span class="comp-chip ${grp.status}">${esc(i)}</span>`).join('');
    body.appendChild(el(`<div class="cov-row">
      <div class="cov-head"><span class="cov-dot ${grp.status}"></span><b>${esc(grp.label)}</b><span class="cov-note">${esc(grp.note)}</span></div>
      <div class="comp-chips">${chips}</div>
    </div>`));
  }

  body.appendChild(el('<div class="group-title">实时组件 · @one2x/o2x-design playground</div>'));
  body.appendChild(el(`<div class="card pg-card">
    <div class="pg-bar">
      <span class="mono pg-src">@one2x/o2x-design · packages/o2x-design/playground</span>
      <a class="pg-open" href="${PLAYGROUND_URL}" target="_blank" rel="noopener">在新窗口打开 ↗</a>
    </div>
    <iframe class="pg-frame" src="${PLAYGROUND_URL}" title="O2X Design Playground"></iframe>
    <div class="note pg-hint"><div>这是 medeo-fe 里真实运行的代码组件（axii），不是 Figma 截图。需要本地 playground 服务在 <span class="mono">${esc(PLAYGROUND_URL)}</span> 运行；若上方空白，请在 <span class="mono">packages/o2x-design</span> 执行 <span class="mono">pnpm playground</span>。</div></div>
  </div>`));

  return section('components', '组件 Components',
    '组件不来自 Figma 变量，而是 medeo-fe 的代码组件库 @one2x/o2x-design。下面先看代码与 Figma 的覆盖差异，再直接嵌入真实组件库的交互式 playground。', body);
}

// 图标库：medeo-fe @one2x/o2x-icons 字体图标（info.json + woff2）
function renderIcons() {
  const body = el('<div></div>');
  const count = state.icons.length;
  if (!count) {
    body.appendChild(el('<div class="note"><div>未找到图标数据（o2x-icons.json）。</div></div>'));
    return section('icons', '图标 Icons', '来自 medeo-fe 的 @one2x/o2x-icons 字体图标库。', body);
  }
  body.appendChild(el(`<div class="icon-toolbar">
    <input class="icon-search" type="search" placeholder="搜索图标名（如 add / arrow / play）…" aria-label="搜索图标" />
    <span class="icon-status" aria-live="polite">${count} 个图标 · 点击复制组件名</span>
  </div>`));
  const cells = state.icons.map((i) => `
    <button class="icon-cell" type="button" data-name="${esc(i.name)}" data-search="${esc((i.name + ' ' + i.snake).toLowerCase())}" title="${esc(i.name)}">
      <span class="icon-glyph">${esc(i.ch)}</span>
      <span class="icon-name">${esc(i.name.replace(/Icon$/, ''))}</span>
    </button>`).join('');
  const grid = el(`<div class="icon-grid">${cells}</div>`);
  body.appendChild(grid);

  // 搜索过滤 + 点击复制
  const status = body.querySelector('.icon-status');
  const search = body.querySelector('.icon-search');
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    grid.querySelectorAll('.icon-cell').forEach((c) => {
      const hit = !q || c.dataset.search.includes(q);
      c.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });
    status.textContent = `${shown} / ${count} 个图标 · 点击复制组件名`;
  });
  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.icon-cell');
    if (!cell) return;
    const name = cell.dataset.name;
    try { navigator.clipboard.writeText(name); } catch { /* 忽略 */ }
    status.textContent = `已复制 <${name} />`;
    cell.classList.add('copied');
    setTimeout(() => cell.classList.remove('copied'), 700);
  });

  body.appendChild(el(promptHTML('图标统一调用 @one2x/o2x-icons：组件 <XxxIcon />（如 <AddIcon />）或字体 className o2x-icons-<名>，颜色用 currentColor，常用 18/20/24px；禁止临时 SVG / 第三方图标库 / emoji 占位。')));

  return section('icons', '图标 Icons',
    `来自 medeo-fe 的 @one2x/o2x-icons 字体图标库，共 ${count} 个。代码里用组件 <O2X 图标名 />（如 <AddIcon />），或 className o2x-icons-<名>。点任意图标复制组件名。`, body);
}

// 颜色（基于 Figma Color 集合 320 个变量，按 Material 角色关系组织）
const ROLE_FAMILIES = [
  {
    key: 'Primary',
    use: '最高强调的品牌紫。One2X 中每屏 0–1 个，常规主按钮仍优先黑色 Inverse Surface。',
    role: 'Primary：高强调品牌面，适合唯一最高强调 CTA / 品牌焦点。',
    on: 'On Primary：只放在 Primary 底上，作为文字或图标。',
    container: 'Primary Container：低强调紫色容器，用于 tonal 操作、选中背景、柔和强调。',
    onContainer: 'On Primary Container：只放在 Primary Container 上。',
    avoid: '不要把 Primary 当默认主按钮色，也不要把 On Primary 放到 Surface 或 Primary Container 上。',
  },
  {
    key: 'Secondary',
    use: '次级强调。信息性强调、选中态、次要按钮，不承载品牌主 CTA。',
    role: 'Secondary：次级高强调面，用于非品牌的强状态或辅助强调。',
    on: 'On Secondary：只放在 Secondary 底上。',
    container: 'Secondary Container：信息性/次级 tonal 容器、选中背景、辅助标签。',
    onContainer: 'On Secondary Container：只放在 Secondary Container 上。',
    avoid: '不要用 Secondary / Secondary Container 替代 Primary 或 Inverse Surface 做主按钮。',
  },
  {
    key: 'Tertiary',
    use: '第三强调。少量点缀、徽标、对比色，不做主路径操作。',
    role: 'Tertiary：第三强调面，用于少量装饰性强调或区分不同语义。',
    on: 'On Tertiary：只放在 Tertiary 底上。',
    container: 'Tertiary Container：柔和第三强调容器，适合徽标、提示块、辅助分组。',
    onContainer: 'On Tertiary Container：只放在 Tertiary Container 上。',
    avoid: '不要让 Tertiary 抢主行动层级，也不要和 Primary/Secondary 随意混搭。',
  },
  {
    key: 'Error',
    use: '错误与破坏性操作。删除、校验失败、危险提示。',
    role: 'Error：高强调错误面，用于危险按钮、错误状态里的主操作。',
    on: 'On Error：只放在 Error 底上。',
    container: 'Error Container：错误说明、校验失败区域、危险提示容器。',
    onContainer: 'On Error Container：只放在 Error Container 上。',
    avoid: '不要用 Error 表示普通警告或品牌强调；错误容器里的文字不要用 On Error。',
  },
];
const SURFACE_LADDER = [
  'Background', 'Surface Dim', 'Surface', 'Surface Bright',
  'Surface Container Lowest', 'Surface Container Low', 'Surface Container',
  'Surface Container High', 'Surface Container Highest',
];

function renderColor() {
  const body = el('<div id="color-body"></div>');
  const sec = section('color', '颜色 Color',
    '读自 Figma 📖One2X 的 Color 集合（320 个变量）。下面按 Material Design 的角色关系组织：先看「在什么上用什么」，再看色板与表面层级。切浅/深色看双模式取值。', body);
  queueMicrotask(() => rebuildColorBody());
  return sec;
}

function tile(bgName, fgName, label) {
  const bg = colorOf(bgName), fg = colorOf(fgName);
  return `<div class="ctile" style="background:${bg};color:${fg};border-color:${colorOf('Surface/Outline Variant')}">
    <div class="ctile-aa">Aa</div>
    <div class="ctile-meta">
      <div class="ctile-nm">${esc(label)}</div>
      <div class="ctile-hex mono">${esc(bg)}<span> · 文字 ${esc(fg)}</span></div>
    </div></div>`;
}

function rebuildColorBody() {
  const body = $('#color-body');
  if (!body) return;
  body.innerHTML = '';

  // 1) 用色配对：在什么上用什么
  body.appendChild(el('<div class="group-title">用色配对 · 在什么上用什么</div>'));
  body.appendChild(el(`<div class="grid usage-grid">
    <div class="card usage"><div class="u-demo" style="background:${colorOf('Surface/Surface')};display:flex;gap:8px;align-items:center;justify-content:center">
      <button class="u-btn" style="background:${colorOf('Surface/Inverse Surface')};color:${colorOf('Surface/Inverse On Surface')}">确认</button>
      <button class="u-btn" style="background:${colorOf('Schemes/Primary')};color:${colorOf('Schemes/On Primary')}">升级</button></div>
      <div class="u-cap"><b>双主色</b>：常规主按钮用 <code>Inverse Surface</code>（黑）；最高强调那一个才用 <code>Primary</code>（紫），每屏 0–1 个。</div>
      ${promptHTML('常规主按钮用 Inverse Surface（黑）+ Inverse On Surface；最高强调的那一个用 Schemes/Primary（紫）+ On Primary，每屏 0–1 个。')}</div>

    <div class="card usage"><div class="u-demo" style="background:${colorOf('Surface/Surface')}">
      <button class="u-btn" style="background:${colorOf('Schemes/Primary Container')};color:${colorOf('Schemes/On Primary Container')}">保存草稿</button></div>
      <div class="u-cap"><b>次级 Tonal 按钮</b>在 <code>Primary Container</code> 上用 <code>On Primary Container</code>。</div>
      ${promptHTML('次级 Tonal 操作用 Primary Container + On Primary Container；不要用 Secondary Container 充当主品牌 CTA 色。')}</div>

    <div class="card usage"><div class="u-demo" style="background:${colorOf('Surface/Background')}">
      <div class="u-card" style="background:${colorOf('Surface/Surface Container Lowest')};border-color:${colorOf('Surface/Outline Variant')}">
        <div style="color:${colorOf('Surface/On Surface')};font-weight:700">卡片标题</div>
        <div style="color:${colorOf('Surface/On Surface Variant')};font-size:12px;margin-top:4px">次要说明文字</div></div></div>
      <div class="u-cap"><b>卡片</b>：表面 <code>Surface Container Lowest</code>，正文 <code>On Surface</code>，次要 <code>On Surface Variant</code>，描边 <code>Outline Variant</code>。</div>
      ${promptHTML('卡片用 Surface Container Lowest，正文 On Surface，次要文本 On Surface Variant，描边 On Surface Variant 0.5px。')}</div>

    <div class="card usage"><div class="u-demo" style="background:${colorOf('Surface/Surface')}">
      <div class="u-card" style="background:${colorOf('Schemes/Error Container')};border:0;color:${colorOf('Schemes/On Error Container')}">
        <div style="font-weight:700">删除失败</div>
        <button class="u-btn" style="margin-top:8px;background:${colorOf('Schemes/Error')};color:${colorOf('Schemes/On Error')}">重试</button></div></div>
      <div class="u-cap"><b>错误态</b>：容器 <code>Error Container</code> + <code>On Error Container</code>；按钮 <code>Error</code> + <code>On Error</code>。</div>
      ${promptHTML('错误用 Schemes/Error + On Error；错误容器用 Error Container + On Error Container。')}</div>

    <div class="card usage"><div class="u-demo" style="background:${colorOf('Surface/Surface')}">
      <div class="u-snack" style="background:${colorOf('Surface/Inverse Surface')};color:${colorOf('Surface/Inverse On Surface')}">
        已保存 <span style="color:${colorOf('Schemes/Inverse Primary')};font-weight:700;margin-left:8px">撤销</span></div></div>
      <div class="u-cap"><b>反色 Snackbar</b>：<code>Inverse Surface</code> + <code>Inverse On Surface</code>，操作用 <code>Inverse Primary</code>。</div>
      ${promptHTML('反色 Snackbar 用 Inverse Surface 填充 + Inverse On Surface 文字，操作色用 Inverse Primary。')}</div>
  </div>`));

  // 2) 角色族
  body.appendChild(el('<div class="group-title">角色族 · Role / On / Container / On Container</div>'));
  const roleGrid = el('<div class="grid role-grid"></div>');
  for (const f of ROLE_FAMILIES) {
    roleGrid.appendChild(el(`<div class="card role-card">
      <div class="role-head"><span class="role-nm">${f.key}</span><span class="role-use">${esc(f.use)}</span></div>
      <div class="role-tiles">
        ${tile('Schemes/' + f.key, 'Schemes/On ' + f.key, f.key + ' / On ' + f.key)}
        ${tile('Schemes/' + f.key + ' Container', 'Schemes/On ' + f.key + ' Container', f.key + ' Container')}
      </div>
      <div class="role-rules">
        <div><b>Role</b><span>${esc(f.role)}</span></div>
        <div><b>On Role</b><span>${esc(f.on)}</span></div>
        <div><b>Container</b><span>${esc(f.container)}</span></div>
        <div><b>On Container</b><span>${esc(f.onContainer)}</span></div>
        <div class="avoid"><b>避免</b><span>${esc(f.avoid)}</span></div>
      </div>
      ${promptHTML(`${f.key} 色组按 Material 配对使用：${f.role} ${f.on} ${f.container} ${f.onContainer} ${f.avoid}`)}
    </div>`));
  }
  body.appendChild(roleGrid);
  body.appendChild(el(promptHTML('Material 颜色配对规则：Role 色只作为对应强调底；On Role 只放在该 Role 底上；Container 是低强调容器；On Container 只放在对应 Container 上。底色和文字 token 不要跨角色混搭。')));

  // 3) 色板 Tonal palettes
  body.appendChild(el('<div class="group-title">色板 · Tonal Palettes（0 暗 → 100 亮）</div>'));
  body.appendChild(el(`<div class="note" style="margin-bottom:var(--space-s4)"><div>每个色族从 0（黑）到 100（白）。角色色大多取自这里：浅色模式主色用 <b>40</b>，深色模式用 <b>80</b>；容器用 <b>90 / 30</b> 一类。</div></div>`));
  const palWrap = el('<div class="card"></div>');
  for (const fam of ['Primary', 'Secondary', 'Tertiary', 'Error', 'Neutral', 'Neutral Variant']) {
    const toneRe = new RegExp(`^Palettes/${fam} (\\d+)$`);
    const tones = state.colors.map((c) => { const m = c.name.match(toneRe); return m ? { tone: parseInt(m[1], 10), c } : null; })
      .filter(Boolean)
      .sort((a, b) => a.tone - b.tone);
    if (!tones.length) continue;
    const ramp = tones.map(({ tone, c }) => {
      const hex = c[cmode()];
      return `<div class="tone" title="${esc(c.name)} · ${esc(hex)}" style="background:${hex};color:${onText(hex)}">${tone}</div>`;
    }).join('');
    palWrap.appendChild(el(`<div class="pal-row"><div class="pal-name">${esc(fam)}</div><div class="pal-ramp">${ramp}</div></div>`));
  }
  body.appendChild(palWrap);
  body.appendChild(el(promptHTML('优先用语义角色变量，不要直接取 Palettes/<色族> <色阶>；确需取色时浅色主色用 40、深色用 80，容器用 90 / 30 一类。')));

  // 4) 表面层级 + 对比嵌套
  body.appendChild(el('<div class="group-title">表面层级 · Surface Elevation & Contrast</div>'));
  const ladder = SURFACE_LADDER.map((n) => {
    const hex = colorOf('Surface/' + n);
    return `<div class="surf-row"><div class="surf-chip" style="background:${hex};border-color:${colorOf('Surface/Outline Variant')}"></div>
      <div class="surf-nm">${esc(n)}</div><div class="surf-hex mono">${esc(hex)}</div></div>`;
  }).join('');
  body.appendChild(el(`<div class="grid surface-grid">
    <div class="card"><div class="mini-title">从背景到最高容器，层层提亮（深色则提暗）</div>${ladder}</div>
    <div class="card" style="background:${colorOf('Surface/Background')}">
      <div class="mini-title" style="color:${colorOf('Surface/On Surface Variant')}">嵌套对比：越上层越亮，靠 Outline Variant 分隔</div>
      <div class="nest" style="background:${colorOf('Surface/Surface Container Low')};border-color:${colorOf('Surface/Outline Variant')};color:${colorOf('Surface/On Surface')}">
        Surface Container Low
        <div class="nest" style="background:${colorOf('Surface/Surface Container')};border-color:${colorOf('Surface/Outline Variant')}">
          Surface Container
          <div class="nest" style="background:${colorOf('Surface/Surface Container High')};border-color:${colorOf('Surface/Outline Variant')}">
            Surface Container High
            <div class="nest" style="background:${colorOf('Surface/Surface Container Highest')};border-color:${colorOf('Surface/Outline Variant')}">Surface Container Highest</div>
          </div>
        </div>
      </div>
    </div>
  </div>`));
  body.appendChild(el(promptHTML('页面底用 Surface/Background 或 Surface，卡片/浮层逐层提亮用 Surface Container Low → Container → High → Highest（深色则逐层提暗）；层与层靠 Outline Variant 0.5px 分隔，不加装饰线。')));

  // 5) 状态层 State layers —— 全局统一叠 On Surface + Blend Mode 适配明暗
  body.appendChild(el('<div class="group-title">状态层 · State Layers（全局叠 On Surface）</div>'));
  const dark = cmode() === 'dark';
  const blend = dark ? 'plus-lighter' : 'plus-darker';
  const blendLabel = dark ? 'Plus Lighter（变亮 · LINEAR_DODGE）' : 'Plus Darker（变暗 · LINEAR_BURN）';
  body.appendChild(el(`<div class="note" style="margin-bottom:var(--space-s4)"><div>交互态不是换颜色：<b>全局统一叠一层 On Surface</b>，再用 Blend Mode 适配明暗——浅色 <b>Plus Darker</b>、深色 <b>Plus Lighter</b>，不必为每个组件单独挑 On 色。透明度：<b>hover 8%</b> / <b>focus·pressed 12%</b> / <b>dragged 16%</b>。当前模式：<b>${blendLabel}</b>。</div></div>`));
  const onSurf = colorOf('Surface/On Surface');
  const stateBase = (baseName, textName, label) => {
    const base = colorOf(baseName);
    const txt = colorOf(textName);
    const chips = [['Enabled', 0], ['Hover', 8], ['Focus', 12], ['Dragged', 16]].map(([t, op]) => {
      const ov = op ? `<div class="st-ov" style="background:${onSurf};opacity:${op / 100};mix-blend-mode:${blend}"></div>` : '';
      return `<div class="st-chip" style="background:${base};color:${txt}">${ov}<span class="st-lab">${t}${op ? ' ' + op + '%' : ''}</span></div>`;
    }).join('');
    return `<div class="card"><div class="mini-title">${esc(label)}</div><div class="st-row">${chips}</div></div>`;
  };
  body.appendChild(el(`<div class="grid state-grid">
    ${stateBase('Surface/Surface Container Lowest', 'Surface/On Surface', '卡片 / 列表项 · 底 Surface')}
    ${stateBase('Schemes/Primary', 'Schemes/On Primary', '主按钮 · 底 Primary')}
    ${stateBase('Schemes/Secondary Container', 'Schemes/On Secondary Container', '次级容器 · 底 Secondary Container')}
  </div>`));
  body.appendChild(el(`<div class="note" style="margin-top:var(--space-s3)"><div>少数特殊表面（反色条、Error 容器等）才改叠对应的 <code>Inverse On Surface</code> / <code>On Error Container</code>；其余一律 On Surface + Blend。</div></div>`));
  body.appendChild(el(promptHTML('交互态全局叠一层 On Surface：浅色用 Plus Darker、深色用 Plus Lighter（mix-blend-mode: plus-darker / plus-lighter）；hover 8% / focus·pressed 12% / dragged 16%。')));
}

// 字体排印
// 字阶来自 Figma Typescale 集合（Baseline 模式）。font: brand=Nohemi, plain=Manrope
const WEIGHT_MAP = { Thin: 100, ExtraLight: 200, Light: 300, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800 };
const TYPE_TIERS = [
  {
    tier: 'Display', font: 'brand', use: '品牌大标题：营销页、空状态、登陆页主视觉。字体 Nohemi，每屏至多一个。',
    prompt: '营销页 Hero / 活动 KV 主标题用 display/large（或 display/medium）+ font-family: var(--font-family-brand)（Nohemi）。',
    styles: [
      ['Display Large', 'SemiBold', 57, 64, -0.25],
      ['Display Medium', 'SemiBold', 45, 52, 0],
      ['Display Small', 'SemiBold', 36, 44, 0],
    ],
  },
  {
    tier: 'Headline', font: 'brand', use: '页面 / 区块标题。字体 Nohemi，比 Display 收敛，用于内容分区。',
    prompt: '页面 / 区块标题用 headline/*（Nohemi）；比 display 收敛，用于内容分区一级标题。',
    styles: [
      ['Headline Large', 'SemiBold', 32, 40, 0],
      ['Headline Medium', 'SemiBold', 28, 36, 0],
      ['Headline Small', 'SemiBold', 24, 32, 0],
    ],
  },
  {
    tier: 'Title', font: 'plain', use: '卡片 / 列表 / 对话框标题。字体 Manrope SemiBold。',
    prompt: 'Dialog / Drawer / 卡片 / 列表分组标题用 title/*（通用弹窗默认 title/medium）。',
    styles: [
      ['Title Large', 'SemiBold', 22, 28, 0],
      ['Title Medium', 'SemiBold', 16, 24, 0.15],
      ['Title Small', 'SemiBold', 14, 20, 0.1],
    ],
  },
  {
    tier: 'Label', font: 'plain', use: '控件文字：按钮、标签、导航、表单标签。字体 Manrope Medium。',
    prompt: '按钮 / Tab / Chip / 输入标签用 label/*；主 CTA 用 label/large - prominent。',
    styles: [
      ['Label Extra Large', 'Medium', 16, 24, 0.15],
      ['Label Large', 'Medium', 14, 20, 0.1],
      ['Label Medium', 'Medium', 12, 17, 0.2],
      ['Label Small', 'Medium', 11, 16, 0.3],
    ],
  },
  {
    tier: 'Body', font: 'plain', use: '正文与说明文字。字体 Manrope，长文用 Large / Medium。',
    prompt: '正文 / 说明 / 帮助用 body/*；元信息 / 时间戳用 body/small ~ extra small。',
    styles: [
      ['Body Large', 'Medium', 16, 24, 0.3],
      ['Body Medium', 'Medium', 14, 20, 0.2],
      ['Body Small', 'Medium', 12, 17, 0.4],
      ['Body Extra Small', 'Medium', 12, 17, 0.4],
    ],
  },
];

const TYPE_SEMANTICS = [
  ['display/*', '营销页 Hero 主标题、活动 KV、品牌叙事入口', '常规业务弹窗标题、表单标题、正文段落'],
  ['headline/*', '页面主标题、章节开场标题、内容区一级分组标题', '按钮文案、长段正文'],
  ['title/*', 'Dialog/Drawer 标题、Card/Panel 标题、列表分组标题', 'Hero 大标题、超小注释文本'],
  ['body/*', '正文、说明、帮助文案、元信息 / 时间戳（extra small）', '主 CTA 文案、主导航标签'],
  ['label/*', 'Button、Tab、Chip、Field label、紧凑工具条文案', '段落正文、营销大标题'],
];
const PAGE_EXAMPLES = [
  ['营销落地页 Hero 主标题', 'display/large', '品牌叙事优先'],
  ['活动页区块开场标题', 'headline/large', '比 display 收敛，仍保持强层级'],
  ['工作台页面主标题', 'headline/medium', '信息结构一级标题'],
  ['Dialog 标题（Share / Export）', 'title/medium', '通用弹窗默认档'],
  ['Card / Panel 标题', 'title/small ~ medium', '按信息密度选择'],
  ['表格正文 / 列表项主文案', 'body/medium', '默认阅读层'],
  ['辅助说明 / 时间戳', 'body/small ~ extra small', '低层级信息'],
  ['主按钮文案（主 CTA）', 'label/large - prominent', '默认配黑 Inverse Surface；最高强调才配 Primary'],
  ['次要按钮 / Tab / 输入标签', 'label/large', '默认交互文案'],
  ['紧凑工具条 / 小 Chip', 'label/medium', '密集区域平衡选择'],
];

function renderTypography() {
  const fam = (f) => f === 'brand'
    ? 'var(--font-family-brand, "Nohemi"), var(--font-family-plain, "Manrope"), system-ui, sans-serif'
    : 'var(--font-family-plain, "Manrope"), system-ui, sans-serif';
  const body = el('<div></div>');
  for (const t of TYPE_TIERS) {
    const famLabel = t.font === 'brand' ? 'Nohemi' : 'Manrope';
    body.appendChild(el(`<div class="group-title">${t.tier} · <span style="font-weight:500;color:var(--color-surface-on-surface-variant)">${esc(t.use)}</span></div>`));
    const card = el('<div class="card"></div>');
    for (const [name, weight, size, lh, track] of t.styles) {
      card.appendChild(el(`
        <div class="type-row">
          <div class="type-meta">
            <div class="nm">${esc(name)} <span class="font-badge ${t.font}">${famLabel}</span></div>
            <div class="sp mono">${size} / ${lh} · ${esc(weight)} ${WEIGHT_MAP[weight] || 400}${track ? ' · ' + track + 'px' : ''}</div>
          </div>
          <div class="type-sample" style="font-family:${fam(t.font)}; font-size:${size}px; line-height:${lh}px; letter-spacing:${track}px; font-weight:${WEIGHT_MAP[weight] || 400}">
            设计系统 Design Ag
          </div>
        </div>`));
    }
    body.appendChild(card);
    body.appendChild(el(promptHTML(t.prompt)));
  }
  // §5.3 字阶语义与场景映射
  body.appendChild(el('<div class="group-title">语义与场景 · 按角色选档，不按肉眼调字号</div>'));
  const semRows = TYPE_SEMANTICS.map(([tier, scenes, avoid]) =>
    `<tr><td class="mono">${esc(tier)}</td><td>${esc(scenes)}</td><td class="sem-no">${esc(avoid)}</td></tr>`).join('');
  body.appendChild(el(`<div class="card"><table class="sem-table">
    <thead><tr><th>层级</th><th>✅ 推荐场景</th><th>❌ 不建议</th></tr></thead>
    <tbody>${semRows}</tbody></table></div>`));
  body.appendChild(el(promptHTML('按语义角色选字阶：页面/章节标题用 headline/*，组件与区块标题用 title/*，正文用 body/*，按钮/Tab/标签用 label/*；不要用 headline 当按钮文案，也不要用 label 当长正文。')));

  // §5.4 Medeo 常见页面举例
  body.appendChild(el('<div class="group-title">Medeo 常见页面 · 直接套用</div>'));
  const exRows = PAGE_EXAMPLES.map(([scene, scale, note]) =>
    `<tr><td>${esc(scene)}</td><td class="mono">${esc(scale)}</td><td class="ex-note">${esc(note)}</td></tr>`).join('');
  body.appendChild(el(`<div class="card"><table class="qr-table">
    <thead><tr><th>场景</th><th>推荐字阶</th><th>备注</th></tr></thead>
    <tbody>${exRows}</tbody></table></div>`));
  body.appendChild(el(promptHTML('Medeo 页面直接套：Dialog 标题 title/medium、卡片标题 title/small~medium、表格/列表正文 body/medium、辅助说明 body/small；同一语义在全页固定同一档。')));

  body.appendChild(el(`<div class="grid char-grid" style="margin-top:var(--space-s4)">
    <div class="card char-card"><div class="char-k">prominent 用法</div>
      <div class="char-t">同层级内强调主操作：label/large - prominent → 主 CTA；label/medium - prominent → 紧凑关键操作。同一视图内 prominent 控制在 1–2 个，超 3 个须重排信息架构。</div>
      ${promptHTML('prominent 只给同层级里最关键的 1–2 个操作：主 CTA 用 label/large - prominent，紧凑关键操作用 label/medium - prominent；超过 3 个 prominent 先重排信息层级。')}</div>
    <div class="card char-card"><div class="char-k">响应式字阶（§12）</div>
      <div class="char-t">Typescale 提供 Baseline 与 mobile 两套模式；切断点时仍切到对应 --type-*，不要手写断点专属像素。营销页可更多用 display/* + Nohemi。</div>
      ${promptHTML('响应式字号切换仍使用 Typescale / --type-* 的 Baseline 与 mobile 模式；不要在断点里手写临时 font-size。营销页 Hero 可用 display/* + Nohemi。')}</div>
    <div class="card char-card"><div class="char-k">执行约束</div>
      <div class="char-t">同页同语义固定同档；组件内文字沿用库内样式，别逐个手改；新页面必须加载 Manrope / Nohemi，否则回退系统字体。</div>
      ${promptHTML('同页同语义固定同一字阶；组件内文字沿用组件库样式，不逐个手改；新页面必须加载 Manrope / Nohemi 并使用 var(--font-family-plain/brand)。')}</div>
  </div>`));

  body.appendChild(el(`
    <div class="note" style="margin-top:var(--space-s5)">
      <div>
        <div><b>Brand · Nohemi</b> — Display 与 Headline <span class="mono">var(--font-family-brand)</span>（本机未装时回退 Manrope）</div>
        <div style="margin-top:6px"><b>Plain · Manrope</b> — Title / Label / Body <span class="mono">var(--font-family-plain)</span></div>
      </div>
    </div>`));
  body.appendChild(el(promptHTML('字号 / 行高 / 字间距 / 字重来自 tokens.css 的 --type-*（或 .o2x-type-*）；font-family 用 var(--font-family-plain) 或 var(--font-family-brand)，禁止写 font-size: 14px 等魔法数字。')));
  return section('typography', '字体排印 Typography',
    '读自 Figma Typescale 集合（Baseline 模式）。完整五档：Display / Headline / Title / Label / Body。Display、Headline 用品牌字 Nohemi，其余用 Manrope。按语义选字阶，不靠肉眼调字号。', body);
}

// 圆角
function renderRadius() {
  const names = Object.keys(state.tokens.light)
    .filter((n) => /^--shape-radius-/.test(n))
    .sort((a, b) => rank(a) - rank(b));
  function rank(n) { const t = n.replace('--shape-radius-', ''); return t === 'full' ? 9999 : parseFloat(t); }
  const cards = names.map((n) => {
    const t = n.replace('--shape-radius-', '');
    const v = state.tokens.light[n];
    return `<div class="card radius-card">
      <div class="radius-demo" style="border-radius:var(${n})"></div>
      <div class="nm">Radius/${esc(t)}</div>
      <div class="px mono">${esc(v === '0' ? '0px' : v)}</div>
    </div>`;
  }).join('');
  const note = `<div class="note" style="margin-top:var(--space-s5)">
    <div><b>命名即半径像素</b>：<span class="mono">Radius/16</span> = 16px。胶囊用 <span class="mono">Radius/Full</span>。
    Figma 中非 0 圆角设 <b>cornerSmoothing 0.6</b>（超椭圆），并保持同心：<span class="mono">内圆角 = 外圆角 − padding</span>。</div></div>`;
  const body = el(`<div><div class="grid radius-grid">${cards}</div>${note}
    ${promptHTML('圆角命名：Figma 用 Radius/{数字}，Web 用 var(--shape-radius-*)；名中数字 = 半径 px，例如 Radius/12 = var(--shape-radius-12) = 12px，胶囊用 Radius/Full。')}
    ${promptHTML('圆角执行：非 0 圆角在 Figma 设 cornerSmoothing 0.6；相邻内外圆角保持同心，内圆角 = 外圆角 − padding；不要临时写 border-radius: 13px。')}</div>`);
  return section('radius', '圆角 Radius', '4px 网格，名字里的数字就是半径像素。下面每个方块用的就是对应 token。', body);
}

// 间距
function renderSpacing() {
  const names = Object.keys(state.tokens.light)
    .filter((n) => /^--space-s\d+$/.test(n))
    .sort((a, b) => parseInt(a.match(/\d+$/)[0]) - parseInt(b.match(/\d+$/)[0]));
  const rows = names.map((n) => {
    const key = n.replace('--space-', '');
    const v = state.tokens.light[n];
    const px = v === '0' ? 0 : parseFloat(v);
    return `<div class="space-row">
      <div class="space-key">${esc(key)}</div>
      <div class="space-bar" data-w="${px}" style="width:0"></div>
      <div class="space-px mono">${px}px</div>
    </div>`;
  }).join('');
  const demo = `
    <div class="space-demo" data-players>
      ${['--space-s2', '--space-s4', '--space-s6'].map((n) => `
        <div class="box" style="padding:var(${n})"><i style="width:64px"></i><div class="space-px mono" style="margin-top:6px;text-align:center">padding ${n.replace('--space-', '')}</div></div>`).join('')}
    </div>`;
  const body = el(`<div class="card"><div data-players data-spacing>${rows}</div>
    <div class="group-title">实际内距示例</div>${demo}</div>`);
  // 注册播放：让间距条按真实像素增长
  const animateBars = () => body.querySelectorAll('.space-bar').forEach((b, i) => {
    setTimeout(() => { b.style.width = b.dataset.w + 'px'; }, i * 45);
  });
  queueMicrotask(() => { players.set(body.querySelector('[data-spacing]'), [animateBars]); });
  body.appendChild(el(promptHTML('间距命名：Figma 用 Space/s0–s10，Web 用 var(--space-s*)；s 是阶梯档不是像素，s4 = 16px，不等于 4px。')));
  body.appendChild(el(promptHTML('间距执行：gap / padding / margin 全部用 var(--space-s*)；卡片内 s4–s6，元素间 s2–s4，区块间 s6 起，大留白 s7+，优先 4 的倍数。')));
  return section('spacing', '间距 Space', '注意：s 是阶梯档，不是像素。s4 不等于 4px。下面每根黑条的实际长度，就是该档真实间距。', body);
}

// 布局（§7 间距节奏 / 栅格容器 / 留白层级 + §9 模式参考 Share）
function renderLayout() {
  const body = el('<div></div>');

  body.appendChild(el('<div class="group-title">间距与节奏 · 优先 4 的倍数</div>'));
  body.appendChild(el(`<div class="grid layout-grid">
    <div class="card lay-rhythm">
      <div class="mini-title">卡片内边距起点 s4–s6，区块大留白 s7+</div>
      <div class="rhythm-shell">
        <div class="rhythm-card" style="padding:var(--space-s5)">
          <div class="rhythm-title">卡片标题</div>
          <div class="rhythm-text">内边距 s5 · 元素间距 s3</div>
          <div class="rhythm-pillrow"><span class="rb primary">主行动</span><span class="rb ghost">次要</span></div>
        </div>
        <div class="rhythm-card" style="padding:var(--space-s5)">
          <div class="rhythm-title">相邻卡片</div>
          <div class="rhythm-text">两张卡之间用 s6 区块间距</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="mini-title">栅格与容器 · 侧栏 + 主内容</div>
      <div class="shell-demo">
        <aside class="shell-side">
          <div class="shell-logo"></div>
          <span class="shell-link active">工作台</span>
          <span class="shell-link">模板</span>
          <span class="shell-link">素材</span>
        </aside>
        <main class="shell-main">
          <div class="shell-h">Projects</div>
          <div class="shell-grid"><i></i><i></i><i></i><i></i></div>
        </main>
      </div>
      <div class="note" style="margin-top:var(--space-s3)"><div>分区靠 <b>Surface 层级 + Outline</b> 区隔，而非额外装饰线。</div></div>
    </div>
  </div>`));
  body.appendChild(el(promptHTML('布局节奏：卡片内边距用 Space/s4–s6，卡片内元素间距用 s2–s4，相邻卡片/区块间距 s6 起，大留白用 s7+；不要写任意 px 间距。')));
  body.appendChild(el(promptHTML('工作台类布局优先侧栏 + 主内容；分区靠 Surface 层级、Outline Variant 0.5px 与空间关系区隔，不额外加装饰线。')));

  body.appendChild(el('<div class="group-title">留白与层级 · 中性表面为底，字阶 + Primary 建层级</div>'));
  body.appendChild(el(`<div class="card hier-card">
    <div class="hier-display">大留白 + 中性灰</div>
    <div class="hier-body">大面积 Surface / Surface Container Lowest 形成底色，再用字阶拉开主次；默认主行动用 Inverse Surface，紫色 Primary 只作为最高强调点。</div>
    <button class="rb primary">唯一主行动</button>
  </div>`));
  body.appendChild(el(promptHTML('页面先用中性 Surface 和字阶建立层级；默认主行动用 Inverse Surface（黑），只有最高强调点才用 Primary（紫），每屏 0–1 个。')));

  body.appendChild(el('<div class="group-title">模式参考 · Share / VideoShareDialog（§9）</div>'));
  const share = [
    ['容器', '白底、细边框（≈0.5px）、大圆角（如 24px）、轻阴影 Elevation Light/1'],
    ['分段控件 Tabs', '轨道 Surface/Surface；选中项 Surface Container Lowest + On Surface；未选中降对比'],
    ['图标网格', '统一 64×64 点击区、12px 圆角容器、Outline Variant 描边；下方 label/medium 平台名'],
    ['主按钮 Copy link', 'Inverse Surface 填充 + Inverse On Surface 文字；12px 圆角、label/large、左侧 18px 图标'],
    ['加载态', 'title/medium 标题 + 中央 24px Spinner'],
  ].map(([k, v]) => `<div class="share-row"><div class="share-k">${esc(k)}</div><div class="share-v">${esc(v)}</div></div>`).join('');
  body.appendChild(el(`<div class="card">${share}</div>`));
  body.appendChild(el(promptHTML('Share / VideoShareDialog：容器白底 + 0.5px 细边框 + 24px 大圆角 + Elevation Light/1；Tabs 用 Surface 轨道和 Surface Container Lowest 选中项。')));
  body.appendChild(el(promptHTML('Share 图标网格统一 64×64 点击区、12px 圆角容器、Outline Variant 描边，下方 label/medium；Copy link 主按钮用 Inverse Surface + Inverse On Surface，左侧 18px 图标。')));
  body.appendChild(el(promptHTML('卡片内边距用 s4–s6、区块间距 s6 起、大留白 s7+；分区靠 Surface 层级 + Outline 分隔，不要加装饰线。')));

  return section('layout', '布局 Layout',
    '间距用 Space/s* 的离散档建立节奏；分区靠 Surface 层级与 Outline，而不是装饰线；中性表面为底，再用字阶与双主色建立层级。', body);
}

// 深度与层级（§8 阴影 Elevation Light/1 + blur）
function renderElevation() {
  const body = el('<div></div>');

  body.appendChild(el('<div class="group-title">浮起表达 · 细边框 + 轻阴影</div>'));
  body.appendChild(el(`<div class="grid elev-grid">
    <div class="elev-card elev-0"><div class="elev-nm">平面 · Level 0</div><div class="elev-sub">仅 Outline Variant 描边，无阴影</div></div>
    <div class="elev-card elev-1"><div class="elev-nm">浮起 · Elevation Light/1</div><div class="elev-sub">多层低不透明度 drop shadow</div></div>
    <div class="elev-card elev-2"><div class="elev-nm">弹层 · 更高</div><div class="elev-sub">阴影更扩散，用于 Dialog / Menu</div></div>
  </div>`));
  body.appendChild(el(`<div class="card" style="margin-top:var(--space-s4)">
    <div class="mini-title">Elevation Light/1 · 多层叠加（约值）</div>
    <code class="code">box-shadow:
  0 1px 2px rgba(0,0,0,.06),
  0 2px 4px rgba(0,0,0,.05),
  0 4px 8px rgba(0,0,0,.04),
  0 6px 12px rgba(0,0,0,.03);</code>
    <div class="note" style="margin-top:var(--space-s3)"><div>浅色 Medeo 上用<b>细边框 + 轻阴影</b>表达浮起；具体数值以 Figma 节点与 tokens.css 为准，<b>不要自造多层阴影栈</b>。</div></div>
  </div>`));
  body.appendChild(el(promptHTML('浮起层级：普通卡片只用 Outline Variant 0.5px；卡片/浮层需要浮起时用 Elevation Light/1 的低不透明度多层 drop shadow；不要临时自造阴影数值。')));

  body.appendChild(el('<div class="group-title">背景模糊 · blur / backdrop</div>'));
  body.appendChild(el(`<div class="card blur-demo">
    <div class="blur-bg"></div>
    <div class="blur-panel">浮层标题栏：backdrop-blur 让底层内容透出又不抢焦点</div>
    <div class="note" style="margin-top:var(--space-s3)"><div>用于浮层标题栏等场景；模糊数值与设计稿一致。注意：&gt;20px 的 blur 会拖慢动画。</div></div>
  </div>`));
  body.appendChild(el(promptHTML('backdrop-blur 只用于浮层标题栏、玻璃感栏位等需要底层内容透出的场景；blur 数值以设计稿/token 为准，动画中避免 >20px blur。')));
  body.appendChild(el(promptHTML('浮起用细边框 + 轻阴影（Elevation Light/1 多层 drop shadow）；浮层标题栏用 backdrop-blur；数值以 tokens.css 为准，不要自造多层阴影栈。')));

  return section('elevation', '深度与层级 Elevation',
    '浅色界面上靠细边框与轻阴影区分层级。Elevation Light/1 是一组低不透明度的多层 drop shadow；浮层标题栏用背景模糊。数值以 Figma 与 tokens.css 为准。', body);
}

// 规范（§11 Do / Don't + §13.3 自查清单）
const DOS = [
  '用 tokens.css 的 --color-* / --type-* / --space-s* / --shape-radius-* / --font-* 落地',
  '默认主按钮用 Inverse Surface（黑）+ Inverse On Surface；只有最高强调那一个才用 Schemes/Primary（紫），每屏 0–1 个',
  'Figma 中绑定 Color / Typescale / Shape 变量；组件用库实例',
  '按 §5.3 / §5.4 选字阶；同一语义角色在同页保持一致',
  '需要零宽数字时启用 font-feature-settings: "zero" 1，与稿一致',
  '查阅 tokens/README.md 与 one2x-design-system skill 获取实现细则',
];
const DONTS = [
  '不要在代码里写裸 hex（确需临时用，也应回写 token）',
  '不要用 Secondary Container 充当主品牌 CTA 色',
  '不要把 Radius/{px} 的「名=像素」与 Space/s* 阶梯混淆',
  '不要把紫色 Primary 当默认主按钮色到处用：默认用 Inverse Surface（黑），紫色只给最高强调',
  '不要在同屏放多个同等视觉权重的紫色 Primary 主按钮（每屏 0–1 个）',
  '不要在超大 Figma 文件上全文件 findAll，会触发 MCP 过载',
];
const CHECKLIST = [
  '颜色与间距是否都能映射到 --color-* 与 --space-s*？',
  '默认主按钮是否用了黑（Inverse Surface）、紫色 Primary 是否每屏 ≤ 1 个？',
  '圆角是否用了 --shape-radius-*，且未与 Space/s* 混用规则？',
  '字阶是否落在 §5.3 的语义档位，而非临时 font-size？',
  'Figma 侧是否优先实例化库组件，而非手绘 Frame？',
];

function renderGuidelines() {
  const body = el('<div></div>');
  const doLis = DOS.map((t) => `<li>${esc(t)}</li>`).join('');
  const dontLis = DONTS.map((t) => `<li>${esc(t)}</li>`).join('');
  body.appendChild(el(`<div class="grid dodont-grid">
    <div class="card dd do"><div class="dd-head"><span class="pill good">Do</span> 该这么做</div><ul class="dd-list">${doLis}</ul></div>
    <div class="card dd dont"><div class="dd-head"><span class="pill bad">Don't</span> 别这么做</div><ul class="dd-list">${dontLis}</ul></div>
  </div>`));

  body.appendChild(el('<div class="group-title">落地自查 · Iteration Checklist</div>'));
  const ck = CHECKLIST.map((t, i) => `<li><span class="ck-n">${i + 1}</span>${esc(t)}</li>`).join('');
  body.appendChild(el(`<div class="card"><ul class="ck-list">${ck}</ul></div>`));

  return section('guidelines', '规范 Do\'s & Don\'ts',
    '把规范落到一页可对照的清单：该做什么、别做什么，以及每次实现后跑一遍的自查问题。来源 design.md §11、§13.3。', body);
}

// 动效（覆盖 web-animation-design skill 全量要点）
const EASE_OUT_FAMILY = [
  ['ease-out-quad', 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'],
  ['ease-out-cubic', 'cubic-bezier(0.215, 0.61, 0.355, 1)'],
  ['ease-out-quart', 'cubic-bezier(0.165, 0.84, 0.44, 1)'],
  ['ease-out-quint', 'cubic-bezier(0.23, 1, 0.32, 1)'],
  ['ease-out-expo', 'cubic-bezier(0.19, 1, 0.22, 1)'],
  ['ease-out-circ', 'cubic-bezier(0.075, 0.82, 0.165, 1)'],
];
const EASE_INOUT_FAMILY = [
  ['ease-in-out-quad', 'cubic-bezier(0.455, 0.03, 0.515, 0.955)'],
  ['ease-in-out-cubic', 'cubic-bezier(0.645, 0.045, 0.355, 1)'],
  ['ease-in-out-quart', 'cubic-bezier(0.77, 0, 0.175, 1)'],
  ['ease-in-out-quint', 'cubic-bezier(0.86, 0, 0.07, 1)'],
  ['ease-in-out-expo', 'cubic-bezier(1, 0, 0, 1)'],
  ['ease-in-out-circ', 'cubic-bezier(0.785, 0.135, 0.15, 0.86)'],
];
const TIPS_TABLE = [
  ['按钮要有反馈', '<code>:active</code> 加 <b>transform: scale(0.97)</b>'],
  ['元素凭空出现', '从 <b>scale(0.95)</b> 起，别从 scale(0)'],
  ['动画发抖', '加 <b>will-change: transform</b>（GPU/CPU 交接的 1px 抖动）'],
  ['hover 闪烁', '动子元素，不动父元素（光标不会离开热区）'],
  ['弹层从错误位置缩放', '把 <b>transform-origin</b> 设到触发点'],
  ['连续 tooltip 慢', '第一个之后跳过 delay/动画（<code>data-instant</code>）'],
  ['小按钮难点', '用伪元素做 <b>44px</b> 最小热区'],
  ['还是哪里不对', '加 <b>&lt;20px</b> 的轻微 blur 掩盖瑕疵'],
  ['移动端误触 hover', '<code>@media (hover: hover) and (pointer: fine)</code>'],
];

function efamCard(title, sub, list) {
  const rows = list.map(([nm, val]) => `
    <div class="efam-row">
      ${curveSVG(val)}
      <div class="efam-meta"><span class="nm">${nm}</span><span class="efam-val mono">${esc(val)}</span></div>
      <div class="easing-track" data-easing="${val}"><div class="ball"></div></div>
    </div>`).join('');
  const prompt = title.includes('ease-out')
    ? '入场 / 出场优先用 ease-out；强入口可用 cubic-bezier(0.16,1,0.3,1)，标准 UI 用 cubic-bezier(0.23,1,0.32,1)，弱提示可用 ease-out。'
    : '屏内移动 / morph / 已存在元素变形用 ease-in-out；标准曲线 cubic-bezier(0.645,0.045,0.355,1)，轻量变化可用 ease-in-out。';
  return `<div class="card" data-players data-demo="easefam">
    <div class="demo-head"><h4>${esc(title)}</h4><button class="btn" data-replay>重播</button></div>
    <p class="efam-sub">${esc(sub)}</p>
    <div class="efam-list">${rows}</div>
    ${promptHTML(prompt)}</div>`;
}

function renderMotion() {
  const flowRows = [
    ['入场 / 出场', '元素进出视口', 'ease-out', 'cubic-bezier(0.23, 1, 0.32, 1)'],
    ['屏内移动 / 变形', '已在屏上的元素位移、morph', 'ease-in-out', 'cubic-bezier(0.645, 0.045, 0.355, 1)'],
    ['hover / 颜色', '悬停态、颜色过渡', 'ease', 'ease'],
    ['匀速', '进度、跑马灯、计时', 'linear', 'linear'],
  ].map(([q, d, nm, val]) => `
    <div class="efam-row">
      <div class="flow-q"><span class="nm">${esc(q)}</span><span class="flow-desc">${esc(d)}</span></div>
      <div class="flow-pick mono">${esc(nm)}</div>
      <div class="easing-track" data-easing="${val}"><div class="ball"></div></div>
    </div>`).join('');

  const durCols = [['100ms', '微交互'], ['200ms', '标准 UI'], ['300ms', '弹层 / 抽屉']].map(([d, t]) => `
    <div class="col" style="background:var(--color-surface-background)">
      <div class="label"><span>${d}</span></div>
      <div class="ministage"><div class="dot" data-dur="${parseInt(d)}"></div></div>
      <code class="code">${esc(t)}</code>
    </div>`).join('');

  const tipsRows = TIPS_TABLE.map(([s, sol]) => `<tr><td>${s}</td><td>${sol}</td></tr>`).join('');

  const body = el(`<div>
    <div class="group-title">选什么缓动 · 决策</div>
    <div class="card" data-players data-demo="flow">
      <div class="demo-head"><h4>四问定缓动</h4><button class="btn" data-replay>重播</button></div>
      <div class="efam-list">${flowRows}</div>
      <div class="note" style="margin-top:var(--space-s4)"><div><b>ease-in</b> 几乎不用（起步迟钝）。还有一条：用户每天看 <b>100+ 次</b>的动效干脆别做（如 Raycast）。</div></div>
      ${promptHTML('UI 动画时长 < 300ms；入场 / 出场用 ease-out（如 cubic-bezier(0.23,1,0.32,1)），屏内移动 / 变形用 ease-in-out，hover / 颜色用 ease。')}
    </div>

    <div class="group-title">缓动家族 · 弱 → 强（内置曲线通常太弱，自定义更有意图）</div>
    <div class="grid motion-grid">
      ${efamCard('ease-out · 入场 / 出场最常用', '起步快、尾部缓，元素「冲」向目标再落定。', EASE_OUT_FAMILY)}
      ${efamCard('ease-in-out · 屏内移动 / 变形', '像汽车起步再刹车，两端慢、中间快。', EASE_INOUT_FAMILY)}
    </div>

    <div class="group-title">配对元素 · 同一单元用同一时长与缓动</div>
    <div class="card" data-players data-demo="paired">
      <div class="demo-head"><h4>Modal + 遮罩一起动</h4><button class="btn" data-replay>重播</button></div>
      <div class="paired-stage">
        <div class="paired-overlay" data-role="p-overlay"></div>
        <div class="paired-modal" data-role="p-modal">弹窗与遮罩同用 220ms ease-out，作为一个整体出现。</div>
      </div>
      <code class="code">.modal,.overlay { transition: 220ms ease-out }  /* 同时长同缓动 */</code>
      ${promptHTML('同一交互单元里的元素要同一时长与同一缓动：Modal 与遮罩一起用 200–240ms ease-out；不要让遮罩、面板、内容各自动。')}
    </div>

    <div class="group-title">入场 / 时长 / 频率</div>
    <div class="grid motion-grid">
      <div class="card" data-players data-demo="entrance">
        <div class="demo-head"><h4>入场：从哪开始</h4><button class="btn" data-replay>重播</button></div>
        <div class="ba">
          <div class="col before">
            <div class="label"><span>Before</span><span class="pill bad">突兀</span></div>
            <div class="ministage"><div class="dot" data-role="before"></div></div>
            <code class="code">transform: scale(0)
400ms ease-in</code>
          </div>
          <div class="col after">
            <div class="label"><span>After</span><span class="pill good">干脆</span></div>
            <div class="ministage"><div class="dot" data-role="after"></div></div>
            <code class="code">scale(0.95) + opacity
200ms ease-out</code>
          </div>
        </div>
        ${promptHTML('元素入场从 scale(0.95) + opacity 起，用 180–220ms ease-out；不要从 scale(0) 弹出，也不要用 400ms ease-in。')}
      </div>

      <div class="card" data-players data-demo="duration">
        <div class="demo-head"><h4>时长尺度</h4><button class="btn" data-replay>重播</button></div>
        <div class="ba" style="grid-template-columns:1fr 1fr 1fr">${durCols}</div>
        <div class="note" style="margin-top:var(--space-s4)"><div>UI 动画基本 <b>&lt; 300ms</b>；越大越慢，出场比入场约快 <b>20%</b>，位移越远时间越长。</div></div>
        ${promptHTML('动效时长：微交互约 100ms，标准 UI 180–220ms，弹层/抽屉 240–300ms；出场通常比入场快 20%，UI 动画尽量 <300ms。')}
      </div>
    </div>

    <div class="group-title">何时动 · 何时别动</div>
    <div class="card"><div class="flow-cols">
      <div><div class="minilist h">该动</div><ul class="minilist good">
        <li>入场 / 出场，维持空间连续性</li>
        <li>状态变化需要视觉延续</li>
        <li>对用户操作的即时反馈</li>
        <li>少见、首次出现的环节可以更出彩</li>
      </ul></div>
      <div><div class="minilist h">别动</div><ul class="minilist bad">
        <li>键盘触发的操作（方向键、快捷键）</li>
        <li>高频元素的 hover</li>
        <li>每天交互 100+ 次的东西</li>
        <li>速度比顺滑更重要时</li>
      </ul></div>
    </div>
    <div class="note" style="margin-top:var(--space-s4)"><div><b>营销 vs 产品</b>：营销页可更繁复、时长更长；产品里要快、要有目的、绝不浮夸。</div></div>
    ${promptHTML('只有入场/出场、状态变化、操作反馈、少见首次环节需要动；键盘触发、高频 hover、每天 100+ 次的交互、速度优先场景不要加动效。')}
    </div>

    <div class="group-title">弹簧 Spring · 自然、可被打断</div>
    <div class="card" data-players data-demo="spring">
      <div class="demo-head"><h4>ease-out vs spring</h4><button class="btn" data-replay>重播</button></div>
      <div class="spring-row"><span class="nm">ease-out</span><div class="easing-track"><div class="ball" data-spring="ease"></div></div></div>
      <div class="spring-row"><span class="nm">spring · bounce 0.2</span><div class="easing-track"><div class="ball" data-spring="spring"></div></div></div>
      <div class="note" style="margin-top:var(--space-s2)"><div>弹簧没有固定时长、模拟真实物理。<b>拖拽、可中断手势、要「活」的元素</b>（Dynamic Island）用它。Apple 写法：<span class="mono">{ duration: 0.5, bounce: 0.2 }</span>；bounce 多数 UI 设 0、需要时保持 0.1–0.3。被打断时弹簧保留速度，CSS 动画会从零重启。</div></div>
      ${promptHTML('拖拽、可中断手势、跟手反馈或需要“活”的元素用 spring；常规 UI bounce 设 0，需要弹性时 0.1–0.3；普通入场仍优先 ease-out。')}
    </div>

    <div class="group-title">性能 Performance</div>
    <div class="grid motion-grid">
      <div class="card" data-players data-demo="perf">
        <div class="demo-head"><h4>只动 transform vs 动尺寸</h4><button class="btn" data-replay>重播</button></div>
        <div class="perf-grid">
          <div><div class="perf-label">transform <span class="perf-tag gpu">GPU · 顺滑</span></div><div class="perf-track"><div class="perf-box" data-perf="good"></div></div></div>
          <div><div class="perf-label">width <span class="perf-tag warn">触发 layout</span></div><div class="perf-track"><div class="perf-box" data-perf="bad"></div></div></div>
        </div>
        <code class="code">只动 transform 与 opacity，跳过 layout/paint</code>
        ${promptHTML('性能优先：动画只改 transform 与 opacity；不要动画 width / height / margin / padding，因为会触发 layout；频繁动的元素提前 will-change: transform。')}
      </div>
      <div class="card">
        <div class="demo-head"><h4>黄金法则与手感</h4></div>
        <div class="note"><div>避免动 <span class="mono">width/height/margin/padding</span> 与 &gt;20px 的 blur；抖动加 <span class="mono">will-change: transform</span>。React 里用 ref 直接改样式、别每帧 setState。</div></div>
        ${promptHTML('动画只改 transform 与 opacity；避免动 width / height / margin / padding；元素入场从 scale(0.95) + opacity 起、不要从 scale(0)；抖动加 will-change: transform。')}
        <div style="display:flex;gap:var(--space-s4);margin-top:var(--space-s4);flex-wrap:wrap;align-items:center">
          <button class="btn primary">按一下（scale 0.97）</button>
          <button class="btn blur-btn">按一下（+blur 掩盖）</button>
          <div class="lift card" style="padding:var(--space-s3) var(--space-s4);cursor:default">悬停我（上浮）</div>
        </div>
      </div>
    </div>

    <div class="group-title">无障碍 Accessibility</div>
    <div class="grid motion-grid">
      <div class="card" data-players data-demo="reduced">
        <div class="demo-head"><h4>prefers-reduced-motion</h4>
          <label class="pill" style="cursor:pointer"><input type="checkbox" data-reduce style="margin-right:6px" />减少动态</label></div>
        <div class="stage"><div class="mover" data-role="reduce"></div></div>
        <code class="code">每个动画都配 @media (prefers-reduced-motion: reduce){ animation:none }</code>
        ${promptHTML('所有动画都必须支持 prefers-reduced-motion: reduce；reduce 时关闭 transform/opacity/颜色动画，保留最终状态与可用性。')}
      </div>
      <div class="card">
        <div class="demo-head"><h4>触摸与命中区</h4></div>
        <div class="note"><div>触摸设备会把点按当成 hover，hover 动效要包 <span class="mono">@media (hover:hover) and (pointer:fine)</span>。可点区域最小 <b>44px</b>（Apple / WCAG），用伪元素扩大、不改布局。reduced 时所有动画都关，连 opacity / 颜色也不例外。</div></div>
        ${promptHTML('每个动画都配 @media (prefers-reduced-motion: reduce){ animation: none }；hover 动效包 @media (hover:hover) and (pointer:fine)；可点区域最小 44px。')}
      </div>
    </div>

    <div class="group-title">交互手感 · hover 闪烁 / 缩放原点</div>
    <div class="grid motion-grid">
      <div class="card">
        <div class="demo-head"><h4>hover 闪烁：动子元素</h4></div>
        <div class="flicker-row">
          <div><div class="flicker-box bad"><div class="flicker-inner"></div></div><div class="flicker-cap">动父元素 → 闪烁</div></div>
          <div><div class="flicker-box good"><div class="flicker-inner"></div></div><div class="flicker-cap">动子元素 → 稳定</div></div>
        </div>
        ${promptHTML('hover 上浮不要移动 hover 命中区本身；动子元素或内层视觉层，保持父级点击/hover 区域稳定，避免鼠标离开后闪烁。')}
      </div>
      <div class="card" data-players data-demo="origin">
        <div class="demo-head"><h4>缩放原点</h4><button class="btn" data-replay>重播</button></div>
        <div class="origin-row">
          <div><div class="origin-wrap"><div class="origin-pop" data-origin="center">center</div></div><div class="flicker-cap">从中心放大（多数错）</div></div>
          <div><div class="origin-wrap"><div class="origin-pop" data-origin="trigger">trigger</div></div><div class="flicker-cap">从触发点放大（对）</div></div>
        </div>
        ${promptHTML('Popover / Menu / Tooltip 的缩放原点对齐触发点或锚点；不要默认从中心 scale，避免位置关系断裂。')}
      </div>
    </div>

    <div class="group-title">实战速查 · Practical Tips</div>
    <div class="card"><table class="tips-table"><tbody>${tipsRows}</tbody></table></div>
    ${promptHTML('动效排查按实战速查处理：卡顿先查是否动了 layout 属性；闪烁先查 hover 命中区；弹层不自然先查 transform-origin 与遮罩/面板是否同缓动。')}
  </div>`);

  // lift hover（仅 transform）
  body.querySelectorAll('.lift').forEach((n) => {
    n.style.transition = 'transform 200ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms ease';
    n.addEventListener('mouseenter', () => { n.style.transform = 'translateY(-4px)'; n.style.boxShadow = '0 14px 32px rgba(0,0,0,.12)'; });
    n.addEventListener('mouseleave', () => { n.style.transform = ''; n.style.boxShadow = ''; });
  });
  // blur 按钮（:active 时叠 blur 掩盖状态切换）
  body.querySelectorAll('.blur-btn').forEach((n) => {
    n.style.transition = 'transform 150ms ease-out, filter 150ms ease-out';
    const down = () => { n.style.transform = 'scale(0.97)'; n.style.filter = 'blur(2px)'; };
    const up = () => { n.style.transform = ''; n.style.filter = ''; };
    n.addEventListener('mousedown', down); n.addEventListener('mouseup', up); n.addEventListener('mouseleave', up);
  });

  return section('motion', '动效 Motion',
    '完整对照 web-animation-design（Emil Kowalski animations.dev）：缓动决策、缓动家族曲线、配对元素、时长频率、何时动、弹簧、性能、无障碍与实战技巧。下面都是真实播放，不是截图。', body);
}

// ---------- 动效控制 ----------
const QUINT = 'cubic-bezier(0.23, 1, 0.32, 1)';

function parseBezier(v) {
  const m = /cubic-bezier\(([^)]+)\)/.exec(v);
  if (m) return m[1].split(',').map(Number);
  return ({ ease: [0.25, 0.1, 0.25, 1], linear: [0, 0, 1, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1] })[v] || [0.25, 0.1, 0.25, 1];
}
function curveSVG(v) {
  const [x1, y1, x2, y2] = parseBezier(v);
  const X = (p) => (p * 100).toFixed(1), Y = (p) => (100 - p * 100).toFixed(1);
  return `<svg class="curve" viewBox="-4 -10 108 120" preserveAspectRatio="none" aria-hidden="true">
    <line class="ax" x1="0" y1="100" x2="100" y2="100"/><line class="ax" x1="0" y1="0" x2="0" y2="100"/>
    <path class="cv" d="M0,100 C ${X(x1)},${Y(y1)} ${X(x2)},${Y(y2)} 100,0"/></svg>`;
}

function wireMotion() {
  document.querySelectorAll('[data-demo]').forEach((card) => {
    const kind = card.dataset.demo;
    let play = () => {};
    if (kind === 'easing' || kind === 'easefam' || kind === 'flow') {
      play = () => card.querySelectorAll('.easing-track').forEach((tr) => {
        const ball = tr.querySelector('.ball');
        const w = Math.max(0, tr.clientWidth - 24 - 12);
        ball.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${w}px)` }],
          { duration: 1100, easing: tr.dataset.easing, fill: 'forwards' });
      });
    } else if (kind === 'paired') {
      play = () => {
        const ov = card.querySelector('[data-role="p-overlay"]');
        const md = card.querySelector('[data-role="p-modal"]');
        ov.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: QUINT, fill: 'forwards' });
        md.animate([{ opacity: 0, transform: 'translateY(12px) scale(0.96)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 240, easing: QUINT, fill: 'forwards' });
      };
    } else if (kind === 'spring') {
      play = () => card.querySelectorAll('.easing-track').forEach((tr) => {
        const ball = tr.querySelector('.ball');
        const w = Math.max(0, tr.clientWidth - 24 - 12);
        if (ball.dataset.spring === 'spring') {
          ball.animate([
            { transform: 'translateX(0)', offset: 0 },
            { transform: `translateX(${w * 1.08}px)`, offset: 0.55 },
            { transform: `translateX(${w * 0.97}px)`, offset: 0.78 },
            { transform: `translateX(${w}px)`, offset: 1 },
          ], { duration: 900, easing: 'cubic-bezier(0.34,1.1,0.64,1)', fill: 'forwards' });
        } else {
          ball.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${w}px)` }], { duration: 900, easing: QUINT, fill: 'forwards' });
        }
      });
    } else if (kind === 'perf') {
      play = () => {
        const good = card.querySelector('[data-perf="good"]');
        const bad = card.querySelector('[data-perf="bad"]');
        good.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(180px)' }, { transform: 'translateX(0)' }], { duration: 1600, easing: 'cubic-bezier(0.645,0.045,0.355,1)' });
        bad.animate([{ width: '40px' }, { width: '200px' }, { width: '40px' }], { duration: 1600, easing: 'cubic-bezier(0.645,0.045,0.355,1)' });
      };
    } else if (kind === 'origin') {
      play = () => card.querySelectorAll('.origin-pop').forEach((p) => {
        p.animate([{ opacity: 0, transform: 'scale(0.85)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 280, easing: QUINT, fill: 'forwards' });
      });
    } else if (kind === 'entrance') {
      play = () => {
        const before = card.querySelector('[data-role="before"]');
        const after = card.querySelector('[data-role="after"]');
        before.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 400, easing: 'cubic-bezier(0.4,0,1,1)', fill: 'forwards' });
        after.animate([{ transform: 'scale(0.95)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 200, easing: QUINT, fill: 'forwards' });
      };
    } else if (kind === 'duration') {
      play = () => card.querySelectorAll('[data-dur]').forEach((d) => {
        d.animate([{ transform: 'translateY(28px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: +d.dataset.dur, easing: QUINT, fill: 'forwards' });
      });
    } else if (kind === 'reduced') {
      const mover = card.querySelector('[data-role="reduce"]');
      const cb = card.querySelector('[data-reduce]');
      play = () => {
        if (cb.checked) { mover.style.transform = 'translateX(0)'; return; }
        mover.animate([{ transform: 'translateX(-90px)' }, { transform: 'translateX(90px)' }, { transform: 'translateX(0)' }],
          { duration: 1400, easing: 'cubic-bezier(0.645,0.045,0.355,1)' });
      };
      cb.addEventListener('change', play);
    }
    const replay = card.querySelector('[data-replay]');
    if (replay) replay.addEventListener('click', play);
    const prev = players.get(card) || [];
    players.set(card, [...prev, play]);
  });
}

// ---------- 导航 / 主题 / 滚动 ----------
function renderNav() {
  const nav = $('#nav');
  const glyph = new Map(state.icons.map((i) => [i.name, i.ch]));
  nav.innerHTML = '<div class="nav-label">浏览</div>' +
    NAV.map((n) => {
      const ch = n.icon && glyph.get(n.icon);
      const mark = ch ? `<span class="nav-ico">${esc(ch)}</span>` : '<span class="dot"></span>';
      return `<a href="#${n.id}" data-nav="${n.id}">${mark}${n.label}</a>`;
    }).join('');
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById(a.dataset.nav)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
}

function initTheme() {
  const tg = $('#theme-toggle');
  tg.addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if (!btn) return;
    document.documentElement.dataset.theme = btn.dataset.theme;
    tg.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
    rebuildColorBody();
  });
}

function initScrollSpy() {
  const links = new Map([...document.querySelectorAll('[data-nav]')].map((a) => [a.dataset.nav, a]));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) {
      links.forEach((a) => a.classList.remove('active'));
      links.get(e.target.id)?.classList.add('active');
    }
  }, { rootMargin: '-20% 0px -70% 0px' });
  NAV.forEach((n) => { const s = document.getElementById(n.id); if (s) io.observe(s); });
}

boot();
