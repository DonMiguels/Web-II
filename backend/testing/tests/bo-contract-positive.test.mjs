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

describe('BO contract positive - all new methods', () => {
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

  test('all methods should resolve with mocked DB success', async () => {
    jest.spyOn(DBMS.prototype, 'init').mockResolvedValue(undefined);
    const execSpy = jest
      .spyOn(DBMS.prototype, 'executeNamedQuery')
      .mockResolvedValue({ rows: [{ ok: true }], rowCount: 1 });

    const failures = [];

    for (const m of queryBackedMethods) {
      const structure =
        m.nameQuery && queries[m.nameQuery]?.structure_params
          ? queries[m.nameQuery].structure_params
          : {};
      const params = buildMethodParams(m, structure);

      try {
        const result = await m.methodFn(params);
        expect(result).not.toBeUndefined();
      } catch (err) {
        failures.push(`${m.filePath} -> ${err.message}`);
      }
    }

    expect(execSpy).toHaveBeenCalled();
    expect(queryBackedMethods.length).toBeGreaterThan(0);
    expect(failures).toEqual([]);
  });
});
