import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envDir = path.resolve(__dirname, '../env');
const appEnv = process.env.APP_ENV || 'development';
process.env.APP_ENV = appEnv;

const envFiles = [
  // Compatibilidad legacy temporal durante la migracion.
  path.join(envDir, 'server.env'),
  path.join(envDir, 'db.env'),
  path.join(envDir, 'auth.env'),
  path.join(envDir, 'session.env'),
  path.join(envDir, 'services.env'),
  path.join(envDir, 'frontend.env'),
  path.join(envDir, '.env'),
  path.join(envDir, appEnv, 'server.env'),
  path.join(envDir, appEnv, 'db.env'),
  path.join(envDir, appEnv, 'auth.env'),
  path.join(envDir, appEnv, 'session.env'),
  path.join(envDir, appEnv, 'services.env'),
  path.join(envDir, appEnv, 'frontend.env'),
];

for (const filepath of envFiles) {
  if (fs.existsSync(filepath)) {
    dotenv.config({ path: filepath, override: true });
  }
}

const { default: Server } = await import('./src/server/server.js');
const server = new Server();

server.start();
