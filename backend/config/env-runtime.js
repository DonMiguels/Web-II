import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import configPathCatalog from './env-config-paths.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(
  __dirname,
  configPathCatalog.paths.repoRootFromRuntime,
);

const resolveRepoPath = (relativePath) => path.resolve(repoRoot, relativePath);
const envDir = resolveRepoPath(configPathCatalog.paths.envDirectory);

const ENV_ALLOWED_VALUES_PATH = resolveRepoPath(
  configPathCatalog.runtimeConfigFiles.allowedValues,
);
const ENV_SCHEMA_BASE_PATH = resolveRepoPath(
  configPathCatalog.runtimeConfigFiles.schemaBase,
);
const ENV_SCHEMA_OVERRIDES_PATH = resolveRepoPath(
  configPathCatalog.runtimeConfigFiles.schemaOverrides,
);

const readJsonFile = (filePath, fallbackValue) => {
  try {
    if (!fs.existsSync(filePath)) return fallbackValue;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(
      `[env-runtime] Failed to read JSON config: ${filePath}`,
      error,
    );
    return fallbackValue;
  }
};

const envAllowedValues = readJsonFile(ENV_ALLOWED_VALUES_PATH, {});
const schemaBase = readJsonFile(ENV_SCHEMA_BASE_PATH, []);
const schemaOverrides = readJsonFile(ENV_SCHEMA_OVERRIDES_PATH, {
  defaults: {},
  envDefaults: {},
});

const schema = schemaBase.map((baseRule) => {
  const normalizedRule = { ...baseRule };
  const allowedKey = normalizedRule.allowedFrom;

  if (allowedKey) {
    normalizedRule.allowed = envAllowedValues[allowedKey] || [];
  }

  if (schemaOverrides.defaults?.[normalizedRule.key] !== undefined) {
    normalizedRule.default = schemaOverrides.defaults[normalizedRule.key];
  }

  if (schemaOverrides.envDefaults?.[normalizedRule.key] !== undefined) {
    normalizedRule.defaultByEnv =
      schemaOverrides.envDefaults[normalizedRule.key];
  }

  delete normalizedRule.allowedFrom;
  return normalizedRule;
});

class EnvValidationError extends Error {
  constructor(errors) {
    super('Environment validation failed');
    this.name = 'EnvValidationError';
    this.errors = errors;
  }
}

let runtimeEnv = null;
let didLoadEnvFiles = false;

const normalizeBoolean = (rawValue) => {
  const lowerValue = String(rawValue).trim().toLowerCase();
  if (lowerValue === 'true') return true;
  if (lowerValue === 'false') return false;
  throw new Error('expected boolean true/false');
};

const normalizeInteger = (rawValue, min, max) => {
  const numericValue = Number(rawValue);
  if (!Number.isInteger(numericValue)) {
    throw new Error('expected integer');
  }
  if (typeof min === 'number' && numericValue < min) {
    throw new Error(`expected integer >= ${min}`);
  }
  if (typeof max === 'number' && numericValue > max) {
    throw new Error(`expected integer <= ${max}`);
  }
  return numericValue;
};

const normalizeString = (rawValue, minLength = 0) => {
  const normalized = String(rawValue).trim();
  if (normalized.length < minLength) {
    throw new Error(`expected string with min length ${minLength}`);
  }
  return normalized;
};

const normalizeEnum = (rawValue, allowedValues) => {
  const normalized = String(rawValue).trim();
  if (!allowedValues.includes(normalized)) {
    throw new Error(`expected one of [${allowedValues.join(', ')}]`);
  }
  return normalized;
};

const normalizeCsv = (rawValue) => {
  const values = String(rawValue)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (values.length === 0) {
    throw new Error('expected non-empty CSV list');
  }

  return values;
};

