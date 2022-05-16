// Bismillaahirrahmaanirrahiim

export function numToUsd(num: number | undefined) {
  if (num === undefined) return '';

  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}
