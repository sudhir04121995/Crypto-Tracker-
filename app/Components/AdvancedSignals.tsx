'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSearch, FiTrendingUp, FiTrendingDown, FiActivity, FiRefreshCw, FiZap } from 'react-icons/fi';
import { BsCalculator } from 'react-icons/bs';
import { LuClock, LuTrophy } from 'react-icons/lu';
import { VscQuestion } from 'react-icons/vsc';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency?: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
}

interface AdvancedSignal {
  id: string;
  time: string;
  asset: string;
   image: string; 
  exchange: string;
  signal: 'BUY' | 'SELL';
  wickPattern: string;
  volumePattern: string;
  confluence: number;
  entry: number;
  stopLoss: number;
  target: number;
  riskReward: string;
}


// Add this before your component
const generateChartDataForSignal = (signal: AdvancedSignal): number[] => {
  const data = [];
  let price = 100;
  const trend = signal.signal === 'BUY' ? 1 : -1;
  
  for (let i = 0; i < 20; i++) {
    // Add some randomness but with trend direction
    const change = (Math.random() - 0.5 + trend * 0.3) * 3;
    price = Math.max(80, Math.min(120, price + change));
    data.push(price);
  }
  
  return data;
};



  // Add this component inside your AdvancedSignals file
const SparklineChart = ({ 
  data, 
  color, 
  height = 32, 
  width = 100 
}: { 
  data: number[]; 
  color: string; 
  height?: number; 
  width?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Find min and max for scaling
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    // Calculate step
    const step = width / (data.length - 1);
    
    // Draw the line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw area fill gradient
    ctx.beginPath();
    
    data.forEach((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    // Stroke the line
    ctx.stroke();
    
    // Add gradient fill
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `${color}60`);
    gradient.addColorStop(1, `${color}00`);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add start and end dots
    const firstY = height - ((data[0] - min) / range) * height;
    const lastY = height - ((data[data.length - 1] - min) / range) * height;
    
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(0, firstY, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(width, lastY, 2, 0, 2 * Math.PI);
    ctx.fill();
    
  }, [data, color, height, width]);

  return <canvas ref={canvasRef} className="rounded" style={{ width, height }} />;
};

export default function AdvancedSignals() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExchange, setSelectedExchange] = useState('Binance Futures');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const exchanges = [
    'Binance Futures',
    'Bybit',
    'Bitget',
    'Coinbase',
    'OKX',
    'OKX DEX'
  ];

  const timeframes = [
    { id: '5M', label: '5M' },
    { id: '15M', label: '15M' },
    { id: '30M', label: '30M' },
    { id: '1H', label: '1H' },
    { id: '2H', label: '2H' },
    { id: '4H', label: '4H' },
    { id: '1D', label: '1D' }
  ];

  const columns = [
    { label: "TIME", showIcon: false },
    { label: "ASSET", showIcon: false },
    { label: "CHART", showIcon: false },
    { label: "SIGNAL", showIcon: true },
    { label: "Confluence", showIcon: true },
    { label: "ENTRY", showIcon: true },
    { label: "STOP LOSS", showIcon: true },
    { label: "TARGET", showIcon: true },
    { label: "R:R", showIcon: true },
  ];

  useEffect(() => {
    fetchMarketData();
  }, []);

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(() => {
        fetchMarketData();
      }, 30000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive]);

//   // Replace your entire fetchMarketData function with this:
// const fetchMarketData = async () => {
//   try {
//     // Binance API - No CORS issues, real-time data
//     const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
//     const data = response.data;
    
//     // Filter for USDT pairs and take top 50
//     const usdtPairs = data
//       .filter((item: any) => item.symbol.endsWith('USDT'))
//       .slice(0, 50);
    
