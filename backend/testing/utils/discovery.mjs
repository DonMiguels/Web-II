import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import yaml from 'yaml';

const repoBoRoot = path.resolve(process.cwd(), 'src/bo');
const queriesPath = path.resolve(process.cwd(), 'config/queries.yaml');

function walk(dirPath, acc = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, acc);
      continue;
    }
    if (entry.isFile() && fullPath.endsWith('.js')) {
      acc.push(fullPath);
    }
  }
  return acc;
}

export function loadQueries() {
  const raw = fs.readFileSync(queriesPath, 'utf8');
  return yaml.parse(raw) || {};
}

export function buildSampleParams(structureParams = {}) {
  const params = {};
  for (const [key, type] of Object.entries(structureParams || {})) {
    const t = String(type).toLowerCase();
    if (t === 'int' || t === 'number') {
      params[key] = 1;
      continue;
    }
    if (t === 'float') {
      params[key] = 1.5;
      continue;
    }
    if (t === 'boolean') {
      params[key] = true;
      continue;
    }
    if (key.toLowerCase().includes('email')) {
      params[key] = 'test@example.com';
      continue;
    }
    if (key.toLowerCase().includes('date')) {
      params[key] = '2025-01-01';
      continue;
    }
    if (key.toLowerCase().includes('password')) {
      params[key] = 'Secret123*';
      continue;
    }
    if (key.toLowerCase().includes('code')) {
      params[key] = 'CODE-1';
      continue;
    }
    params[key] = 'test';
  }
  return params;
}

export async function discoverBoMethods() {
  const allJs = walk(repoBoRoot);
  const methods = [];

  for (const filePath of allJs) {
    if (!filePath.includes(`${path.sep}methods${path.sep}`)) continue;

    // Keep only new BO architecture: src/bo/<Subsystem>/<Class>/methods/*.js
    const rel = path.relative(repoBoRoot, filePath).split(path.sep);
    if (rel.length < 4) continue;
    const [subsystem] = rel;
    if (['class', 'method', 'subsystem'].includes(subsystem)) continue;

    const source = fs.readFileSync(filePath, 'utf8');
    const nameQueryMatch = source.match(/nameQuery:\s*'([^']+)'/);
    const nameQuery = nameQueryMatch ? nameQueryMatch[1] : null;

    const moduleUrl = pathToFileURL(filePath).href;
    const mod = await import(moduleUrl);

    const fileBase = path.basename(filePath, '.js');
    let methodName = Object.prototype.hasOwnProperty.call(mod, fileBase)
      ? fileBase
      : null;

    if (!methodName) {
      methodName = Object.keys(mod).find(
        (key) => typeof mod[key] === 'function',
      );
    }

    if (!methodName || typeof mod[methodName] !== 'function') continue;

    methods.push({
      filePath,
      subsystem,
      methodName,
      methodFn: mod[methodName],
      nameQuery,
    });
  }

  return methods;
}
