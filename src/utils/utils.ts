export function generateRandomFromRange(min = 0, max = 100) {
  // find diff
  let difference = max - min;

  // generate random number
  let rand = Math.random();

  // multiply with difference
  rand = rand * difference;

  // add with min value
  rand = rand + min;

  return rand;
}

export function getPositionFromAngleRadius(radius: number, angle: number) {
  var x = radius * Math.sin((Math.PI * 2 * angle) / 360);
  var y = radius * Math.cos((Math.PI * 2 * angle) / 360);
  return { x, y };
}

export function getRandomPosition(minRad: number, maxRad: number) {
  const angle = generateRandomFromRange(0, 360);
  const radius = generateRandomFromRange(minRad, maxRad);

  return getPositionFromAngleRadius(radius, angle);
}
