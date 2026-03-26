import { jest } from '@jest/globals';
import Dispatcher from '../../src/dispatcher/dispatcher.js';

describe('Dispatcher response sanitizer routing', () => {
  beforeEach(() => {
    Dispatcher.instance = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('uses error sanitizer route when execution returns status >= 400', async () => {
    const dispatcher = new Dispatcher();

    const sanitizeSpy = jest.fn((payload) => ({ cleanedPayload: payload }));
    dispatcher.sanitizer = { sanitizePayload: sanitizeSpy };

    dispatcher.session = {
      authenticate: () => true,
      getUserId: () => 42,
    };

    dispatcher.security = {
      hasUserProfile: () => true,
      resolveTransaction: () => ({
        subsystem: 'Loans',
        class: 'Loan',
        method: 'deleteLoan',
      }),
      hasPermission: () => true,
      execute: jest.fn().mockResolvedValue({
        statusCode: 409,
        message: 'Bloqueado',
        error: { code: 'HARD_DELETE_BLOCKED' },
      }),
    };

    const result = await dispatcher.toProccess({
      body: {
        lang: 'es',
        transaction_id: 'tx-test',
        profile: 'admin',
        data: {},
      },
    });

    expect(result.statusCode).toBe(409);
    expect(sanitizeSpy).toHaveBeenCalledWith(expect.any(Object), {
      routeKey: 'dispatcher.response.error',
    });
  });

  test('uses success sanitizer route when execution returns status < 400', async () => {
    const dispatcher = new Dispatcher();

    const sanitizeSpy = jest.fn((payload) => ({ cleanedPayload: payload }));
    dispatcher.sanitizer = { sanitizePayload: sanitizeSpy };

    dispatcher.session = {
      authenticate: () => true,
      getUserId: () => 7,
    };

    dispatcher.security = {
      hasUserProfile: () => true,
      resolveTransaction: () => ({
        subsystem: 'Reports',
        class: 'SolvencyReport',
        method: 'generate',
      }),
      hasPermission: () => true,
      execute: jest.fn().mockResolvedValue({
        statusCode: 200,
        message: 'OK',
        data: { total: 1 },
      }),
    };

    const result = await dispatcher.toProccess({
      body: {
        lang: 'es',
        transaction_id: 'tx-ok',
        profile: 'admin',
        data: {},
      },
    });

    expect(result.statusCode).toBe(200);
    expect(sanitizeSpy).toHaveBeenCalledWith(expect.any(Object), {
      routeKey: 'dispatcher.response.success',
    });
  });
});
