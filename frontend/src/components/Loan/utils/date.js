export const toDateInput = (date) => new Date(date).toISOString().split("T")[0];

export const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return toDateInput(next);
};