//     // Transform Binance data to match your CoinData interface
//     const transformedData: CoinData[] = usdtPairs.map((item: any) => ({
//       id: item.symbol.toLowerCase().replace('usdt', ''),
//       symbol: item.symbol.replace('USDT', '').toLowerCase(),
//       name: item.symbol.replace('USDT', ''),
//       image: `https://cryptologos.cc/logos/${item.symbol.replace('USDT', '').toLowerCase()}-${item.symbol.replace('USDT', '').toLowerCase()}-logo.png`,
//       current_price: parseFloat(item.lastPrice),
//       price_change_percentage_24h: parseFloat(item.priceChangePercent),
//       price_change_percentage_1h_in_currency: parseFloat(item.priceChangePercent) / 24,
//       market_cap: parseFloat(item.quoteVolume) * parseFloat(item.lastPrice),
//       total_volume: parseFloat(item.volume),
//       high_24h: parseFloat(item.highPrice),
//       low_24h: parseFloat(item.lowPrice),
//     }));
    
//     setCoins(transformedData);
//     setFilteredCoins(transformedData);
//     setLastUpdated(new Date());
//     setLoading(false);
//     setRefreshing(false);
//   } catch (error) {
//     console.error('Error fetching from Binance:', error);
//     setLoading(false);
//     setRefreshing(false);
//   }
// };



const fetchMarketData = async () => {
  try {
    // Use CoinGecko API - no CORS issues
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets',
      {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: false,
          price_change_percentage: '1h,24h'
        }
      }
    );
    
    const data = response.data;
    
    const transformedData: CoinData[] = data.map((item: any) => ({
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      image: item.image,
      current_price: item.current_price,
      price_change_percentage_24h: item.price_change_percentage_24h,
      price_change_percentage_1h_in_currency: item.price_change_percentage_1h_in_currency || 0,
      market_cap: item.market_cap,
      total_volume: item.total_volume,
      high_24h: item.high_24h || item.current_price * 1.02,
      low_24h: item.low_24h || item.current_price * 0.98,
    }));
    
    setCoins(transformedData);
    setFilteredCoins(transformedData);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error);
    setLoading(false);
    setRefreshing(false);
    // Load mock data if API fails
    loadMockData();
  }
};

