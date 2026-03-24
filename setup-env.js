#!/usr/bin/env node
import { promises as fs } from 'fs';
import fsSync from 'fs';
import path from 'path';
import configPathCatalog from './backend/config/env/config-paths.json' with { type: 'json' };

const forceOverwrite = process.argv.includes('--force');

const DEFAULT_ENV_ALLOWED_VALUES = {
  APP_ENV: ['development', 'test', 'production'],
  APP_LOG_LEVEL: ['debug', 'info', 'warn', 'error', 'fatal'],
  CORS_ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  CORS_ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
};

const DEFAULT_SCHEMA_OVERRIDES = {
  defaults: {
    APP_ENV: 'development',
    APP_NAME: 'web-ii',
    APP_LOG_LEVEL: 'info',
  },
};

const resolveFromRoot = (rootDir, relativePath) =>
  path.resolve(rootDir, relativePath);

function loadEnvAllowedValues(rootDir) {
  try {
    const filePath = resolveFromRoot(
      rootDir,
      configPathCatalog.runtimeConfigFiles.allowedValues,
    );
    if (!fsSync.existsSync(filePath)) {
      return DEFAULT_ENV_ALLOWED_VALUES;
    }

    const raw = fsSync.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ENV_ALLOWED_VALUES,
      ...parsed,
    };
  } catch {
    return DEFAULT_ENV_ALLOWED_VALUES;
  }
}

function loadSchemaOverrides(rootDir) {
  try {
    const filePath = resolveFromRoot(
      rootDir,
      configPathCatalog.runtimeConfigFiles.schemaOverrides,
    );

    if (!fsSync.existsSync(filePath)) {
      return DEFAULT_SCHEMA_OVERRIDES;
    }

    const raw = fsSync.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SCHEMA_OVERRIDES,
      ...parsed,
      defaults: {
        ...DEFAULT_SCHEMA_OVERRIDES.defaults,
        ...(parsed.defaults || {}),
      },
    };
  } catch {
    return DEFAULT_SCHEMA_OVERRIDES;
  }
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function ensureFile(filePath, content) {
  try {
    if (!forceOverwrite) {
      await fs.access(filePath);
      console.log(`[skip] Ya existe: ${filePath}`);
      return;
    }
  } catch {}

  await fs.writeFile(filePath, content, 'utf8');
  console.log(`[ok] Creado: ${filePath}`);
}

function renderServerEnv(profile, envAllowedValues) {
  const isProd = profile === 'production';
  const host = isProd ? '0.0.0.0' : '127.0.0.1';

  const corsMethods = (
    envAllowedValues.CORS_ALLOWED_METHODS ||
    DEFAULT_ENV_ALLOWED_VALUES.CORS_ALLOWED_METHODS
  )
    .join(',')
    .trim();

  const corsHeaders = (
    envAllowedValues.CORS_ALLOWED_HEADERS ||
    DEFAULT_ENV_ALLOWED_VALUES.CORS_ALLOWED_HEADERS
  )
    .join(',')
    .trim();

  return (
    '# Variables de servidor y CORS\n' +
    `SERVER_BIND_PROTOCOL=http\n` +
    `SERVER_BIND_HOST=${host}\n` +
    'SERVER_BIND_PORT=3000\n' +
    'SERVER_MESSAGES_LANGUAGE=es\n' +
    'CORS_ALLOWED_ORIGINS=http://localhost:5173\n' +
    `CORS_ALLOWED_METHODS=${corsMethods}\n` +
    `CORS_ALLOWED_HEADERS=${corsHeaders}\n` +
    'CORS_ALLOW_CREDENTIALS=true\n'
  );
}

function renderDbEnv() {
  return (
    '# Variables de base de datos\n' +
    'DB_HOST=127.0.0.1\n' +
    'DB_PORT=5432\n' +
    'DB_NAME=webii\n' +
    'DB_USER=app_user\n' +
    'DB_PASSWORD=app_password_local\n' +
    'DB_SSL=false\n' +
    'DB_SSL_REJECT_UNAUTHORIZED=true\n' +
    'DB_POOL_MAX=10\n' +
    'DB_POOL_IDLE_TIMEOUT_MS=30000\n' +
    'DB_POOL_CONNECTION_TIMEOUT_MS=2000\n' +
    'DB_SCHEMA_DEFAULT=public\n'
  );
}

function renderAuthEnv() {
  return (
    '# Variables JWT\n' +
    'AUTH_JWT_SECRET=cambia_este_jwt_secret_local\n' +
    'AUTH_JWT_EXPIRES_IN=5m\n' +
    'AUTH_JWT_ISSUER=web-ii-api\n' +
    'AUTH_JWT_AUDIENCE=web-ii-frontend\n' +
    'AUTH_JWT_ALGORITHM=HS256\n'
  );
}

