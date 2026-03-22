#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

async function ensureFileFromExample(examplePath, targetPath) {
  try {
    await fs.access(targetPath);
    console.log(`[skip] Ya existe: ${targetPath}`);
  } catch {
    const content = await fs.readFile(examplePath, 'utf8');
    const header =
      '# Archivo generado automaticamente desde .env.example\n' +
      '# Completa los valores locales antes de ejecutar la app\n\n';
    await fs.writeFile(targetPath, header + content, 'utf8');
    console.log(`[ok] Creado: ${targetPath}`);
  }
}

async function ensureComponentFiles(envDir) {
  const files = [
    'db.env',
    'server.env',
    'auth.env',
    'session.env',
    'services.env',
    'frontend.env',
    'docker.env',
  ];

  for (const name of files) {
    const full = path.join(envDir, name);
    try {
      await fs.access(full);
    } catch {
      await fs.writeFile(
        full,
        `# ${name}\n# Archivo opcional por dominio\n`,
        'utf8',
      );
      console.log(`[ok] Creado: ${full}`);
    }
  }
}

async function main() {
  const root = process.cwd();
  const envDir = path.join(root, 'env');
  const example = path.join(envDir, '.env.example');
  const dev = path.join(envDir, '.env.development');
  const test = path.join(envDir, '.env.test');

  try {
    await fs.access(envDir);
  } catch {
    throw new Error(`No existe carpeta env en: ${envDir}`);
  }

  try {
    await fs.access(example);
  } catch {
    throw new Error(`No existe archivo base: ${example}`);
  }

  await ensureFileFromExample(example, dev);
  await ensureFileFromExample(example, test);
  await ensureComponentFiles(envDir);

  console.log('\nListo: entorno inicializado.');
  console.log(
    'Siguiente paso: completar valores reales en env/.env.development y env/.env.test',
  );
}

main().catch((err) => {
  console.error('[error]', err.message);
  process.exit(1);
});
