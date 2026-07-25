/**
 * Convierte una fecha a formato de input `YYYY-MM-DD`.
 *
 * @param {Date|string|number} date - Fecha a formatear.
 * @returns {string} Fecha en formato ISO corto.
 */
export const toDateInput = (date) => new Date(date).toISOString().split("T")[0];

/**
 * Suma días a una fecha y la devuelve en formato de input.
 *
 * @param {Date|string|number} date - Fecha base.
 * @param {number} days - Cantidad de días a sumar.
 * @returns {string} Nueva fecha en formato `YYYY-MM-DD`.
 */
export const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return toDateInput(next);
};