const normalizeCsvEnum = (rawValue, allowedValues) => {
  const allowedMap = new Map(
    allowedValues.map((allowed) => [allowed.toLowerCase(), allowed]),
  );

  const normalizedList = normalizeCsv(rawValue).map((entry) => {
    const canonical = allowedMap.get(entry.toLowerCase());
    return canonical || entry;
  });

  const invalid = normalizedList.filter(
    (entry) => !allowedValues.includes(entry),
  );
  if (invalid.length > 0) {
    throw new Error(
      `invalid CSV values [${invalid.join(', ')}], expected subset of [${allowedValues.join(', ')}]`,
    );
  }

  return normalizedList;
};

const normalizeValue = (rule, value) => {
  switch (rule.type) {
    case 'boolean':
      return normalizeBoolean(value);
    case 'integer':
      return normalizeInteger(value, rule.min, rule.max);
    case 'string':
      return normalizeString(value, rule.minLength || 0);
    case 'enum':
      return normalizeEnum(value, rule.allowed || []);
    case 'csv':
      return normalizeCsv(value);
    case 'csvEnum':
      return normalizeCsvEnum(value, rule.allowed || []);
    default:
      throw new Error(`unsupported schema type: ${rule.type}`);
  }
};

const formatForProcessEnv = (value) => {
  if (Array.isArray(value)) return value.join(',');
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
};

const getDefaultValue = (rule, knownValues) => {
  if (rule.defaultByEnv) {
    if (rule.defaultByEnv.key) {
      const fromKey = knownValues[rule.defaultByEnv.key];
      if (fromKey !== undefined && fromKey !== null && String(fromKey) !== '') {
        return fromKey;
      }
    }

    const appEnv = knownValues.APP_ENV;
    if (rule.defaultByEnv[appEnv] !== undefined) {
      return rule.defaultByEnv[appEnv];
    }
    if (rule.defaultByEnv.default !== undefined) {
      return rule.defaultByEnv.default;
    }
  }

  if (rule.default !== undefined) {
    return rule.default;
  }

  return undefined;
};

const loadEnvFiles = () => {
  if (didLoadEnvFiles) {
    return;
  }

  const appEnv = process.env.APP_ENV || 'development';
  process.env.APP_ENV = appEnv;

  const envFiles = configPathCatalog.envFilesByProfile.map(
    (relativeTemplate) => {
      const resolvedRelative = relativeTemplate.replace('{APP_ENV}', appEnv);
      return path.join(envDir, resolvedRelative);
    },
  );

  for (const filepath of envFiles) {
    if (fs.existsSync(filepath)) {
      dotenv.config({ path: filepath, override: true });
    }
  }

  didLoadEnvFiles = true;
};

const readRawValue = (rule) => {
  const value = process.env[rule.key];
  if (value !== undefined && value !== null && String(value).trim() !== '') {
    return value;
  }
  return undefined;
};

