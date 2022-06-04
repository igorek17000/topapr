// Bismillaahirrahmaanirrahiim

export const aprToApy = (apr: number) => {
  const apy =
    Array.from(Array(365)).reduce(
      (prev, num) => ((apr / 365) * prev) / 100 + prev,
      100
    ) - 100;

  // console.log("apy", apy);
  return apy;
};