// Add this function RIGHT AFTER fetchMarketData
const loadMockData = () => {
  const mockData: CoinData[] = [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      current_price: 63452,
      price_change_percentage_24h: 2.5,
      price_change_percentage_1h_in_currency: 0.5,
      market_cap: 1250000000000,
      total_volume: 28000000000,
      high_24h: 64500,
      low_24h: 62800,
    },
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      current_price: 3450,
      price_change_percentage_24h: 1.8,
      price_change_percentage_1h_in_currency: 0.3,
      market_cap: 415000000000,
      total_volume: 15000000000,
      high_24h: 3500,
      low_24h: 3400,
    },
    {
      id: 'binancecoin',
      symbol: 'bnb',
      name: 'BNB',
      image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2.png',
      current_price: 580,
      price_change_percentage_24h: -0.5,
      price_change_percentage_1h_in_currency: -0.1,
      market_cap: 89000000000,
      total_volume: 2000000000,
      high_24h: 590,
      low_24h: 575,
    },
    {
      id: 'solana',
      symbol: 'sol',
      name: 'Solana',
      image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      current_price: 145,
      price_change_percentage_24h: 5.2,
      price_change_percentage_1h_in_currency: 1.2,
      market_cap: 64000000000,
      total_volume: 3500000000,
      high_24h: 148,
      low_24h: 138,
    },
    {
      id: 'ripple',
      symbol: 'xrp',
      name: 'XRP',
      image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
      current_price: 0.62,
      price_change_percentage_24h: -1.2,
      price_change_percentage_1h_in_currency: -0.3,
      market_cap: 34000000000,
      total_volume: 1500000000,
      high_24h: 0.64,
      low_24h: 0.61,
    },
    {
      id: 'cardano',
      symbol: 'ada',
      name: 'Cardano',
      image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
      current_price: 0.45,
      price_change_percentage_24h: 3.1,
      price_change_percentage_1h_in_currency: 0.8,
      market_cap: 15800000000,
      total_volume: 450000000,
      high_24h: 0.46,
      low_24h: 0.44,
    },
    {
      id: 'dogecoin',
      symbol: 'doge',
      name: 'Dogecoin',
      image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
      current_price: 0.12,
      price_change_percentage_24h: -2.3,
      price_change_percentage_1h_in_currency: -0.5,
      market_cap: 17200000000,
      total_volume: 800000000,
      high_24h: 0.125,
      low_24h: 0.118,
    },
  ];
  
  setCoins(mockData);
  setFilteredCoins(mockData);
  setLastUpdated(new Date());
  setLoading(false);
  setRefreshing(false);
};

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchMarketData();
  };

  const toggleLiveMode = () => {
    setIsLive(!isLive);
  };

  const getLastUpdatedText = () => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    if (diffSeconds < 60) return `${diffSeconds} sec ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;
    return lastUpdated.toLocaleTimeString();
  };

  // Get price change based on timeframe
  const getPriceChangeForTimeframe = (coin: CoinData, timeframe: string): number => {
    switch(timeframe) {
      case '5M':
        return (coin.price_change_percentage_1h_in_currency || 0) * 0.25;
      case '15M':
        return (coin.price_change_percentage_1h_in_currency || 0) * 0.5;
      case '30M':
        return (coin.price_change_percentage_1h_in_currency || 0) * 0.75;
      case '1H':
        return coin.price_change_percentage_1h_in_currency || 0;
      case '2H':
        return (coin.price_change_percentage_1h_in_currency || 0) * 2;
      case '4H':
        return (coin.price_change_percentage_1h_in_currency || 0) * 4;
      case '1D':
        return coin.price_change_percentage_24h;
      default:
        return coin.price_change_percentage_24h;
    }
  };

  // Generate advanced signals
  const generateAdvancedSignals = (): AdvancedSignal[] => {
    return filteredCoins.slice(0, 50).map((coin) => {
      const change = getPriceChangeForTimeframe(coin, selectedTimeframe);
      const isBuySignal = change > 0;
      const entry = coin.current_price;
      const stopLoss = isBuySignal ? entry * 0.985 : entry * 1.015;
      const target = isBuySignal ? entry * 1.02 : entry * 0.98;
      const risk = Math.abs(entry - stopLoss);
      const reward = Math.abs(target - entry);
      const riskReward = (reward / risk).toFixed(1);
      const confluence = Math.min(90, Math.max(30, 50 + Math.abs(change) * 5));
      
      const patterns = ['WICK GRAVEYARD', 'VOLUME VACUUM', 'ENGULFING', 'DOJI', 'HAMMER'];
      const selectedPatterns = patterns.slice(0, Math.floor(Math.random() * 2) + 1);
      
      return {
        id: coin.id,
        time: new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        asset: coin.symbol.toUpperCase(),
        image: coin.image,
        exchange: selectedExchange.split(' ')[0],
        signal: isBuySignal ? 'BUY' : 'SELL',
        wickPattern: selectedPatterns[0],
        volumePattern: selectedPatterns[1] || selectedPatterns[0],
        confluence: Math.round(confluence),
        entry: entry,
        stopLoss: stopLoss,
        target: target,
        riskReward: `1:${riskReward}`
      };
    });
  };

  // Filter by search term
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredCoins(coins);
    } else {
      const filtered = coins.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCoins(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, coins, selectedTimeframe]);

  const allSignals = generateAdvancedSignals();
  
  // Pagination
  const totalItems = allSignals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSignals = allSignals.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Calculate stats
  const totalSignals = allSignals.length;
  const buySignals = allSignals.filter(s => s.signal === 'BUY').length;
  const sellSignals = allSignals.filter(s => s.signal === 'SELL').length;
  const avgConfluence = totalSignals > 0 
    ? Math.round(allSignals.reduce((sum, s) => sum + s.confluence, 0) / totalSignals) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#0a0e1a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading advanced signals...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="bg-[#fdfdfe] min-h-screen text-gray-200">
      <div className="max-w-9xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">

  {/* Icon Box */}
  <div className="w-12 h-12 flex items-center justify-center 
                  bg-purple-100 rounded-xl border border-purple-200">
    <FiZap className="text-purple-500 text-xl" />
  </div>

  {/* Text */}
  <div>
    <h1 className="text-xl sm:text-2xl font-bold text-black">
      ADVANCED SIGNAL
    </h1>
    <p className="text-gray-500 text-sm">
      Select an exchange to scan for live signals
    </p>
  </div>

</div>
          
          {/* Live Indicator & Refresh */}
          <div className="flex items-center gap-3">
            {/* <div className="flex items-center gap-2 px-3 py-2 bg-[#4d4e4f] rounded-lg"> */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#131824] rounded-lg">
              <div className="relative">
                <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                {isLive && (
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75"></div>
                )}
              </div>
              <button onClick={toggleLiveMode} className={`text-sm font-medium ${isLive ? 'text-green-500' : 'text-gray-400'}`}>
                LIVE
              </button>
            </div>
            <div className="text-xs text-gray-500">{getLastUpdatedText()}</div>
            <button onClick={handleManualRefresh} disabled={refreshing} className="p-2 rounded-lg bg-[#131824] hover:bg-gray-800">
              <FiRefreshCw className={`text-gray-400 text-lg ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white shadow-sm rounded-lg p-4 border ">
            <p className="text-gray-400 text-sm mb-1">TOTAL SIGNALS</p>
            <p className="text-3xl font-bold text-black">{totalSignals}</p>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-4  ">
            <p className="text-gray-400 text-sm mb-1">LONG / BUY</p>
            <p className="text-3xl font-bold text-green-500">{buySignals}</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-400 text-sm mb-1">SHORT / SELL</p>
            <p className="text-3xl font-bold text-red-500">{sellSignals}</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-400 text-sm mb-1">AVG CONFLUENCE</p>
            <p className="text-3xl font-bold text-violet-500">{avgConfluence}%</p>
          </div>
        </div>
