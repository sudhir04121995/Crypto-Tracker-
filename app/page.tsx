'use client';

import { useState, useEffect } from 'react';
import Navbar from './Components/Navbar';
import StatsCards from './Components/StatsCards';
import CryptoTable from './Components/CryptoTable';
import SignalCard from './Components/SignalCard';
import { CryptoData, Signal } from './types';
import axios from 'axios';
import { log } from 'console';
import TradingSignals from './Components/TradingSignals';
import AdvancedSignals from './Components/AdvancedSignals';

export default function Home() {
  const [activeTab, setActiveTab] = useState('futures');
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for signals (matching your screenshot)
  const mockSignals: Signal[] = [
    {
      id: 'xmr',
      asset: 'XMR',
      signal: 'BUY',
      score: 84,
      price: 353.01,
      volume: '$91.17M',
      marketCap: '$6.51B',
      volatility: 6.5,
      timestamp: 'Mar 12, 11:30 AM',
      confluence: 84
    },
    {
      id: 'uni',
      asset: 'UNI',
      signal: 'SELL',
      score: 96,
      price: 3.85,
      volume: '$154.97M',
      marketCap: '$2.44B',
      volatility: 5.5,
      timestamp: 'Mar 12, 11:30 AM',
      confluence: 96
    },
    {
      id: 'arb',
      asset: 'ARB',
      signal: 'SELL',
      score: 95,
      price: 0.098506,
      volume: '$70.30M',
      marketCap: '$420M',
      volatility: 4.0,
      timestamp: 'Mar 12, 11:30 AM',
      confluence: 95
    },
    {
      id: 'sol',
      asset: 'SOL',
      signal: 'BUY',
      score: 78,
      price: 142.50,
      volume: '$2.5B',
      marketCap: '$65B',
      volatility: 8.2,
      timestamp: 'Mar 12, 11:30 AM',
      confluence: 78
    }
  ];

  useEffect(() => {
    fetchCryptoData();
  }, []);

  const fetchCryptoData = async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 20,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
          }
        }
      );
      setCryptoData(response.data);
      console.log("ggggggggggggggggggggggggggggggg",response.data)
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      setLoading(false);
    }
  };

  const getExchangeButtons = () => {
    return (
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {['Binance Futures', 'Bybit', 'Bitget', 'Coinbase', 'OKX SOON'].map((exchange) => (
          <button
            key={exchange}
            className="px-4 py-2 rounded-lg bg-crypto-border hover:bg-crypto-green hover:text-black transition-colors whitespace-nowrap"
          >
            {exchange}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crypto-green mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading crypto data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-8">
      

        {/* Binance Spot Tab */}
        {activeTab === 'futures' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Binance Spot Market</h2>
              <div className="flex gap-3 mb-4">
                {['15M', '1H', '4H', '1D'].map((tf) => (
                  <button key={tf} className="px-3 py-1 rounded bg-crypto-border text-sm hover:bg-crypto-green">
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="card">
              <CryptoTable data={cryptoData} type="spot" />
            </div>
          </div>
        )}

        {activeTab === 'spot' &&  <TradingSignals/>}

            {/* Live Signals Tab */}
        {activeTab === 'signals' && <AdvancedSignals/>}


      {activeTab === 'backtester' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">LIVE SIGNALS</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="card">
                  <p className="text-gray-400 text-sm">TOTAL SIGNALS</p>
                  <p className="text-2xl font-bold">36</p>
                </div>
                <div className="card border-l-4 border-l-crypto-green">
                  <p className="text-gray-400 text-sm">LONG/BUY</p>
                  <p className="text-2xl font-bold text-crypto-green">6</p>
                </div>
                <div className="card border-l-4 border-l-crypto-red">
                  <p className="text-gray-400 text-sm">SHORT/SELL</p>
                  <p className="text-2xl font-bold text-crypto-red">38</p>
                </div>
                <div className="card">
                  <p className="text-gray-400 text-sm">AVG CONFLUENCE</p>
                  <p className="text-2xl font-bold">33%</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="grid grid-cols-5 gap-2 mb-4 text-sm text-gray-400 border-b border-crypto-border pb-2">
                <div>TIME</div>
                <div>ASSET</div>
                <div>CHARTS</div>
                <div>SIGNAL</div>
                <div>Confluence</div>
              </div>
              
              {['ICP', 'BTC', 'XRP', 'SOL', 'XAU'].map((asset, idx) => (
                <div key={asset} className="grid grid-cols-5 gap-2 py-3 border-b border-crypto-border hover:bg-crypto-border">
                  <div className="text-sm">Mar 12, 11:30 AM</div>
                  <div className="font-medium">{asset}</div>
                  <div>
                    <button className="text-xs px-2 py-1 rounded bg-crypto-border">CHART</button>
                  </div>
                  <div>
                    <span className="px-2 py-1 rounded text-xs bg-red-900 text-crypto-red">SHORT</span>
                  </div>
                  <div className="text-crypto-yellow">33%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
     

      <footer className="border-t border-crypto-border bg-white w-full">
  <div className="max-w-7xl mx-auto px-4 py-4 
                  flex flex-col md:flex-row 
                  justify-between items-center gap-3 
                  text-sm text-gray-400">

    <p className="text-center md:text-left">
      2026 COINPREE ALGO TERMINAL
    </p>

    
    <div className="flex flex-wrap justify-center md:justify-end gap-4">
      <a href="#" className="hover:text-violet-500 transition">DISCLAIMER</a>
      <a href="#" className="hover:text-violet-500 transition">DOCS</a>
      <a href="#" className="hover:text-violet-500 transition">TERMS</a>
      <a href="#" className="hover:text-violet-500 transition">PRIVACY</a>
    </div>

  </div>
</footer>
    </div>
  );
}