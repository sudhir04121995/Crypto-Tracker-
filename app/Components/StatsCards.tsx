'use client';

interface StatsCardsProps {
  totalSignals: number;
  longBuy: number;
  shortSell: number;
  avgConfluence: number;
}

export default function StatsCards({ totalSignals, longBuy, shortSell, avgConfluence }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="card hover:shadow-lg">
        <p className="text-gray-400 text-sm mb-1">TOTAL SIGNALS</p>
        <p className="text-3xl font-bold">{totalSignals}</p>
      </div>
      
      <div className="card border-l-4 border-l-crypto-green">
        <p className="text-gray-400 text-sm mb-1">LONG / BUY</p>
        <p className="text-3xl font-bold text-crypto-green">{longBuy}</p>
      </div>
      
      <div className="card border-l-4 border-l-crypto-red">
        <p className="text-gray-400 text-sm mb-1">SHORT / SELL</p>
        <p className="text-3xl font-bold text-crypto-red">{shortSell}</p>
      </div>
      
      <div className="card border-l-4 border-l-crypto-yellow">
        <p className="text-gray-400 text-sm mb-1">AVG CONFLUENCE</p>
        <p className="text-3xl font-bold">{avgConfluence}%</p>
      </div>
    </div>
  );
}