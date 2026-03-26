import DBMS from '../../src/dbms/dbms.js';
import { jest } from '@jest/globals';
import {
  discoverBoMethods,
  buildSampleParams,
  loadQueries,
} from '../utils/discovery.mjs';

function buildMethodParams(methodMeta, structure) {
  const params = buildSampleParams(structure);

  // This bridge method validates legacy field names before touching DB.
  if (
    methodMeta.filePath.includes(
      'src\\bo\\Security\\User\\methods\\createUser.js',
    )
  ) {
    return {
      username: 'test_user',
      password: 'Secret123*',
      person_id: 1,
    };
  }

  return params;
}

describe('BO contract negative - all new methods', () => {
  let methods = [];
  let queryBackedMethods = [];
  let queries = {};

  beforeAll(async () => {
    methods = await discoverBoMethods();
    queryBackedMethods = methods.filter((m) => !!m.nameQuery);
    queries = loadQueries();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('discovery should find methods in new architecture', () => {
    expect(methods.length).toBeGreaterThan(0);
  });

  test('all methods should reject when DBMS fails', async () => {
    const initSpy = jest
      .spyOn(DBMS.prototype, 'init')
      .mockResolvedValue(undefined);
    const execSpy = jest
      .spyOn(DBMS.prototype, 'executeNamedQuery')
      .mockRejectedValue(new Error('forced-db-error'));

    const failures = [];

    for (const m of queryBackedMethods) {
      const structure =
        m.nameQuery && queries[m.nameQuery]?.structure_params
          ? queries[m.nameQuery].structure_params
          : {};
      const params = buildMethodParams(m, structure);

      try {
        await expect(m.methodFn(params)).rejects.toThrow('forced-db-error');
      } catch (err) {
        failures.push(`${m.filePath} -> ${err.message}`);
      }
    }

    expect(initSpy).toBeDefined();
    expect(execSpy).toBeDefined();
    expect(queryBackedMethods.length).toBeGreaterThan(0);
    expect(failures).toEqual([]);
  });
});
