function toIso(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

export function buildReturnReminderTemplate({
  loan_id,
  estimated_return_date,
}) {
  const dueIso = toIso(estimated_return_date);
  return {
    title: `Recordatorio de devolucion | prestamo #${loan_id}`,
    message: `Tu prestamo #${loan_id} vence en ${dueIso}. Por favor realiza la devolucion en la ventana esperada.`,
  };
}

export function buildOverdueAlertTemplate({
  loan_id,
  estimated_return_date,
  days_overdue,
}) {
  const dueIso = toIso(estimated_return_date);
  return {
    title: `Alerta de mora | prestamo #${loan_id}`,
    message: `Tu prestamo #${loan_id} esta vencido desde ${dueIso} (${days_overdue} dias de retraso). Regulariza la devolucion cuanto antes.`,
  };
}
