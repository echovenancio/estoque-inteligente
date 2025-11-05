export type RGB = { red: number; green: number; blue: number };

export const stringToColor = (input: string): RGB => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = (hash >> 16) & 0xff;
  const g = (hash >> 8) & 0xff;
  const b = hash & 0xff;
  return { red: r, green: g, blue: b };
};

export const getContrastColor = (bg: RGB): RGB => {
  const luminance = 0.299 * bg.red + 0.587 * bg.green + 0.114 * bg.blue;
  return luminance > 128 ? { red: 0, green: 0, blue: 0 } : { red: 255, green: 255, blue: 255 };
};

export const pastelize = (c: RGB, factor = 0.7): RGB => {
  const r = Math.round(c.red * (1 - factor) + 255 * factor);
  const g = Math.round(c.green * (1 - factor) + 255 * factor);
  const b = Math.round(c.blue * (1 - factor) + 255 * factor);
  return { red: Math.min(255, Math.max(0, r)), green: Math.min(255, Math.max(0, g)), blue: Math.min(255, Math.max(0, b)) };
};

export const stringToThemeColors = (input: string) => {
  const bg = pastelize(stringToColor(input));
  const fg = getContrastColor(bg);
  return { bg, fg };
};
