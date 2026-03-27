const DEFAULT_RUNTIME_ENV = Object.freeze({
  limits: Object.freeze({
    maxActiveLoansGlobal: 5,
    maxLoanRenewals: 2,
  }),
});

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getRuntimeEnvSync() {
  return {
    limits: {
      maxActiveLoansGlobal: parsePositiveInteger(
        process.env.MAX_ACTIVE_LOANS_GLOBAL,
        DEFAULT_RUNTIME_ENV.limits.maxActiveLoansGlobal,
      ),
      maxLoanRenewals: parsePositiveInteger(
        process.env.MAX_LOAN_RENEWALS,
        DEFAULT_RUNTIME_ENV.limits.maxLoanRenewals,
      ),
    },
  };
}

export default getRuntimeEnvSync;

