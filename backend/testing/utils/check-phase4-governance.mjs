import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import {
  PHASE4_HARD_DELETE_WHITELIST,
  PHASE4_SOFT_DELETE_REQUIRED_KEYS,
} from './phase4-governance-config.mjs';

const queriesPath = path.resolve(process.cwd(), 'config/queries.yaml');

function loadQueryCatalog() {
  const raw = fs.readFileSync(queriesPath, 'utf8');
  return yaml.parse(raw) || {};
}

function hasHardDelete(statement) {
  return /\bDELETE\s+FROM\b/i.test(String(statement || ''));
}

function getDeleteQueryKeys(queries) {
  return Object.entries(queries)
    .filter(([, definition]) => hasHardDelete(definition?.query))
    .map(([queryKey]) => queryKey)
    .sort();
}

function formatList(values) {
  return values.length ? values.join(', ') : '(none)';
}

function main() {
  const queries = loadQueryCatalog();
  const failures = [];

  for (const key of PHASE4_SOFT_DELETE_REQUIRED_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(queries, key)) {
      failures.push(`Missing expected query key for soft-delete: ${key}`);
      continue;
    }

    const statement = queries[key]?.query;
    if (hasHardDelete(statement)) {
      failures.push(`Query ${key} reverted to hard-delete (DELETE FROM).`);
    }
  }

  const currentDeleteKeys = getDeleteQueryKeys(queries);
  const unexpectedDeleteKeys = currentDeleteKeys.filter(
    (key) => !PHASE4_HARD_DELETE_WHITELIST.includes(key),
  );
  const missingDeleteWhitelistKeys = PHASE4_HARD_DELETE_WHITELIST.filter(
    (key) => !currentDeleteKeys.includes(key),
  );

  if (unexpectedDeleteKeys.length) {
    failures.push(
      `Unexpected hard-delete keys: ${formatList(unexpectedDeleteKeys)}`,
    );
  }

  if (missingDeleteWhitelistKeys.length) {
    failures.push(
      `Whitelisted hard-delete keys missing in catalog: ${formatList(missingDeleteWhitelistKeys)}`,
    );
  }

  if (failures.length) {
    console.error('Phase 4 governance check failed.');
    for (const failure of failures) {
      console.error(` - ${failure}`);
    }
    process.exit(1);
  }

  console.log('Phase 4 governance check passed.');
  console.log(` - Hard-delete keys in whitelist: ${currentDeleteKeys.length}`);
  console.log(
    ` - Soft-delete guarded keys: ${PHASE4_SOFT_DELETE_REQUIRED_KEYS.length}`,
  );
}

main();
