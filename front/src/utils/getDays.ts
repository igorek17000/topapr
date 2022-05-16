// Bismillaahirrahmaanirrahiim

export function getDays(dates: string) {
  const regexp = /(\d+)(D|W|M|Y)/g;

  const array = [...dates.matchAll(regexp)];

  if (array.length >= 0) {
    const num: any = array[0][1];
    const dateStr = array[0][2];
    if (dateStr === 'D') return num * 1;
    if (dateStr === 'W') return num * 7;
    if (dateStr === 'M') return num * 30;
    if (dateStr === 'Y') return num * 365;
  }

  return undefined;
}
