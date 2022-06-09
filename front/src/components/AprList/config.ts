// Bismillaahirrahmaanirrahiim

export const pools = [
  'PancakeSwap',
  'Mdex',
  'Raydium',
  'TraderJoe',
  'Biswap',
  'Sushi',
  'SpookySwap',
  'Pangolin',
  'ApeSwap',
] as const;

export type PoolName = typeof pools[number];

export const poolsUrl = {
  PancakeSwap: 'https://pancakeswap.finance/farms',
  Mdex: 'https://mdex.co/#/liquidity?lang=en',
  Raydium: 'https://raydium.io/farms/',
  TraderJoe: 'https://traderjoexyz.com/farm',
  Biswap: 'https://biswap.org/farms',
  Sushi: 'https://app.sushi.com/farm',
  SpookySwap: 'https://spooky.fi/#/farms',
  Pangolin: 'https://app.pangolin.exchange/#/png/2',
  ApeSwap: 'https://apeswap.finance/farms',
};

export const poolsName = {
  PancakeSwap: 'Pancake',
  Mdex: 'MDEX',
  Raydium: 'Raydium',
  TraderJoe: 'Trader Joe',
  Biswap: 'Biswap',
  Sushi: 'Sushi',
  SpookySwap: 'SpookySwap',
  Pangolin: 'Pangolin',
  ApeSwap: 'ApeSwap',
};

export const chains = [
  'Avalanche',
  'BSC',
  'ETH',
  'Fantom',
  'Heco',
  'Solana',
] as const;

export type ChainName = typeof chains[number];

export const hedges = ['MEXC'] as const;

export type HedgeName = typeof hedges[number];
