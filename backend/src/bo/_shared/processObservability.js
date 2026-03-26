function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function startProcessContext(processName) {
  return {
    processName,
    transactionId: randomId(),
    startedAt: Date.now(),
  };
}

export function buildProcessMetadata(context, statusCode = 200) {
  return {
    process_name: context.processName,
    transaction_id: context.transactionId,
    status_code: statusCode,
    duration_ms: Date.now() - context.startedAt,
  };
}
