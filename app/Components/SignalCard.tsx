'use client';

import { Signal } from '../types';

interface SignalCardProps {
  signals: Signal[];
}

export default function SignalCard({ signals }: SignalCardProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {['1M', '5M', '15M', '30M', '1H', '4H', '1D'].map((timeframe) => (
          <button key={timeframe} className="px-3 py-1 rounded bg-crypto-border text-xs hover:bg-crypto-green hover:text-black transition-colors">
            {timeframe}
          </button>
        ))}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-crypto-border">
            <tr>
              <th className="text-left py-3 text-gray-400 text-sm">#</th>
              <th className="text-left py-3 text-gray-400 text-sm">COIN</th>
              <th className="text-left py-3 text-gray-400 text-sm">SIGNAL & TIMING</th>
              <th className="text-right py-3 text-gray-400 text-sm">SCORE</th>
              <th className="text-right py-3 text-gray-400 text-sm">PRICE</th>
              <th className="text-right py-3 text-gray-400 text-sm">1H</th>
              <th className="text-right py-3 text-gray-400 text-sm">24H</th>
              <th className="text-right py-3 text-gray-400 text-sm">VOLUME</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((signal, index) => (
              <tr key={signal.id} className="border-b border-crypto-border hover:bg-crypto-border">
                <td className="py-3 text-sm">#{index + 1}</td>
                <td className="py-3">
                  <div>
                    <p className="font-medium">{signal.asset}</p>
                    <p className="text-xs text-gray-400">{signal.id}</p>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold mr-2 ${
                      signal.signal === 'BUY' ? 'bg-green-900 text-crypto-green' : 'bg-red-900 text-crypto-red'
                    }`}>
                      {signal.signal}
                    </span>
                    <span className="text-xs text-gray-400">{signal.timestamp}</span>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <span className="px-2 py-1 rounded bg-crypto-border text-sm font-bold">
                    {signal.score}
                  </span>
                </td>
                <td className="py-3 text-right font-mono">${signal.price}</td>
                <td className="py-3 text-right text-crypto-green">{signal.volatility}%</td>
                <td className="py-3 text-right text-gray-300">{signal.marketCap}</td>
                <td className="py-3 text-right font-mono text-sm">{signal.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}