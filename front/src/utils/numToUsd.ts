// Bismillaahirrahmaanirrahiim

export function numToUsd(
  num: number | undefined,
  maxDigit?: number,
  minDigit?: number
) {
  if (num === undefined) return '';

  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: maxDigit ? maxDigit : 2,
    minimumFractionDigits: minDigit ? minDigit : 2,
  });
}
