export type ManualWorkInput = {
  people: number;
  minutesPerDay: number;
  daysPerWeek: number;
};

const WEEKS_PER_MONTH = 4.33;

function nonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function calculateMonthlyHours({
  people,
  minutesPerDay,
  daysPerWeek,
}: ManualWorkInput) {
  const monthlyMinutes =
    nonNegative(people) *
    nonNegative(minutesPerDay) *
    nonNegative(daysPerWeek) *
    WEEKS_PER_MONTH;

  return monthlyMinutes / 60;
}

export function formatApproximateHours(hours: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(hours);
}
