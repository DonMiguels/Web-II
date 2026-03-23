import express from 'express';
import Dispatcher from './dispatcher.js';
import { createSanitizer } from '../sanitizer/sanitizer.js';

const router = express.Router();
const dispatcher = new Dispatcher();
const sanitizer = createSanitizer();

router.post('/', async (req, res) => {
  try {
    const sanitizeResult = sanitizer.sanitizePayload(req.body || {}, {
      routeKey: 'dispatcher.root',
      forceIncludePaths: [],
    });

    req.body = sanitizeResult.cleanedPayload;

    if (sanitizeResult.rejected) {
      return res.status(sanitizeResult.response.statusCode).json({
        code: sanitizeResult.response.code,
        message: sanitizeResult.response.message,
        fields: sanitizeResult.response.fields,
        rules: sanitizeResult.response.rules,
      });
    }

    const result = await dispatcher.toProccess(req);
    const statusCode = result?.statusCode || 200;
    return res.status(statusCode).json(result);
  } catch (error) {
    console.error('Error crítico en el endpoint del Dispatcher:', error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Error interno del servidor en el manejador de rutas',
    });
  }
});

export default router;
