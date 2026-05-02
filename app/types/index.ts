export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  market_cap_rank: number;
  high_24h: number;
  low_24h: number;
  ath: number;
  ath_change_percentage: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface Signal {
  id: string;
  asset: string;
  signal: 'BUY' | 'SELL';
  score: number;
  price: number;
  volume: string;
  marketCap: string;
  volatility: number;
  timestamp: string;
  confluence: number;
}

export interface ChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}