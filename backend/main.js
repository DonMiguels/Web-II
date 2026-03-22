import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import Server from './src/server/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envDir = path.resolve(__dirname, '../env');
const envName = process.env.NODE_ENV || 'development';
const envOnlyFile = process.env.ENV_ONLY_FILE;
const envOnlyMode = (process.env.ENV_ONLY_MODE || 'false') === 'true';

const envFiles = envOnlyFile
	? [envOnlyFile]
	: envOnlyMode
		? [`.env.${envName}`]
		: [
				`.env.${envName}`,
				'.env',
				'server.env',
				'db.env',
				'auth.env',
				'session.env',
				'services.env',
				'frontend.env',
				'docker.env',
			];

for (const filename of envFiles) {
	const filepath = path.join(envDir, filename);
	if (fs.existsSync(filepath)) {
		dotenv.config({ path: filepath, override: true });
	}
}

const server = new Server();

server.start();
