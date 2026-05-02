

'use client';

import { useState, useEffect ,useRef} from 'react';
import axios from 'axios';
import { FiSearch, FiTrendingUp, FiTrendingDown, FiActivity } from 'react-icons/fi';
import { FiRefreshCw } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
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
  price_change_percentage_7d_in_currency?: number;
  market_cap: number;
  total_volume: number;
  market_cap_rank: number;
}

interface Signal {
  id: string;
  rank: number;
  name: string;
  image:string;
  symbol: string;
  signal: 'BUY' | 'SELL';
  score: number;
  price: number;
  change1h: number;    
  change24h: number; 
  volume: string;
  marketCap: string;
  volatility: number;
  timestamp: string;
}

export default function TradingSignals() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [bullishCount, setBullishCount] = useState(0);
  const [bearishCount, setBearishCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
const [refreshing, setRefreshing] = useState(false);
const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
const [isLive, setIsLive] = useState(true);
const intervalRef = useRef<NodeJS.Timeout | null>(null);
const [timeframeLoading, setTimeframeLoading] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);


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
  
  if (diffSeconds < 60) {
    return `${diffSeconds} sec ago`;
  } else if (diffSeconds < 3600) {
    return `${Math.floor(diffSeconds / 60)} min ago`;
  } else {
    return lastUpdated.toLocaleTimeString();
  }
};

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

const handleTimeframeChange = async (timeframe: string) => {
  setTimeframeLoading(true);
  setSelectedTimeframe(timeframe);
  updateStatsForTimeframe(coins, timeframe);
  setTimeout(() => setTimeframeLoading(false), 300);
};
  const columns = [
  { label: "#", showIcon: false },
  { label: "COIN", showIcon: false },
  { label: "SIGNAL & TIMING", showIcon: true },
  { label: "SIGNAL SCORE", showIcon: true },
  { label: "PRICE", showIcon: true },
 { label: "1H", showIcon: true },      // ← ADD THIS
  { label: "24H", showIcon: true }, 
  { label: "VOLUME", showIcon: true },
  { label: "MARKET CAP", showIcon: true },
  { label: "VOLATILITY", showIcon: true },
];
  useEffect(() => {
    fetchMarketData();
  }, []);

  // Replace your entire fetchMarketData function with this:
const fetchMarketData = async () => {
  try {
    // Binance API - Real-time data
    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    const data = response.data;
    
    // Filter for USDT pairs
    const usdtPairs = data
      .filter((item: any) => item.symbol.endsWith('USDT'))
      .slice(0, 50);
    
    // Transform Binance data
    const transformedData = usdtPairs.map((item: any, index: number) => ({
      id: item.symbol.toLowerCase().replace('usdt', ''),
      symbol: item.symbol.replace('USDT', '').toLowerCase(),
      name: item.symbol.replace('USDT', ''),
      image: `https://cryptologos.cc/logos/${item.symbol.replace('USDT', '').toLowerCase()}-logo.png`,
      current_price: parseFloat(item.lastPrice),
      price_change_percentage_24h: parseFloat(item.priceChangePercent),
      price_change_percentage_1h_in_currency: parseFloat(item.priceChangePercent) / 24,
      price_change_percentage_7d_in_currency: parseFloat(item.priceChangePercent) * 7,
      market_cap: parseFloat(item.quoteVolume) * parseFloat(item.lastPrice),
      total_volume: parseFloat(item.volume),
      market_cap_rank: index + 1,
      high_24h: parseFloat(item.highPrice),
      low_24h: parseFloat(item.lowPrice),
    }));
    
    setCoins(transformedData);
    setFilteredCoins(transformedData);
    updateStatsForTimeframe(transformedData, selectedTimeframe);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  } catch (error) {
    console.error('Error fetching from Binance:', error);
    setLoading(false);
    setRefreshing(false);
  }
};
  // const fetchMarketData = async () => {
  //   try {
  //     const response = await axios.get(
  //       'https://api.coingecko.com/api/v3/coins/markets',
  //       {
  //         params: {
  //           vs_currency: 'usd',
  //           order: 'volume_desc',
  //           per_page: 50,
  //           page: 1,
  //           sparkline: false,
  //           price_change_percentage: '1h,24h,7d,30d'
  //         }
  //       }
  //     );
      
  //     const data = response.data;
  //     setCoins(data);
  //     setFilteredCoins(data);
  //     updateStatsForTimeframe(data, '1H');
      
  //     setLoading(false);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     setLoading(false);
  //   }
  // };

  const getPriceChangeForTimeframe = (coin: CoinData, timeframe: string): number => {
  switch(timeframe) {
    case '5M':  // ← ADD THIS
      return (coin.price_change_percentage_1h_in_currency || 0) * 0.15;
    case '15M':
      return (coin.price_change_percentage_1h_in_currency || 0) * 0.3;
    case '1H':
      return coin.price_change_percentage_1h_in_currency || 0;
    case '4H':
      return (coin.price_change_percentage_1h_in_currency || 0) * 1.5;
    case '1D':
      return coin.price_change_percentage_24h;
    default:
      return coin.price_change_percentage_24h;
  }
};

  // Generate signal based on timeframe-specific price movement
  const generateSignal = (coin: CoinData, timeframe: string): 'BUY' | 'SELL' => {
    const change = getPriceChangeForTimeframe(coin, timeframe);
    
    // Different thresholds for different timeframes
   if (timeframe === '5M') {  // ← ADD THIS
    return change > 0.05 ? 'BUY' : change < -0.05 ? 'SELL' : (Math.random() > 0.5 ? 'BUY' : 'SELL');
  } else if (timeframe === '15M') {
    return change > 0.1 ? 'BUY' : change < -0.1 ? 'SELL' : (Math.random() > 0.5 ? 'BUY' : 'SELL');
  } else if (timeframe === '1H') {
      return change > 0.2 ? 'BUY' : change < -0.2 ? 'SELL' : (Math.random() > 0.5 ? 'BUY' : 'SELL');
    } else if (timeframe === '4H') {
      return change > 0.5 ? 'BUY' : change < -0.5 ? 'SELL' : (Math.random() > 0.5 ? 'BUY' : 'SELL');
    } else {
      return change > 0 ? 'BUY' : 'SELL';
    }
  };

  // Generate signal score based on timeframe and change magnitude
  const generateScore = (coin: CoinData, timeframe: string): number => {
    const change = Math.abs(getPriceChangeForTimeframe(coin, timeframe));
    
    if (timeframe === '5M') {  // ← ADD THIS
    return Math.min(100, Math.round(50 + change * 25));
  } else if (timeframe === '15M') {
    return Math.min(100, Math.round(50 + change * 20));
  }else if (timeframe === '1H') {
      return Math.min(100, Math.round(50 + change * 15));
    } else if (timeframe === '4H') {
      return Math.min(100, Math.round(50 + change * 10));
    } else {
      return Math.min(100, Math.round(50 + change * 5));
    }
  };

  // Update all stats when timeframe changes
  const updateStatsForTimeframe = (data: CoinData[], timeframe: string) => {
    const bullish = data.filter((coin: CoinData) => {
      const change = getPriceChangeForTimeframe(coin, timeframe);
      return change > 0;
    }).length;
    
    const bearish = data.filter((coin: CoinData) => {
      const change = getPriceChangeForTimeframe(coin, timeframe);
      return change < 0;
    }).length;
    
    setBullishCount(bullish);
    setBearishCount(bearish);
    
    const scores = data.map((coin: CoinData) => generateScore(coin, timeframe));
    const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    setAvgScore(Math.round(avg));
  };

  // Handle timeframe change
  // const handleTimeframeChange = (timeframe: string) => {
  //   setSelectedTimeframe(timeframe);
  //   updateStatsForTimeframe(coins, timeframe);
  // };

  const formatMarketCap = (cap: number): string => {
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  const formatVolume = (vol: number): string => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(0)}M`;
    return `$${vol.toLocaleString()}`;
  };

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
  }, [searchTerm, coins]);

  // Get signals based on selected timeframe
  
  //   const topSignals = filteredCoins.slice(0, 10).map((coin, index) => {
  //   const change = getPriceChangeForTimeframe(coin, selectedTimeframe);
  //   const signal = generateSignal(coin, selectedTimeframe);
  //   const score = generateScore(coin, selectedTimeframe);
    
  //   return {
  //     id: coin.id,
  //     rank: index + 1,
  //     name: coin.name,
  //     image:coin.image,
  //     symbol: coin.symbol.toUpperCase(),
  //     signal: signal,
  //     score: score,
  //     price: coin.current_price,
  //     // change: change,
  //       change1h: coin.price_change_percentage_1h_in_currency || 0,  // ← ADD THIS
  // change24h: coin.price_change_percentage_24h,                  // ← ADD THIS
  //     volume: formatVolume(coin.total_volume),
  //     marketCap: formatMarketCap(coin.market_cap),
  //     volatility: Math.abs(Math.round(change * 2)),
  //     timestamp: new Date().toLocaleString('en-US', { 
  //       month: 'short', 
  //       day: 'numeric', 
  //       hour: '2-digit', 
  //       minute: '2-digit' 
  //     })
  //   };
  // });

  // Pagination calculations
const totalItems = filteredCoins.length;
const totalPages = Math.ceil(totalItems / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentItems = filteredCoins.slice(startIndex, endIndex);

// Pagination handlers
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

// Reset to page 1 when search or timeframe changes
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, selectedTimeframe]);

// Get signals based on selected timeframe with pagination
const topSignals = currentItems.map((coin, index) => {
  const actualRank = startIndex + index + 1;
  const change = getPriceChangeForTimeframe(coin, selectedTimeframe);
  const signal = generateSignal(coin, selectedTimeframe);
  const score = generateScore(coin, selectedTimeframe);
  
  return {
    id: coin.id,
    rank: actualRank,
    name: coin.name,
    image: coin.image,
    symbol: coin.symbol.toUpperCase(),
    signal: signal,
    score: score,
    price: coin.current_price,
    change1h: coin.price_change_percentage_1h_in_currency || 0,
    change24h: coin.price_change_percentage_24h,
    volume: formatVolume(coin.total_volume),
    marketCap: formatMarketCap(coin.market_cap),
    volatility: Math.abs(Math.round(change * 2)),
    timestamp: new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };
});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" text-white">
      {/* Header */}
     
   

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
  
  {/* LEFT SIDE */}
  <div>
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
      BINANCE SPOT
    </h1>
    <p className="text-gray-600 text-xs sm:text-sm font-bold">
      BINANCE SPOT EMA CROSSOVER
    </p>
  </div>

  {/* RIGHT SIDE */}
  <div className="w-full md:w-auto">
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide 
                  border border-transparent rounded-md p-2 bg-white shadow-sm">
    
    {[
      { id: '5M', label: '5M' },
      { id: '15M', label: '15M' },
      { id: '1H', label: '1H' },
      { id: '4H', label: '4H' },
      { id: '1D', label: '1D' }
    ].map(tf => (
      <button
        key={tf.id}
        onClick={() => handleTimeframeChange(tf.id)}
        className={`min-w-[30px] px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all
        ${selectedTimeframe === tf.id 
          ? 'bg-white text-violet-500 shadow-md border border-transparent' 
          : 'bg-transparent text-gray-400 hover:bg-gray-800'
        }`}
      >
        {tf.label}
      </button>
    ))}
{/* Live Indicator & Refresh - Add this after your title */}
<div className="flex items-center gap-3">
  {/* Live Indicator */}
  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
    <div className="relative">
      <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
      {isLive && (
        <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75"></div>
      )}
    </div>
    <button onClick={toggleLiveMode} className={`text-sm font-medium ${isLive ? 'text-green-600' : 'text-gray-400'}`}>
      LIVE
    </button>
  </div>

  {/* Last Updated */}
  <div className="text-xs text-gray-400">
    {getLastUpdatedText()}
  </div>

  {/* Refresh Button */}
  <button onClick={handleManualRefresh} disabled={refreshing} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
    <FiRefreshCw className={`text-gray-500 text-lg ${refreshing ? 'animate-spin' : ''}`} />
  </button>
</div>
  </div>
</div>

</div>
      {/* Main Content */}
      <div className=" px-1 py-6">
       
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        
          <div className=" bg-white rounded-lg p-4  border-transparent shadow-sm">
           <div className="flex items-center justify-between gap-2 mb-2">
    <FiTrendingUp className="text-green-500 text-xl" />
    <p className="text-green-400 rounded-xl px-2 py-1 bg-green-100  text-sm">BULLISH</p>
  </div>

            <p className="text-2xl font-bold text-green-500">{bullishCount}</p>
            <p className="text-xs font-bold text-gray-500">BUY SIGNALS DETECTED</p>
          </div>
          
          <div className="bg-white rounded-lg p-4  border-transparent shadow-sm">
           <div className="flex items-center justify-between gap-2 mb-2">
            <FiTrendingDown className="text-red-500 text-xl" />
            <p className="text-red-400 rounded-xl px-2 py-1 bg-red-100 text-sm">BEARISH</p>
            </div>
            <p className="text-2xl font-bold text-red-500">{bearishCount}</p>
            <p className="text-xs text-gray-500">SELL SIGNALS DETECTED</p>
          </div>
          
          <div className="bg-white rounded-lg p-4  border-transparent shadow-sm">
             <div className="flex items-center justify-between gap-2 mb-2">
              <BsCalculator className='text-violet-500 text-xl' />
            <p className="text-violet-400 rounded-xl px-2 py-1 bg-violet-100 text-sm">AVG SCORE</p>
          </div>
            <p className="text-2xl font-bold text-violet-500">{avgScore}</p>
            <p className="text-gray-500 text-xs">AVERAGE SIGNAL SCORE</p>
          </div>
          
          <div className="bg-white rounded-lg p-4  border-transparent shadow-sm">
           <div className="flex items-center justify-between gap-2 mb-2">
            <LuTrophy className="text-orange-400 text-xl" />
            <p className="text-orange-500 text-sm font-bold rounded-xl bg-orange-100 px-2 py-1">TOP</p>
            </div>
            <p className="text-2xl font-bold text-orange-500">EUL</p>
            <p className="text-black text-sm">+14.37% (24H)</p>
          </div>
        </div>

    
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-3 bg-white rounded-lg shadow-sm border">

  {/* LEFT: Timeframes */}
  <div className="w-full lg:w-auto">
    <div className="flex gap-2 overflow-x-auto scrollbar-hide p-2 bg-gray-50 rounded-lg">

      {[
        { id: '5M', label: '5M' },
        { id: '15M', label: '15M' },
        { id: '1H', label: '1H' },
        { id: '4H', label: '4H' },
        { id: '1D', label: '1D' }
      ].map(tf => (
        <button
          key={tf.id}
          onClick={() => handleTimeframeChange(tf.id)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition
            ${selectedTimeframe === tf.id
              ? 'bg-white text-violet-500 shadow'
              : 'text-gray-500 hover:bg-gray-200'
            }`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  </div>

  {/* RIGHT: Search + Stats */}
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">

    {/* Search */}
    <div className="relative w-full sm:w-64">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search by symbols or name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-gray-100 border border-transparent  rounded-lg pl-10 pr-3 py-2 text-gray-700 
                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
      />
    </div>

    {/* Signal Count */}
  

  </div>
    <div className="flex items-center justify-between sm:justify-start gap-2 px-3 py-2 bg-gray-50 rounded-lg whitespace-nowrap">

      <FiActivity className="text-gray-500 text-lg" />

      <p className="text-gray-600 text-sm">
        {filteredCoins.length} Signals
      </p>
    </div>