const buildRuntimeEnv = (normalized) => ({
  app: {
    env: normalized.APP_ENV,
    name: normalized.APP_NAME,
    logLevel: normalized.APP_LOG_LEVEL,
  },
  server: {
    bindProtocol: normalized.SERVER_BIND_PROTOCOL,
    bindHost: normalized.SERVER_BIND_HOST,
    bindPort: normalized.SERVER_BIND_PORT,
    messagesLanguage: normalized.SERVER_MESSAGES_LANGUAGE,
  },
  cors: {
    allowedOrigins: normalized.CORS_ALLOWED_ORIGINS,
    allowedMethods: normalized.CORS_ALLOWED_METHODS,
    allowedHeaders: normalized.CORS_ALLOWED_HEADERS,
    allowCredentials: normalized.CORS_ALLOW_CREDENTIALS,
  },
  session: {
    secret: normalized.SESSION_SECRET,
    cookieName: normalized.SESSION_COOKIE_NAME,
    cookieSecure: normalized.SESSION_COOKIE_SECURE,
    cookieHttpOnly: normalized.SESSION_COOKIE_HTTP_ONLY,
    cookieSameSite: normalized.SESSION_COOKIE_SAME_SITE,
    cookieMaxAgeSeconds: normalized.SESSION_COOKIE_MAX_AGE_SECONDS,
    cookieMaxAgeMs: normalized.SESSION_COOKIE_MAX_AGE_SECONDS * 1000,
    resave: normalized.SESSION_RESAVE,
    saveUninitialized: normalized.SESSION_SAVE_UNINITIALIZED,
  },
  auth: {
    jwtSecret: normalized.AUTH_JWT_SECRET,
    jwtExpiresIn: normalized.AUTH_JWT_EXPIRES_IN,
    jwtIssuer: normalized.AUTH_JWT_ISSUER,
    jwtAudience: normalized.AUTH_JWT_AUDIENCE,
    jwtAlgorithm: normalized.AUTH_JWT_ALGORITHM,
  },
  db: {
    host: normalized.DB_HOST,
    port: normalized.DB_PORT,
    name: normalized.DB_NAME,
    user: normalized.DB_USER,
    password: normalized.DB_PASSWORD,
    ssl: normalized.DB_SSL,
    sslRejectUnauthorized: normalized.DB_SSL_REJECT_UNAUTHORIZED,
    poolMax: normalized.DB_POOL_MAX,
    poolIdleTimeoutMs: normalized.DB_POOL_IDLE_TIMEOUT_MS,
    poolConnectionTimeoutMs: normalized.DB_POOL_CONNECTION_TIMEOUT_MS,
    schemaDefault: normalized.DB_SCHEMA_DEFAULT,
  },
  services: {
    mailResendApiKey: normalized.MAIL_RESEND_API_KEY,
    mailDefaultFrom: normalized.MAIL_DEFAULT_FROM,
    mailReplyTo: normalized.MAIL_REPLY_TO,
    mailEnabled: normalized.MAIL_ENABLED,
  },
  frontend: {
    apiUrl: normalized.FRONT_API_URL,
    publicUrl: normalized.FRONT_PUBLIC_URL,
    appName: normalized.FRONT_APP_NAME,
    appEnv: normalized.FRONT_APP_ENV,
  },
  raw: normalized,
});

export const initializeRuntimeEnv = () => {
  if (runtimeEnv) {
    return runtimeEnv;
  }

  loadEnvFiles();

  const normalizedValues = {};
  const errors = [];
  for (const rule of schema) {
    let finalValue = readRawValue(rule);

    if (finalValue === undefined) {
      finalValue = getDefaultValue(rule, normalizedValues);
    }

    if (finalValue === undefined && rule.required) {
      errors.push({
        key: rule.key,
        value: null,
        expected: `required ${rule.type}`,
      });
      continue;
    }

    if (finalValue === undefined) {
      normalizedValues[rule.key] = undefined;
      continue;
    }

    try {
      const parsedValue = normalizeValue(rule, finalValue);
      normalizedValues[rule.key] = parsedValue;
      process.env[rule.key] = formatForProcessEnv(parsedValue);
    } catch (error) {
      errors.push({
        key: rule.key,
        value: finalValue,
        expected: `${rule.type}${rule.allowed ? ` (${rule.allowed.join(', ')})` : ''}`,
        detail: error.message,
      });
    }
  }

  if (errors.length > 0) {
    throw new EnvValidationError(errors);
  }

  runtimeEnv = buildRuntimeEnv(normalizedValues);
  return runtimeEnv;
};

export const getRuntimeEnv = () => {
  return runtimeEnv || initializeRuntimeEnv();
};

export const formatEnvValidationErrors = (errors) => {
  const lines = ['[env-runtime] Environment validation failed:'];
  for (const issue of errors) {
    lines.push(
      `- ${issue.key}: value=${JSON.stringify(issue.value)} expected=${issue.expected}${issue.detail ? ` detail=${issue.detail}` : ''}`,
    );
  }
  lines.push('[env-runtime] Validation errors JSON:');
  lines.push(JSON.stringify(errors, null, 2));
  return lines.join('\n');
};

export { EnvValidationError };
