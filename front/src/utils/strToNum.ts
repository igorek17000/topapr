// Bismillahirrahmaanirraahiim

export function strToNum(str: string) {
  try {
    const res = parseFloat(str);
    return res;
  } catch {
    return undefined;
  }
}