<div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6 p-2 bg-white rounded-xl shadow-sm border">

  {/* LEFT: Exchange Buttons */}
  <div className="flex flex-wrap items-center gap-2">
    {exchanges.map((exchange) => (
      <button
        key={exchange}
        onClick={() => setSelectedExchange(exchange)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap
          ${selectedExchange === exchange
            ? 'bg-green-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
      >
        {exchange}
      </button>
    ))}
  </div>

  {/* RIGHT: Timeframes + Search */}
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full xl:w-auto">

    {/* Timeframes */}
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
      {timeframes.map((tf) => (
        <button
          key={tf.id}
          onClick={() => setSelectedTimeframe(tf.id)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition
            ${selectedTimeframe === tf.id
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {tf.label}
        </button>
      ))}
    </div>

    {/* Search */}
    <div className="relative w-full sm:w-56">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search symbol..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-gray-800 
                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
    </div>

  </div>

</div>

        {/* Advanced Signals Table */}
        <div className="bg-white rounded-lg overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-white border-b border-gray-200 ">
              <tr className="text-left text-gray-400 text-xs">
                {columns.map((col, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {/* {col.showIcon && <VscQuestion className="text-gray-500 text-xs cursor-help" />} */}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          
            <tbody>
  {currentSignals.map((signal) => (
    <tr key={signal.id} className="  hover:bg-gray-400 transition-colors">
      <td className="px-4 py-3 text-xs font-bold text-gray-400">{signal.time}</td>
      
      {/* ASSET Column with Image */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img 
            src={signal.image} 
            alt={signal.asset}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://cryptologos.cc/logos/bitcoin-btc-logo.png';
            }}
          />
          <div>
            <p className="font-bold text-black">{signal.asset}</p>
            <p className="text-xs text-gray-500">{signal.exchange}</p>
          </div>
        </div>
      </td>
      
      {/* <td className="px-4 py-3">
        <button className="px-3 py-1 rounded bg-gray-800 text-xs hover:bg-green-500 hover:text-black transition-colors">
          CHART
        </button>
      </td>
       */}

       <td className="px-4 py-3">
  <div className="flex flex-col items-start gap-2">
    {/* Chart Button */}
    <button 
      onClick={() => {
        window.open(`https://www.tradingview.com/chart/?symbol=BINANCE:${signal.asset}USDT`, '_blank');
      }}
      className={`px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium border border-transparent
               ${signal.signal ==='BUY'? `hover:border-green-500 hover:bg-green-100`:`hover:border-red-500 hover:bg-red-100`}   hover:text-white transition-all duration-200 
                 flex items-center gap-1.5 shadow-sm`}
    >
      {/* <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      CHART */}
       <div className="w-full cursor-pointer">
      <SparklineChart 
        data={generateChartDataForSignal(signal)}
        color={signal.signal === 'BUY' ? '#22c55e' : '#ef4444'}
        height={32}
        width={120}
      />
    </div>
    </button>
    
    {/* Sparkline Chart - This will be visible */}
    {/* <div className="w-full">
      <SparklineChart 
        data={generateChartDataForSignal(signal)}
        color={signal.signal === 'BUY' ? '#22c55e' : '#ef4444'}
        height={32}
        width={120}
      />
    </div> */}
  </div>
</td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          {/* <span className={`px-2 py-0.5 rounded text-xs font-bold w-fit ${
            signal.signal === 'BUY' ? 'bg-green-900 text-green-500' : 'bg-red-900 text-red-500'
          }`}>
            {signal.signal}
          </span> */}
          <span
  className={`px-2 py-0.5 rounded text-xs font-bold w-fit flex items-center gap-1 ${
    signal.signal === 'BUY'
      ? 'bg-green-900 text-green-500'
      : 'bg-red-900 text-red-500'
  }`}
>
  {signal.signal === 'BUY' ? (
    <FiTrendingUp className="text-green-500 text-sm" />
  ) : (
    <FiTrendingDown className="text-red-500 text-sm" />
  )}

  {signal.signal}
</span>
          
        </div>
      </td>
      
      {/* <td className="px-4 py-3">
        <span className="text-[9px] rounded-md t text-violet-500">{signal.wickPattern}</span>
          <span className="text-[9px] text-purple-700">{signal.volumePattern}</span>
        <span className="text-yellow-500 font-bold">{signal.confluence}%</span>
      </td>
       */}

       <td className="px-4 py-3">
  <div className="flex flex-col gap-1">
    
    {/* Top Row - Tags */}
    <div className="flex gap-1 flex-wrap">
      {signal.wickPattern && (
        <span className="text-[9px] px-2 py-0.5 rounded-md bg-violet-200 text-violet-700 font-semibold">
          {signal.wickPattern}
        </span>
      )}

      {signal.volumePattern && (
        <span className="text-[9px] px-2 py-0.5 rounded-md bg-blue-200 text-blue-700 font-semibold">
          {signal.volumePattern}
        </span>
      )}
      <span className="text-yellow-500 font-bold text-xs">
        {signal.confluence}%
      </span>
    </div>
    

    {/* Bottom Row - Confluence */}
    <div className="flex items-center justify-between">
      

      {/* Optional progress bar */}
      {/* <div className="w-20 h-1 bg-gray-700 rounded">
        <div
          className="h-1 bg-pink-500 rounded"
          style={{ width: `${signal.confluence}%` }}
        />
      </div> */}
      <div className="w-20 h-1 bg-gray-700 rounded">
  <div
    className={`h-1 rounded ${
      signal.signal === 'BUY' ? 'bg-green-500' : 'bg-red-500'
    }`}
    style={{ width: `${signal.confluence}%` }}
  />
</div>

    </div>

  </div>
</td>
      <td className="px-4 py-3 font-mono text-sm text-black">
        ${signal.entry.toFixed(signal.entry < 1 ? 4 : 2)}
      </td>
      
      <td className="px-4 py-3 font-mono text-sm text-red-400">
        ${signal.stopLoss.toFixed(signal.stopLoss < 1 ? 4 : 2)}
      </td>
      
      <td className="px-4 py-3 font-mono text-sm text-green-400">
        ${signal.target.toFixed(signal.target < 1 ? 4 : 2)}
      </td>
      
      <td className="px-4 py-3">
        <span className=" text-xs text-black">
          {signal.riskReward}
        </span>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 px-4 py-3 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} signals
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-700 rounded-lg text-sm bg-white text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              
              <div className="flex gap-1">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  ← Prev
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        currentPage === pageNum
                          ? 'bg-green-500 text-black'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

    
      </div>
    </div>
  );
}


