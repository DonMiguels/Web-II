export const DOMAIN_ERROR_CODES = {
  HARD_DELETE_BLOCKED: 'HARD_DELETE_BLOCKED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
};

export function throwDomainError({ statusCode, code, message, details = null }) {
  throw new Error(
    JSON.stringify({
      statusCode,
      code,
      message,
      details,
    }),
  );
}

export function rethrowAsDomainError(error, fallbackMessage = 'Error interno') {
  if (error && typeof error.message === 'string') {
    try {
      JSON.parse(error.message);
      throw error;
    } catch {
      // no-op: map to domain error below
    }
  }

  throwDomainError({
    statusCode: 500,
    code: DOMAIN_ERROR_CODES.UNEXPECTED_ERROR,
    message: fallbackMessage,
    details: {
      original_message: error?.message || null,
    },
  });
}
