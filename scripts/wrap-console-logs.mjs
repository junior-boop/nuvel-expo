#!/usr/bin/env node
/**
 * Wraps console.log / console.info / console.debug calls with `if (__DEV__)`.
 * Leaves console.warn and console.error untouched.
 * Skips calls already wrapped (preceded on the same line by `if (__DEV__)` or `__DEV__ &&`).
 * Handles multi-line calls via paren balancing, respecting strings/comments/template literals.
 *
 * Usage: node scripts/wrap-console-logs.mjs [--dry] [path]
 */
import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.argv.find(a => !a.startsWith('--') && a !== process.argv[0] && a !== process.argv[1]) || 'src';
const DRY = process.argv.includes('--dry');
const TARGET_METHODS = new Set(['log', 'info', 'debug']);
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx']);

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (e === 'node_modules' || e.startsWith('.')) continue;
      walk(p, out);
    } else if (EXTS.has(extname(e))) {
      out.push(p);
    }
  }
  return out;
}

// Find end of a call expression starting at the '(' index. Returns index of matching ')'.
// Skips strings, template literals, regex, line/block comments.
function findCallEnd(src, openIdx) {
  let i = openIdx + 1;
  let depth = 1;
  const n = src.length;
  while (i < n && depth > 0) {
    const c = src[i];
    const c2 = src[i + 1];
    // line comment
    if (c === '/' && c2 === '/') {
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    // block comment
    if (c === '/' && c2 === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    // string
    if (c === '"' || c === "'") {
      const quote = c;
      i++;
      while (i < n) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === quote) { i++; break; }
        i++;
      }
      continue;
    }
    // template literal
    if (c === '`') {
      i++;
      while (i < n) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === '`') { i++; break; }
        if (src[i] === '$' && src[i + 1] === '{') {
          i += 2;
          let td = 1;
          while (i < n && td > 0) {
            if (src[i] === '{') td++;
            else if (src[i] === '}') td--;
            if (td === 0) { i++; break; }
            // recurse simply: handle strings inside ${...}
            if (src[i] === '"' || src[i] === "'" || src[i] === '`') {
              const q = src[i]; i++;
              while (i < n) {
                if (src[i] === '\\') { i += 2; continue; }
                if (src[i] === q) { i++; break; }
                i++;
              }
              continue;
            }
            i++;
          }
          continue;
        }
        i++;
      }
      continue;
    }
    if (c === '(') depth++;
    else if (c === ')') depth--;
    i++;
  }
  return i - 1; // index of closing ')'
}

function transform(src) {
  const re = /\bconsole\s*\.\s*(log|info|debug)\s*\(/g;
  let out = '';
  let last = 0;
  let count = 0;
  let m;
  while ((m = re.exec(src)) !== null) {
    const method = m[1];
    if (!TARGET_METHODS.has(method)) continue;
    const matchStart = m.index;
    const openParen = m.index + m[0].length - 1;
    // Check what's before on the same line — skip if already wrapped
    const lineStart = src.lastIndexOf('\n', matchStart) + 1;
    const before = src.slice(lineStart, matchStart);
    if (/__DEV__\s*&&\s*$/.test(before) || /if\s*\(\s*__DEV__\s*\)\s*$/.test(before)) {
      continue;
    }
    const endParen = findCallEnd(src, openParen);
    if (endParen >= src.length) continue;
    // Include trailing semicolon if present
    let stmtEnd = endParen + 1;
    if (src[stmtEnd] === ';') stmtEnd++;
    const call = src.slice(matchStart, stmtEnd);
    out += src.slice(last, matchStart);
    out += `if (__DEV__) ${call}`;
    last = stmtEnd;
    count++;
  }
  out += src.slice(last);
  return { out, count };
}

const files = walk(ROOT);
let totalFiles = 0;
let totalCount = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  if (!/console\s*\.\s*(log|info|debug)\s*\(/.test(src)) continue;
  const { out, count } = transform(src);
  if (count > 0 && out !== src) {
    totalFiles++;
    totalCount += count;
    if (!DRY) writeFileSync(f, out, 'utf8');
    console.log(`${DRY ? '[dry] ' : ''}${f}: ${count}`);
  }
}
console.log(`\n${DRY ? 'Would wrap' : 'Wrapped'} ${totalCount} calls across ${totalFiles} files.`);