</div>

        {/* Signals Table - Data changes with timeframe */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto mt-2">
     
          
          <table className="w-full">
         
            <thead className="bg-white border-b border-gray-200">
  <tr className="text-left text-black text-sm">

    {columns.map((col, index) => (
      <th key={index} className="px-4 py-3">
        <div className="flex items-center gap-1">
          <span>{col.label}</span>

          {col.showIcon && (
            <VscQuestion className="text-gray-400 text-sm cursor-help" />
          )}
        </div>
      </th>
    ))}

  </tr>
</thead>
            <tbody>
              {topSignals.map((signal) => (
                <tr key={signal.id} className="border-b border-gray-800 hover:bg-[#626364] transition-colors">
                  <td className="px-4 py-3 text-black text-[13px]">{signal.rank}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className='flex'>
                          <div>
                            <img src={signal.image} alt={signal.name} className="w-10 h-10 mr-2" /> 
                          </div>
                     <div className="text-black font-bold">
  {signal.symbol}
  <span className='text-[10px] text-black text-base ml-1'> #{signal.rank}</span>
  <div className="text-xs text-gray-500">{signal.name}</div>
</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className={`px-2 py-1 rounded text-xs font-bold w-fit ${
                        signal.signal === 'BUY' 
                          ? 'bg-green-100 text-green-500' 
                          : 'bg-red-100 text-red-500'
                      }`}>
                        {signal.signal}
                      </span>
                      {/* <div className='flex'>
                        <LuClock className='text-violet-500'/>
                         <span className="text-xs text-violet-500 rounded-md px-1 py-1 bg-violet-100 mt-1">{signal.timestamp}</span>
                      
                      </div> */}
                      <div className="flex items-center text-violet-500 rounded-md px-1 py-0.5 mt-1 bg-violet-100 gap-1">
  <LuClock className=" text-sm" />

  <span className="text-xs ">
    {signal.timestamp}
  </span>
</div>
                     {/* <span className="text-xs text-gray-600 mt-0.5">{selectedTimeframe} view</span> */}
                    </div>
                  </td>
                  <td className="px-4 py-3">
  <div className="flex gap-1 items-center">

    <span className={`px-1 py-3 rounded font-bold text-center w-16 ${
      signal.score >= 70 ? 'bg-green-100 border border-green-300 text-green-500' :
      signal.score <= 30 ? 'bg-red-100 border border-red-300 text-red-500' :
      'bg-yellow-100 border border-yellow-300 text-yellow-500'
    }`}>
      {signal.score}
    </span>

    <span className="text-[10px] text-gray-400 font-semibold leading-tight text-center mt-1">
      SIGNAL<br />SCORE
    </span>

  </div>
</td>
                  <td className="px-4 py-3  text-black hover:text-white font-semibold">${signal.price.toLocaleString()}</td>
                  {/* <td className={`px-4 py-3 font-mono ${signal.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {signal.change >= 0 ? '▲' : '▼'} {Math.abs(signal.change).toFixed(2)}%
                   </td> */}
                      {/* 1H Column - ADD THIS */}
      <td className={`px-4 py-3 font-mono ${signal.change1h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {signal.change1h >= 0 ? '▲' : '▼'} {Math.abs(signal.change1h).toFixed(2)}%
      </td>
      
      {/* 24H Column - ADD THIS */}
      <td className={`px-4 py-3 font-mono ${signal.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {signal.change24h >= 0 ? '▲' : '▼'} {Math.abs(signal.change24h).toFixed(2)}%
      </td>
      
                  <td className="px-4 py-3  text-black hover:text-white font-semibold">{signal.volume}</td>
                  <td className="px-4 py-3 text-black hover:text-white font-semibold">{signal.marketCap}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded bg-orange-100 text-orange-500 border border-orange-300 text-xs">
                      {signal.volatility}
                    </span>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
          
          {/* Timeframe Info Message */}
          {/* <div className="px-4 py-3 border-t border-gray-800 bg-[#0d1117]">
            <p className="text-xs text-gray-500 text-center">
              💡 Signals change based on {selectedTimeframe} timeframe analysis. 
              {selectedTimeframe === '15M' && ' Short-term scalping signals.'}
              {selectedTimeframe === '1H' && ' Hourly trading signals.'}
              {selectedTimeframe === '4H' && ' Swing trading signals.'}
              {selectedTimeframe === '1D' && ' Long-term position signals.'}
            </p>
          </div> */}
        </div>

{/* Pagination */}
{totalPages > 1 && (
  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 px-4 py-3 bg-white rounded-lg shadow-sm border">
    <div className="text-sm text-gray-500">
      Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} signals
    </div>
    
    <div className="flex flex-wrap items-center gap-2">
      {/* Items per page selector */}
      <select
        value={itemsPerPage}
        onChange={(e) => {
          setItemsPerPage(Number(e.target.value));
          setCurrentPage(1);
        }}
        className="px-2 py-1 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        <option value={10}>10 per page</option>
        <option value={25}>25 per page</option>
        <option value={50}>50 per page</option>
      </select>
      
      {/* Pagination buttons */}
      <div className="flex gap-1">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ← Prev
        </button>
        
        {/* Page numbers */}
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
                  ? 'bg-violet-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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



// 'use client';

// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { FiSearch, FiActivity } from 'react-icons/fi';

// interface CoinData {
//   id: string;
//   symbol: string;
//   name: string;
//   image: string;
//   current_price: number;
//   price_change_percentage_24h: number;
//   price_change_percentage_1h_in_currency?: number;
//   price_change_percentage_7d_in_currency?: number;
//   market_cap: number;
//   total_volume: number;
//   market_cap_rank: number;
// }

// export default function TradingSignals() {
//   const [coins, setCoins] = useState<CoinData[]>([]);
//   const [filteredCoins, setFilteredCoins] = useState<CoinData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedTimeframe, setSelectedTimeframe] = useState('1H');

//   useEffect(() => {
//     fetchMarketData();
//   }, []);

//   const fetchMarketData = async () => {
//     try {
//       const response = await axios.get(
//         'https://api.coingecko.com/api/v3/coins/markets',
//         {
//           params: {
//             vs_currency: 'usd',
//             order: 'volume_desc',
//             per_page: 50,
//             page: 1,
//             sparkline: false,
//             price_change_percentage: '1h,24h,7d,30d'
//           }
//         }
//       );
      
//       const data = response.data;
//       setCoins(data);
//       setFilteredCoins(data);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setLoading(false);
//     }
//   };

//   // Format market cap
//   const formatMarketCap = (cap: number): string => {
//     if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
//     if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
//     return `$${cap.toLocaleString()}`;
//   };

//   // Format volume
//   const formatVolume = (vol: number): string => {
//     if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
//     if (vol >= 1e6) return `$${(vol / 1e6).toFixed(0)}M`;
//     return `$${vol.toLocaleString()}`;
//   };

//   // Filter coins based on search
//   useEffect(() => {
//     if (searchTerm === '') {
//       setFilteredCoins(coins);
//     } else {
//       const filtered = coins.filter(coin =>
//         coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       setFilteredCoins(filtered);
//     }
//   }, [searchTerm, coins]);

//   // Calculate stats
//   const bullishCount = filteredCoins.filter(coin => coin.price_change_percentage_24h > 0).length;
//   const bearishCount = filteredCoins.filter(coin => coin.price_change_percentage_24h < 0).length;
  
//   const scores = filteredCoins.map(coin => {
//     const change = Math.abs(coin.price_change_percentage_24h);
//     return Math.min(100, Math.round(50 + change * 3));
//   });
//   const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

//   // Get top signals
//   const topSignals = filteredCoins.slice(0, 10).map((coin, index) => ({
//     id: coin.id,
//     rank: index + 1,
//     name: coin.name,
//     symbol: coin.symbol.toUpperCase(),
//     signal: coin.price_change_percentage_24h > 0 ? 'BUY' : 'SELL',
//     score: Math.min(100, Math.round(50 + Math.abs(coin.price_change_percentage_24h) * 3)),
//     price: coin.current_price,
//     change1h: coin.price_change_percentage_1h_in_currency || 0,
//     change24h: coin.price_change_percentage_24h,
//     volume: formatVolume(coin.total_volume),
//     marketCap: formatMarketCap(coin.market_cap),
//     volatility: Math.abs(Math.round(coin.price_change_percentage_24h * 2)),
//     timestamp: new Date().toLocaleString('en-US', { 
//       month: 'short', 
//       day: 'numeric', 
//       hour: '2-digit', 
//       minute: '2-digit' 
//     })
//   }));

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64 bg-[#0a0e1a]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
//           <p className="mt-4 text-gray-400">Loading market data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#ececed]  text-gray-200">
//       {/* Main Content - Matching Screenshot Design */}
//       <div className="max-w-9xl mx-auto px-4 py-6">
        
//         {/* BINANCE SPOT Header */}
//         <div className='flex justify-between'>
//           <div className="mb-6">
//           <h1 className="text-2xl font-bold text-white">BINANCE SPOT</h1>
//           <p className="text-green-500 text-sm">EMA CROSSOVER</p>
//         </div>
//         <div>
//  <h1 className="text-2xl font-bold text-white">BINANCE SPOT</h1>
//           <p className="text-green-500 text-sm">EMA CROSSOVER</p>
//         </div>
//         </div>

//         {/* Stats Cards - Exactly as screenshot */}
//         <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
//           {/* Card 1: BULLISH / BUY SIGNALS */}
//           <div className="bg-[#131824] rounded-lg p-4 text-center">
//             <p className="text-gray-400 text-sm">BULLISH</p>
//             <p className="text-3xl font-bold text-green-500">{bullishCount}</p>
//             <p className="text-xs text-gray-500">BUY SIGNALS DETECTED</p>
//           </div>
          
//           {/* Card 2: BEARISH / SELL SIGNALS */}
//           <div className="bg-[#131824] rounded-lg p-4 text-center">
//             <p className="text-gray-400 text-sm">BEARISH</p>
//             <p className="text-3xl font-bold text-red-500">{bearishCount}</p>
//             <p className="text-xs text-gray-500">SELL SIGNALS DETECTED</p>
//           </div>
          
//           {/* Card 3: AVERAGE SIGNAL SCORE */}
//           <div className="bg-[#131824] rounded-lg p-4 text-center">
//             <p className="text-gray-400 text-sm">AVERAGE SIGNAL SCORE</p>
//             <p className="text-3xl font-bold text-yellow-500">{avgScore}</p>
//           </div>
          
//           {/* Card 4: TOP */}
//           <div className="bg-[#131824] rounded-lg p-4 text-center">
//             <p className="text-gray-400 text-sm">TOP</p>
//             <p className="text-xl font-bold text-white">EUL</p>
//             <p className="text-green-500 text-sm">+14.37% (24H)</p>
//           </div>

//           {/* Card 5: Extra stats */}
//           <div className="bg-[#131824] rounded-lg p-4 text-center">
//             <p className="text-gray-400 text-sm">TOTAL</p>
//             <p className="text-3xl font-bold text-white">{filteredCoins.length}</p>
//             <p className="text-xs text-gray-500">SIGNALS</p>
//           </div>
//         </div>

//         {/* Timeframe Selector - 15M, 1H, 4H, 1D */}
//         <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-gray-800">
//           {['15M', '1H', '4H', '1D'].map(tf => (
//             <button
//               key={tf}
//               onClick={() => setSelectedTimeframe(tf)}
//               className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
//                 selectedTimeframe === tf 
//                   ? 'bg-green-500 text-black' 
//                   : 'text-gray-400 hover:text-white'
//               }`}
//             >
//               {tf}
//             </button>
//           ))}
//         </div>

//         {/* Search Bar */}
//         <div className="relative mb-6">
//           <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by symbol or name..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full bg-[#131824] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-green-500"
//           />
//         </div>

//         {/* Signals Table - Exactly matching screenshot columns */}
//         <div className="bg-[#131824] rounded-lg overflow-x-auto">
//           <div className="px-4 py-3 border-b border-gray-700">
//             <p className="text-gray-400">{filteredCoins.length} Signals</p>
//           </div>
          
//           <table className="w-full min-w-[800px]">
//             <thead className="bg-[#0d1117] border-b border-gray-700">
//               <tr className="text-left text-gray-400 text-xs">
//                 <th className="px-4 py-3">#</th>
//                 <th className="px-4 py-3">COIN</th>
//                 <th className="px-4 py-3">SIGNAL & TIMING</th>
//                 <th className="px-4 py-3">SCORE</th>
//                 <th className="px-4 py-3">PRICE</th>
//                 <th className="px-4 py-3">1H</th>
//                 <th className="px-4 py-3">24H</th>
//                 <th className="px-4 py-3">VOLUME</th>
//                 <th className="px-4 py-3">MARKET CAP</th>
//                 <th className="px-4 py-3">VOLATILITY</th>
//               </tr>
//             </thead>
//             <tbody>
//               {topSignals.map((signal) => (
//                 <tr key={signal.id} className="border-b border-gray-700 hover:bg-[#1a2029] transition-colors">
//                   {/* # Column */}
//                   <td className="px-4 py-3 text-gray-400 text-sm">
//                     {signal.rank}
//                   </td>
                  
//                   {/* COIN Column */}
//                   <td className="px-4 py-3">
//                     <div>
//                       <p className="font-medium text-white text-sm">
//                         {signal.symbol} #{signal.rank}
//                       </p>
//                       <p className="text-xs text-gray-500">{signal.name}</p>
//                     </div>
//                   </td>
                  
//                   {/* SIGNAL & TIMING Column */}
//                   <td className="px-4 py-3">
//                     <div>
//                       <span className={`px-2 py-1 rounded text-xs font-bold ${
//                         signal.signal === 'BUY' 
//                           ? 'bg-green-900 text-green-500' 
//                           : 'bg-red-900 text-red-500'
//                       }`}>
//                         {signal.signal}
//                       </span>
//                       <p className="text-xs text-gray-500 mt-1">{signal.timestamp}</p>
//                     </div>
//                   </td>
                  
//                   {/* SCORE Column */}
//                   <td className="px-4 py-3">
//                     <span className="text-white font-bold text-sm">
//                       {signal.score}
//                     </span>
//                   </td>
                  
//                   {/* PRICE Column */}
//                   <td className="px-4 py-3 font-mono text-sm text-white">
//                     ${signal.price.toLocaleString()}
//                   </td>
                  
//                   {/* 1H Column */}
//                   <td className={`px-4 py-3 text-sm ${signal.change1h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
//                     {signal.change1h >= 0 ? '▲' : '▼'} {Math.abs(signal.change1h).toFixed(2)}%
//                   </td>
                  
//                   {/* 24H Column */}
//                   <td className={`px-4 py-3 text-sm ${signal.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
//                     {signal.change24h >= 0 ? '▲' : '▼'} {Math.abs(signal.change24h).toFixed(2)}%
//                   </td>
                  
//                   {/* VOLUME Column */}
//                   <td className="px-4 py-3 text-gray-300 text-sm">
//                     {signal.volume}
//                   </td>
                  
//                   {/* MARKET CAP Column */}
//                   <td className="px-4 py-3 text-gray-300 text-sm">
//                     {signal.marketCap}
//                   </td>
                  
//                   {/* VOLATILITY Column */}
//                   <td className="px-4 py-3">
//                     <span className="text-white text-sm">
//                       {signal.volatility}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

      
//       </div>
//     </div>
//   );
// }