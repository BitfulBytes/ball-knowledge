// Adapted from this suggestion: https://stackoverflow.com/a/9716488
export const isNumeric = (s: string) => {
  const parsedString = parseFloat(s);

  return !isNaN(parsedString) && isFinite(parsedString);
};
