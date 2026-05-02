'use client';

import { CryptoData } from '../types';

interface CryptoTableProps {
  data: CryptoData[];
  type: 'spot' | 'futures';
}

export default function CryptoTable({ data, type }: CryptoTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-crypto-border">
          <tr>
            <th className="text-left py-3 px-4 text-gray-400 text-sm">#</th>
            <th className="text-left py-3 px-4 text-gray-400 text-sm">COIN</th>
            <th className="text-right py-3 px-4 text-gray-400 text-sm">PRICE</th>
            <th className="text-right py-3 px-4 text-gray-400 text-sm">24H</th>
            <th className="text-right py-3 px-4 text-gray-400 text-sm">VOLUME</th>
            <th className="text-right py-3 px-4 text-gray-400 text-sm">MARKET CAP</th>
            <th className="text-right py-3 px-4 text-gray-400 text-sm">VOLATILITY</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((coin, index) => (
            <tr key={coin.id} className="border-b border-crypto-border hover:bg-crypto-border transition-colors">
              <td className="py-3 px-4 text-sm">{index + 1}</td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6 mr-2" />
                  <div>
                    <p className="font-medium">{coin.symbol.toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{coin.name}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-right font-mono">
                ${coin.current_price.toLocaleString()}
              </td>
              <td className={`py-3 px-4 text-right font-mono ${
                coin.price_change_percentage_24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'
              }`}>
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </td>
              <td className="py-3 px-4 text-right font-mono text-sm">
                ${(coin.total_volume / 1e6).toFixed(0)}M
              </td>
              <td className="py-3 px-4 text-right font-mono text-sm">
                ${(coin.market_cap / 1e9).toFixed(2)}B
              </td>
              <td className="py-3 px-4 text-right font-mono">
                <span className="px-2 py-1 rounded bg-crypto-border text-xs">
                  {Math.abs(coin.price_change_percentage_24h || 0).toFixed(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}