import {
  initializeRuntimeEnv,
  EnvValidationError,
  formatEnvValidationErrors,
} from './config/env/runtime.js';

try {
  await initializeRuntimeEnv();
} catch (error) {
  if (error instanceof EnvValidationError) {
    console.error(formatEnvValidationErrors(error.errors));
  } else {
    console.error(
      '[env/runtime] Unexpected error while loading environment:',
      error,
    );
  }
  process.exit(1);
}

const { default: Server } = await import('./src/server/server.js');
const server = new Server();

server.start();
