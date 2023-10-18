export function followTarget(
  value: number,
  targetValue: number,
  responsiveness: number
) {
  return value + (targetValue - value) * responsiveness;
}
