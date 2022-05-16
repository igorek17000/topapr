// Bismillaahirrahmaanirrahiim

export const pools = [
  'PancakeSwap',
  'Mdex-BSC',
  'Mdex-Heco',
  'Raydium',
  'TraderJoe',
  'Sushi',
] as const;

export type PoolName = typeof pools[number];

export const poolsUrl = {
  PancakeSwap: 'https://pancakeswap.finance/farms',
  'Mdex-Heco': 'https://mdex.co/#/liquidity?lang=en',
  'Mdex-BSC': 'https://mdex.co/#/liquidity?lang=en',
  Raydium: 'https://raydium.io/farms/',
  TraderJoe: 'https://traderjoexyz.com/farm',
  Sushi: 'https://sushi.co',
};

export const poolsName = {
  PancakeSwap: 'Pancake',
  'Mdex-Heco': 'MDEX Heco',
  'Mdex-BSC': 'MDEX BSC',
  Raydium: 'Raydium',
  TraderJoe: 'Trader Joe',
  Sushi: 'Sushi',
};

export const chains = ['Avalanche', 'BSC', 'ETH', 'Heco', 'Solana'] as const;

export type ChainName = typeof chains[number];

export const hedges = ['MEXC'] as const;

export type HedgeName = typeof hedges[number];
