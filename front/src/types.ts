// Bismillaahirrahmaanirrahiim

export interface Network {
  name: string;
  chainId: number;
  meta?: any;
}

export interface Provider {
  name: string;
  url: string;
  description?: string;
  meta?: any;
}

export interface FarmProvider extends Provider {}
export interface LoanProvider extends Provider {}

export interface Farm {
  pair: string;
  pool: string;
  network: string;
  isFirstTokenMexc?: boolean;
  firstToken?: string;
  secondToken?: string;
  apr: number;
  apy: number;
  totalValue?: number;
  multiplier?: number;
  url?: string;
  isStarred?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface LoanToken {
  name: string;
  provider: LoanProvider;
}