function renderSessionEnv(profile) {
  const isProd = profile === 'production';
  return (
    '# Variables de sesion\n' +
    'SESSION_SECRET=cambia_este_session_secret_local\n' +
    'SESSION_COOKIE_NAME=webii.sid\n' +
    `SESSION_COOKIE_SECURE=${isProd ? 'true' : 'false'}\n` +
    'SESSION_COOKIE_HTTP_ONLY=true\n' +
    'SESSION_COOKIE_SAME_SITE=lax\n' +
    'SESSION_COOKIE_MAX_AGE_SECONDS=300\n' +
    'SESSION_RESAVE=false\n' +
    'SESSION_SAVE_UNINITIALIZED=false\n'
  );
}

function renderServicesEnv() {
  return (
    '# Variables de integraciones externas\n' +
    'MAIL_RESEND_API_KEY=re_xxx_reemplazar\n' +
    'MAIL_DEFAULT_FROM=no-reply@local.dev\n' +
    'MAIL_REPLY_TO=soporte@local.dev\n' +
    'MAIL_ENABLED=true\n'
  );
}

function renderFrontendEnv(profile) {
  return (
    '# Variables de frontend\n' +
    'FRONT_API_URL=http://localhost:3000/user\n' +
    'FRONT_PUBLIC_URL=http://localhost:5173\n' +
    'FRONT_APP_NAME=Web II\n' +
    `FRONT_APP_ENV=${profile}\n`
  );
}

function renderDockerEnv() {
  return (
    '# Variables de Docker Compose\n' +
    'POSTGRES_IMAGE=postgres:16\n' +
    'PGADMIN_IMAGE=dpage/pgadmin4:8.12\n' +
    'BACKUP_IMAGE=prodrigestivill/postgres-backup-local:16\n' +
    'POSTGRES_CONTAINER_NAME=uni_postgres\n' +
    'PGADMIN_CONTAINER_NAME=uni_pgadmin\n' +
    'BACKUP_CONTAINER_NAME=uni_pg_backups\n' +
    'POSTGRES_BIND_IP=127.0.0.1\n' +
    'POSTGRES_BIND_PORT=5431\n' +
    'PGADMIN_BIND_IP=127.0.0.1\n' +
    'PGADMIN_BIND_PORT=5050\n' +
    'POSTGRES_USER=admin_uni\n' +
    'POSTGRES_PASSWORD=cambia_password_local\n' +
    'POSTGRES_DB=postgres\n' +
    'POSTGRES_MULTIPLE_DATABASES=webii\n' +
    'RESTORE_FROM_BACKUP=false\n' +
    'PGADMIN_DEFAULT_EMAIL=admin@local.dev\n' +
    'PGADMIN_DEFAULT_PASSWORD=cambia_password_pgadmin\n' +
    'BACKUP_ON_START=true\n' +
    'BACKUP_ON_STOP=true\n' +
    'BACKUP_KEEP_DAYS=7\n' +
    'SCHEDULE=@daily\n' +
    'HEALTHCHECK_PORT=8080\n'
  );
}

async function main() {
  const root = process.cwd();
  const envDir = resolveFromRoot(root, configPathCatalog.paths.envDirectory);
  const envAllowedValues = loadEnvAllowedValues(root);
  const schemaOverrides = loadSchemaOverrides(root);

  await ensureDir(envDir);

  await ensureFile(
    path.join(envDir, '.env'),
    '# Configuracion global base\n' +
      `APP_ENV=${schemaOverrides.defaults.APP_ENV}\n` +
      `APP_NAME=${schemaOverrides.defaults.APP_NAME}\n` +
      `APP_LOG_LEVEL=${schemaOverrides.defaults.APP_LOG_LEVEL}\n`,
  );

  const profiles = envAllowedValues.APP_ENV || [
    'development',
    'test',
    'production',
  ];
  for (const profile of profiles) {
    const profileDir = path.join(envDir, profile);
    await ensureDir(profileDir);

    await ensureFile(
      path.join(profileDir, 'server.env'),
      renderServerEnv(profile, envAllowedValues),
    );
    await ensureFile(path.join(profileDir, 'db.env'), renderDbEnv());
    await ensureFile(path.join(profileDir, 'auth.env'), renderAuthEnv());
    await ensureFile(
      path.join(profileDir, 'session.env'),
      renderSessionEnv(profile),
    );
    await ensureFile(
      path.join(profileDir, 'services.env'),
      renderServicesEnv(),
    );
    await ensureFile(
      path.join(profileDir, 'frontend.env'),
      renderFrontendEnv(profile),
    );
    await ensureFile(path.join(profileDir, 'docker.env'), renderDockerEnv());
  }

  console.log('\nListo: arquitectura de entornos inicializada por perfiles.');
  console.log('Perfil activo por defecto: APP_ENV=development (env/.env).');
}

main().catch((err) => {
  console.error('[error]', err.message);
  process.exit(1);
});
