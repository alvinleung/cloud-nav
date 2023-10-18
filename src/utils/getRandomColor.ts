export function getRandomColor(): string {
  return `rgba(${Math.random() * 255},${Math.random() * 255},${
    Math.random() * 255
  },1)`;
}
