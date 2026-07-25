import Server from './src/server/server.js';

/**
 * @file Punto de entrada del backend.
 * @description Instancia el servidor Express e inicia el proceso de escucha.
 */

const server = new Server();

server.start();
