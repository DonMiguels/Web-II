import express from 'express';
import Dispatcher from './dispatcher.js';

/**
 * @file Rutas Express del despachador de transacciones.
 * @description Expone el endpoint POST `/` que delega en `Dispatcher.toProccess`.
 * @module dispatcherRoutes
 */

const router = express.Router();
const dispatcher = new Dispatcher();

/**
 * @description Procesa una transacción de negocio autenticada vía el despachador.
 * @route POST /
 * @param {import('express').Request} req - Solicitud con cuerpo de transacción.
 * @param {import('express').Response} res - Respuesta JSON con resultado o error.
 * @returns {Promise<void>}
 */
router.post('/', async (req, res) => {
    try {
        const result = await dispatcher.toProccess(req);
        const statusCode = result?.statusCode || 200;
        return res.status(statusCode).json(result);

    } catch (error) {
        console.error('Error crítico en el endpoint del Dispatcher:', error);
        return res.status(500).json({
            statusCode: 500,
            message: dispatcher.config.getMessage(
                req?.body?.lang || dispatcher.config.LANGUAGE,
                'dispatcher_route_error',
            ),
        });
    }
});

export default router;
