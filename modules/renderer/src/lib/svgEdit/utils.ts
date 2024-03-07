export function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function normalized(value: number, min: number, max: number) {
  return (value - min) / (max - min);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(value, min));
}

export function map(
  value: number,
  min: number,
  max: number,
  newMin: number,
  newMax: number,
) {
  const normalize = normalized(value, min, max);
  return normalize * (newMax - newMin) + newMin;
}
