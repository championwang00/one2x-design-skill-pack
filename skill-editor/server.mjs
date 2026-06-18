#!/usr/bin/env node
// One2X Skill 可视化预览器 —— 零依赖本地服务（只读）
// 读取仓库内的 SKILL.md / design.md / tokens 等文件，提供可视化预览 UI。
// 启动: node skill-editor/server.mjs  (或 npm --prefix skill-editor start)

import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join, relative, sep, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..'); // 仓库根目录
const PUBLIC = join(HERE, 'public');
const PORT = Number(process.env.PORT) || 4178;

// 仅允许编辑这些类型/位置的文件，避免误改无关文件。
const EDITABLE_EXT = new Set(['.md', '.css', '.mdc', '.txt']);
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'skill-editor']);

function insideRoot(absPath) {
  const rel = relative(ROOT, absPath);
  return rel && !rel.startsWith('..') && !resolve(ROOT, rel).includes(`${sep}..${sep}`);
}

function resolveSafe(relPath) {
  const abs = resolve(ROOT, relPath);
  if (!insideRoot(abs)) throw new Error('path escapes repository root');
  return abs;
}

async function walk(dir, acc) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.cursor') {
      // 允许进入 .cursor，但跳过其它隐藏目录
      if (entry.isDirectory() && entry.name !== '.cursor') continue;
    }
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      await walk(abs, acc);
    } else if (EDITABLE_EXT.has(extname(entry.name))) {
      acc.push(abs);
    }
  }
  return acc;
}

function classify(relPath) {
  if (/\.cursor\/skills\/.+\/SKILL\.md$/.test(relPath)) return 'skill';
  if (relPath === 'design.md' || relPath === 'DESIGN.md') return 'spec';
  if (relPath.startsWith('tokens/')) return 'tokens';
  if (/\.cursor\/skills\//.test(relPath)) return 'reference';
  return 'other';
}

async function listFiles() {
  const all = await walk(ROOT, []);
  const files = [];
  for (const abs of all) {
    const rel = relative(ROOT, abs).split(sep).join('/');
    const info = await stat(abs);
    files.push({ path: rel, group: classify(rel), size: info.size, mtime: info.mtimeMs });
  }
  // skill 在前，按组与路径排序
  const order = { skill: 0, spec: 1, tokens: 2, reference: 3, other: 4 };
  files.sort((a, b) => (order[a.group] - order[b.group]) || a.path.localeCompare(b.path));
  return files;
}

// —— 极简 frontmatter 解析（仅用于展示 name/description；保存时按原样回写正文）——
function parseDoc(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!fmMatch) return { frontmatter: '', body: content, hasFrontmatter: false };
  const frontmatter = fmMatch[1];
  const body = content.slice(fmMatch[0].length);
  return { frontmatter, body, hasFrontmatter: true };
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Cache-Control': 'no-store', ...headers });
  res.end(body);
}

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8' });
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.woff': 'font/woff', '.otf': 'font/otf' };

async function serveStatic(res, urlPath) {
  const name = urlPath === '/' ? '/index.html' : urlPath;
  const abs = join(PUBLIC, name.replace(/^\//, ''));
  if (!abs.startsWith(PUBLIC) || !existsSync(abs)) return send(res, 404, 'Not found');
  const data = await readFile(abs);
  send(res, 200, data, { 'Content-Type': MIME[extname(abs)] || 'application/octet-stream' });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const path = url.pathname;

    if (req.method === 'GET' && path === '/api/list') {
      return sendJson(res, 200, { root: ROOT, files: await listFiles() });
    }

    if (req.method === 'GET' && path === '/api/file') {
      const rel = url.searchParams.get('path') || '';
      const abs = resolveSafe(rel);
      if (!EDITABLE_EXT.has(extname(abs))) return sendJson(res, 400, { error: 'unsupported file type' });
      const content = await readFile(abs, 'utf8');
      const { frontmatter, body, hasFrontmatter } = parseDoc(content);
      const info = await stat(abs);
      return sendJson(res, 200, { path: rel, content, frontmatter, body, hasFrontmatter, mtime: info.mtimeMs });
    }

    if (path.startsWith('/api/')) return sendJson(res, 404, { error: 'unknown endpoint' });

    return serveStatic(res, path);
  } catch (err) {
    sendJson(res, 500, { error: String(err && err.message || err) });
  }
});

server.listen(PORT, () => {
  console.log(`\nOne2X Skill Visualizer`);
  console.log(`  repo: ${ROOT}`);
  console.log(`  open: http://localhost:${PORT}\n`);
});
