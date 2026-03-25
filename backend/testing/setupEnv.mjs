import { initializeRuntimeEnv } from '../config/env/runtime.js';

process.env.APP_ENV = 'test';
await initializeRuntimeEnv();
