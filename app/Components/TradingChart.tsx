// // 'use client';

// // import { useEffect, useRef, useState } from 'react';
// // import { createChart, IChartApi, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
// // import axios from 'axios';
// // import { FiActivity, FiTrendingUp, FiTrendingDown, FiRefreshCw } from 'react-icons/fi';

// // interface ChartData {
// //   time: number;
// //   open: number;
// //   high: number;
// //   low: number;
// //   close: number;
// // }

// // interface IndicatorData {
// //   time: number;
// //   value: number;
// // }

// // export default function TradingChart() {
// //   const chartContainerRef = useRef<HTMLDivElement>(null);
// //   const chartRef = useRef<IChartApi | null>(null);
// //   const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
// //   const [selectedInterval, setSelectedInterval] = useState('1H');
// //   const [currentPrice, setCurrentPrice] = useState(0);
// //   const [priceChange, setPriceChange] = useState(0);
// //   const [high24h, setHigh24h] = useState(0);
// //   const [low24h, setLow24h] = useState(0);
// //   const [volume, setVolume] = useState(0);
// //   const [loading, setLoading] = useState(true);
// //   const [showMACD, setShowMACD] = useState(true);
// //   const [showRSI, setShowRSI] = useState(false);
// //   const [showStoch, setShowStoch] = useState(false);

// //   const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT'];
// //   const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

// //   // Fetch chart data from Binance
// //   const fetchChartData = async (symbol: string, interval: string) => {
// //     try {
// //       const response = await axios.get('https://api.binance.com/api/v3/klines', {
// //         params: {
// //           symbol: symbol,
// //           interval: interval,
// //           limit: 200,
// //         },
// //       });

// //       const data = response.data.map((kline: any) => ({
// //         time: kline[0] / 1000,
// //         open: parseFloat(kline[1]),
// //         high: parseFloat(kline[2]),
// //         low: parseFloat(kline[3]),
// //         close: parseFloat(kline[4]),
// //       }));

// //       return data;
// //     } catch (error) {
// //       console.error('Error fetching chart data:', error);
// //       return generateMockData();
// //     }
// //   };

// //   // Fetch 24hr ticker data
// //   const fetchTickerData = async (symbol: string) => {
// //     try {
// //       const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr', {
// //         params: { symbol: symbol }
// //       });
      
// //       setCurrentPrice(parseFloat(response.data.lastPrice));
// //       setPriceChange(parseFloat(response.data.priceChangePercent));
// //       setHigh24h(parseFloat(response.data.highPrice));
// //       setLow24h(parseFloat(response.data.lowPrice));
// //       setVolume(parseFloat(response.data.volume));
// //     } catch (error) {
// //       console.error('Error fetching ticker:', error);
// //     }
// //   };

// //   // Calculate EMA
// //   const calculateEMA = (data: ChartData[], period: number): IndicatorData[] => {
// //     const ema: IndicatorData[] = [];
// //     const multiplier = 2 / (period + 1);
    
// //     for (let i = 0; i < data.length; i++) {
// //       if (i < period - 1) {
// //         ema.push({ time: data[i].time, value: data[i].close });
// //         continue;
// //       }
      
// //       if (i === period - 1) {
// //         const sum = data.slice(0, period).reduce((acc, d) => acc + d.close, 0);
// //         const initialEMA = sum / period;
// //         ema.push({ time: data[i].time, value: initialEMA });
// //       } else {
// //         const emaValue = (data[i].close - ema[i - 1].value) * multiplier + ema[i - 1].value;
// //         ema.push({ time: data[i].time, value: emaValue });
// //       }
// //     }
    
// //     return ema;
// //   };

// //   // Calculate RSI
// //   const calculateRSI = (data: ChartData[], period: number = 14): IndicatorData[] => {
// //     const rsi: IndicatorData[] = [];
// //     const gains: number[] = [];
// //     const losses: number[] = [];
    
// //     for (let i = 1; i < data.length; i++) {
// //       const change = data[i].close - data[i - 1].close;
// //       gains.push(change > 0 ? change : 0);
// //       losses.push(change < 0 ? -change : 0);
// //     }
    
// //     for (let i = period; i < data.length; i++) {
// //       const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
// //       const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      
// //       const rs = avgGain / avgLoss;
// //       const rsiValue = 100 - (100 / (1 + rs));
      
// //       rsi.push({
// //         time: data[i].time,
// //         value: rsiValue,
// //       });
// //     }
    
// //     return rsi;
// //   };

// //   // Calculate MACD
// //   const calculateMACD = (data: ChartData[]) => {
// //     const ema12 = calculateEMA(data, 12);
// //     const ema26 = calculateEMA(data, 26);
    
// //     const macdLine: IndicatorData[] = [];
// //     const signalLine: IndicatorData[] = [];
    
// //     for (let i = 0; i < ema12.length; i++) {
// //       if (ema26[i]) {
// //         macdLine.push({
// //           time: data[i].time,
// //           value: ema12[i].value - ema26[i].value,
// //         });
// //       }
// //     }
    
// //     // Calculate signal line (9-period EMA of MACD)
// //     for (let i = 8; i < macdLine.length; i++) {
// //       const sum = macdLine.slice(i - 8, i + 1).reduce((acc, m) => acc + m.value, 0);
// //       signalLine.push({
// //         time: macdLine[i].time,
// //         value: sum / 9,
// //       });
// //     }
    
// //     return { macdLine, signalLine };
// //   };

// //   // Calculate Stochastic RSI
// //   const calculateStochRSI = (data: ChartData[], period: number = 14) => {
// //     const rsi = calculateRSI(data, period);
// //     const stoch: IndicatorData[] = [];
    
// //     for (let i = period - 1; i < rsi.length; i++) {
// //       const rsiSlice = rsi.slice(i - period + 1, i + 1);
// //       const maxRSI = Math.max(...rsiSlice.map(r => r.value));
// //       const minRSI = Math.min(...rsiSlice.map(r => r.value));
      
// //       const stochValue = ((rsi[i].value - minRSI) / (maxRSI - minRSI)) * 100;
// //       stoch.push({
// //         time: rsi[i].time,
// //         value: stochValue,
// //       });
// //     }
    
// //     return stoch;
// //   };

// //   // Update chart with all indicators
// //   const updateChart = async () => {
// //     setLoading(true);
    
// //     const data = await fetchChartData(selectedSymbol, selectedInterval);
// //     await fetchTickerData(selectedSymbol);
    
// //     if (chartRef.current) {
// //       chartRef.current.remove();
// //     }
    
// //     if (!chartContainerRef.current) return;
    
// //     // Create main chart
// //     const chart = createChart(chartContainerRef.current, {
// //       width: chartContainerRef.current.clientWidth,
// //       height: 500,
// //       layout: {
// //         background: { color: '#131824' },
// //         textColor: '#d1d4dc',
// //       },
// //       grid: {
// //         vertLines: { color: '#1e2538' },
// //         horzLines: { color: '#1e2538' },
// //       },
// //       crosshair: {
// //         mode: 1,
// //       },
// //       rightPriceScale: {
// //         borderColor: '#2a2e3d',
// //       },
// //       timeScale: {
// //         borderColor: '#2a2e3d',
// //         timeVisible: true,
// //         secondsVisible: false,
// //       },
// //     });
    
// //     chartRef.current = chart;
    
// //     // Add candlestick series
// //     const candlestickSeries = chart.addSeries(CandlestickSeries, {
// //       upColor: '#26a69a',
// //       downColor: '#ef5350',
// //       borderVisible: false,
// //       wickUpColor: '#26a69a',
// //       wickDownColor: '#ef5350',
// //     });
    
// //     candlestickSeries.setData(data);
    
// //     // Add EMA 7
// //     const ema7 = calculateEMA(data, 7);
// //     const ema7Series = chart.addSeries(LineSeries, {
// //       color: '#2962FF',
// //       lineWidth: 1,
// //       title: 'EMA 7',
// //     });
// //     ema7Series.setData(ema7);
    
// //     // Add EMA 25
// //     const ema25 = calculateEMA(data, 25);
// //     const ema25Series = chart.addSeries(LineSeries, {
// //       color: '#FF6D00',
// //       lineWidth: 1,
// //       title: 'EMA 25',
// //     });
// //     ema25Series.setData(ema25);
    
// //     // Add EMA 99
// //     const ema99 = calculateEMA(data, 99);
// //     const ema99Series = chart.addSeries(LineSeries, {
// //       color: '#E040FB',
// //       lineWidth: 1,
// //       title: 'EMA 99',
// //     });
// //     ema99Series.setData(ema99);
    
// //     chart.timeScale().fitContent();
    
// //     setLoading(false);
// //   };

// //   const generateMockData = (): ChartData[] => {
// //     const data: ChartData[] = [];
// //     let price = 50000;
// //     const now = Math.floor(Date.now() / 1000);
    
// //     for (let i = 200; i > 0; i--) {
// //       const change = (Math.random() - 0.5) * 200;
// //       price += change;
// //       data.push({
// //         time: now - i * 300,
// //         open: price - change / 2,
// //         high: price + Math.abs(change),
// //         low: price - Math.abs(change),
// //         close: price,
// //       });
// //     }
    
// //     return data;
// //   };

// //   useEffect(() => {
// //     updateChart();
    
// //     const handleResize = () => {
// //       if (chartRef.current && chartContainerRef.current) {
// //         chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
// //       }
// //     };
    
// //     window.addEventListener('resize', handleResize);
// //     return () => window.removeEventListener('resize', handleResize);
// //   }, [selectedSymbol, selectedInterval]);

// //   return (
// //     <div className="bg-[#0a0e1a] min-h-screen p-4">
// //       <div className="max-w-7xl mx-auto">
// //         {/* Header */}
// //         <div className="bg-[#131824] rounded-lg p-4 mb-4">
// //           <div className="flex flex-wrap items-center justify-between gap-4">
// //             <div className="flex items-center gap-4">
// //               <select
// //                 value={selectedSymbol}
// //                 onChange={(e) => setSelectedSymbol(e.target.value)}
// //                 className="bg-[#1e2538] text-white px-4 py-2 rounded-lg font-bold"
// //               >
// //                 {symbols.map(sym => (
// //                   <option key={sym} value={sym}>{sym}</option>
// //                 ))}
// //               </select>
              
// //               <div className="flex gap-1">
// //                 {timeframes.map(tf => (
// //                   <button
// //                     key={tf}
// //                     onClick={() => setSelectedInterval(tf)}
// //                     className={`px-3 py-1 rounded text-sm font-medium transition ${
// //                       selectedInterval === tf
// //                         ? 'bg-green-500 text-white'
// //                         : 'bg-[#1e2538] text-gray-400 hover:bg-[#2a2e3d]'
// //                     }`}
// //                   >
// //                     {tf.toUpperCase()}
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>
            
// //             <div className="flex items-center gap-4">
// //               <div className="text-right">
// //                 <div className="text-2xl font-bold text-white">
// //                   ${currentPrice.toLocaleString()}
// //                 </div>
// //                 <div className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
// //                   {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
// //                 </div>
// //               </div>
              
// //               <button
// //                 onClick={() => updateChart()}
// //                 className="p-2 rounded-lg bg-[#1e2538] hover:bg-[#2a2e3d]"
// //               >
// //                 <FiRefreshCw className="text-gray-400" />
// //               </button>
// //             </div>
// //           </div>
          
// //           {/* 24h Stats */}
// //           <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-[#1e2538]">
// //             <div>
// //               <div className="text-xs text-gray-500">24h High</div>
// //               <div className="text-sm text-white">${high24h.toLocaleString()}</div>
// //             </div>
// //             <div>
// //               <div className="text-xs text-gray-500">24h Low</div>
// //               <div className="text-sm text-white">${low24h.toLocaleString()}</div>
// //             </div>
// //             <div>
// //               <div className="text-xs text-gray-500">24h Volume</div>
// //               <div className="text-sm text-white">{(volume / 1000000).toFixed(2)}M</div>
// //             </div>
// //           </div>
// //         </div>
        
// //         {/* Chart Container */}
// //         <div className="bg-[#131824] rounded-lg p-4">
// //           {loading && (
// //             <div className="flex items-center justify-center h-[500px]">
// //               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
// //             </div>
// //           )}
// //           <div ref={chartContainerRef} className="w-full h-[500px]" />
// //         </div>
        
// //         {/* Indicator Toggles */}
// //         <div className="bg-[#131824] rounded-lg p-4 mt-4">
// //           <div className="flex flex-wrap gap-4">
// //             <button
// //               onClick={() => setShowMACD(!showMACD)}
// //               className={`px-3 py-1 rounded text-xs font-medium transition ${
// //                 showMACD ? 'bg-blue-500 text-white' : 'bg-[#1e2538] text-gray-400'
// //               }`}
// //             >
// //               MACD
// //             </button>
// //             <button
// //               onClick={() => setShowRSI(!showRSI)}
// //               className={`px-3 py-1 rounded text-xs font-medium transition ${
// //                 showRSI ? 'bg-blue-500 text-white' : 'bg-[#1e2538] text-gray-400'
// //               }`}
// //             >
// //               RSI
// //             </button>
// //             <button
// //               onClick={() => setShowStoch(!showStoch)}
// //               className={`px-3 py-1 rounded text-xs font-medium transition ${
// //                 showStoch ? 'bg-blue-500 text-white' : 'bg-[#1e2538] text-gray-400'
// //               }`}
// //             >
// //               STOCH RSI
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }



// // 'use client';

// // import { useEffect, useRef, useState } from 'react';
// // import { createChart, IChartApi, CandlestickSeries, LineSeries } from 'lightweight-charts';
// // import axios from 'axios';
// // import { FiRefreshCw } from 'react-icons/fi';

// // interface ChartData {
// //   time: number;
// //   open: number;
// //   high: number;
// //   low: number;
// //   close: number;
// // }

// // export default function TradingChart() {
// //   const chartContainerRef = useRef<HTMLDivElement>(null);
// //   const chartRef = useRef<IChartApi | null>(null);
// //   const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD');
// //   const [selectedInterval, setSelectedInterval] = useState('60');
// //   const [currentPrice, setCurrentPrice] = useState(0);
// //   const [priceChange, setPriceChange] = useState(0);
// //   const [high24h, setHigh24h] = useState(0);
// //   const [low24h, setLow24h] = useState(0);
// //   const [volume, setVolume] = useState(0);
// //   const [loading, setLoading] = useState(true);

// //   const symbols = [
// //     { name: 'BTC/USD', pair: 'XBTUSD' },
// //     { name: 'ETH/USD', pair: 'ETHUSD' },
// //     { name: 'SOL/USD', pair: 'SOLUSD' },
// //     { name: 'ADA/USD', pair: 'ADAUSD' },
// //     { name: 'DOT/USD', pair: 'DOTUSD' },
// //     { name: 'AVAX/USD', pair: 'AVAXUSD' },
// //     { name: 'MATIC/USD', pair: 'MATICUSD' }
// //   ];

// //   const timeframes = [
// //     { label: '1m', value: '1' },
// //     { label: '5m', value: '5' },
// //     { label: '15m', value: '15' },
// //     { label: '30m', value: '30' },
// //     { label: '1h', value: '60' },
// //     { label: '4h', value: '240' },
// //     { label: '1d', value: '1440' }
// //   ];

// //   // Fetch OHLC data from Kraken (no CORS issues)
// //   const fetchChartData = async (pair: string, interval: string) => {
// //     try {
// //       const response = await axios.get('https://api.kraken.com/0/public/OHLC', {
// //         params: {
// //           pair: pair,
// //           interval: interval,
// //         },
// //         timeout: 10000
// //       });
      
// //       const data = response.data.result[pair];
      
// //       if (!data || data.length === 0) {
// //         throw new Error('No data received');
// //       }
      
// //       const formattedData: ChartData[] = data.map((item: any) => ({
// //         time: item[0],
// //         open: parseFloat(item[1]),
// //         high: parseFloat(item[2]),
// //         low: parseFloat(item[3]),
// //         close: parseFloat(item[4]),
// //       }));
      
// //       return formattedData;
// //     } catch (error) {
// //       console.error('Error fetching from Kraken:', error);
// //       return generateMockData();
// //     }
// //   };

// //   // Fetch ticker data from Kraken
// //   const fetchTickerData = async (pair: string) => {
// //     try {
// //       const response = await axios.get('https://api.kraken.com/0/public/Ticker', {
// //         params: { pair: pair },
// //         timeout: 10000
// //       });
      
// //       const ticker = response.data.result[pair];
      
// //       if (ticker) {
// //         const current = parseFloat(ticker.c[0]);
// //         const open = parseFloat(ticker.o);
// //         const change = ((current - open) / open) * 100;
        
// //         setCurrentPrice(current);
// //         setPriceChange(change);
// //         setHigh24h(parseFloat(ticker.h[1]));
// //         setLow24h(parseFloat(ticker.l[1]));
// //         setVolume(parseFloat(ticker.v[1]));
// //       }
// //     } catch (error) {
// //       console.error('Error fetching ticker:', error);
// //       // Set mock data
// //       setCurrentPrice(50000);
// //       setPriceChange(2.5);
// //       setHigh24h(51000);
// //       setLow24h(49000);
// //       setVolume(15000);
// //     }
// //   };

// //   const generateMockData = (): ChartData[] => {
// //     const data: ChartData[] = [];
// //     let price = 50000;
// //     const now = Math.floor(Date.now() / 1000);
    
// //     for (let i = 200; i > 0; i--) {
// //       const change = (Math.random() - 0.5) * 200;
// //       price += change;
// //       data.push({
// //         time: now - i * 300,
// //         open: price - change / 2,
// //         high: price + Math.abs(change) + Math.random() * 50,
// //         low: price - Math.abs(change) - Math.random() * 50,
// //         close: price,
// //       });
// //     }
    
// //     return data;
// //   };

// //   // Calculate EMA
// //   const calculateEMA = (data: ChartData[], period: number): { time: number; value: number }[] => {
// //     const ema: { time: number; value: number }[] = [];
// //     const multiplier = 2 / (period + 1);
    
// //     for (let i = 0; i < data.length; i++) {
// //       if (i < period - 1) {
// //         ema.push({ time: data[i].time, value: data[i].close });
// //         continue;
// //       }
      
// //       if (i === period - 1) {
// //         const sum = data.slice(0, period).reduce((acc, d) => acc + d.close, 0);
// //         ema.push({ time: data[i].time, value: sum / period });
// //       } else {
// //         const emaValue = (data[i].close - ema[i - 1].value) * multiplier + ema[i - 1].value;
// //         ema.push({ time: data[i].time, value: emaValue });
// //       }
// //     }
    
// //     return ema;
// //   };

// //   const updateChart = async () => {
// //     setLoading(true);
    
// //     const selectedPair = symbols.find(s => s.name === selectedSymbol)?.pair || 'XBTUSD';
// //     const intervalValue = timeframes.find(t => t.label === selectedInterval)?.value || '60';
    
// //     const data = await fetchChartData(selectedPair, intervalValue);
// //     await fetchTickerData(selectedPair);
    
// //     if (chartRef.current) {
// //       chartRef.current.remove();
// //     }
    
// //     if (!chartContainerRef.current) return;
    
// //     // Create chart
// //     const chart = createChart(chartContainerRef.current, {
// //       width: chartContainerRef.current.clientWidth,
// //       height: 500,
// //       layout: {
// //         background: { color: '#131824' },
// //         textColor: '#d1d4dc',
// //       },
// //       grid: {
// //         vertLines: { color: '#1e2538' },
// //         horzLines: { color: '#1e2538' },
// //       },
// //       crosshair: {
// //         mode: 1,
// //       },
// //       rightPriceScale: {
// //         borderColor: '#2a2e3d',
// //       },
// //       timeScale: {
// //         borderColor: '#2a2e3d',
// //         timeVisible: true,
// //         secondsVisible: false,
// //       },
// //     });
    
// //     chartRef.current = chart;
    
// //     // Add candlestick series
// //     const candlestickSeries = chart.addSeries(CandlestickSeries, {
// //       upColor: '#26a69a',
// //       downColor: '#ef5350',
// //       borderVisible: false,
// //       wickUpColor: '#26a69a',
// //       wickDownColor: '#ef5350',
// //     });
    
// //     candlestickSeries.setData(data);
    
// //     // Add EMA 7
// //     const ema7 = calculateEMA(data, 7);
// //     const ema7Series = chart.addSeries(LineSeries, {
// //       color: '#2962FF',
// //       lineWidth: 1,
// //       title: 'EMA 7',
// //     });
// //     ema7Series.setData(ema7);
    
// //     // Add EMA 25
// //     const ema25 = calculateEMA(data, 25);
// //     const ema25Series = chart.addSeries(LineSeries, {
// //       color: '#FF6D00',
// //       lineWidth: 1,
// //       title: 'EMA 25',
// //     });
// //     ema25Series.setData(ema25);
    
// //     // Add EMA 99
// //     const ema99 = calculateEMA(data, 99);
// //     const ema99Series = chart.addSeries(LineSeries, {
// //       color: '#E040FB',
// //       lineWidth: 1,
// //       title: 'EMA 99',
// //     });
// //     ema99Series.setData(ema99);
    
// //     chart.timeScale().fitContent();
    
// //     setLoading(false);
// //   };

// //   useEffect(() => {
// //     updateChart();
    
// //     const handleResize = () => {
// //       if (chartRef.current && chartContainerRef.current) {
// //         chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
// //       }
// //     };
    
// //     window.addEventListener('resize', handleResize);
    
// //     // Refresh every 30 seconds
// //     const interval = setInterval(() => {
// //       updateChart();
// //     }, 30000);
    
// //     return () => {
// //       window.removeEventListener('resize', handleResize);
// //       clearInterval(interval);
// //       if (chartRef.current) {
// //         chartRef.current.remove();
// //       }
// //     };
// //   }, [selectedSymbol, selectedInterval]);

// //   return (
// //     <div className="bg-[#0a0e1a] min-h-screen p-4">
// //       <div className="max-w-7xl mx-auto">
// //         {/* Header */}
// //         <div className="bg-[#131824] rounded-lg p-4 mb-4">
// //           <div className="flex flex-wrap items-center justify-between gap-4">
// //             <div className="flex items-center gap-4">
// //               <select
// //                 value={selectedSymbol}
// //                 onChange={(e) => setSelectedSymbol(e.target.value)}
// //                 className="bg-[#1e2538] text-white px-4 py-2 rounded-lg font-bold cursor-pointer"
// //               >
// //                 {symbols.map(sym => (
// //                   <option key={sym.name} value={sym.name}>{sym.name}</option>
// //                 ))}
// //               </select>
              
// //               <div className="flex gap-1 flex-wrap">
// //                 {timeframes.map(tf => (
// //                   <button
// //                     key={tf.label}
// //                     onClick={() => setSelectedInterval(tf.label)}
// //                     className={`px-3 py-1 rounded text-sm font-medium transition ${
// //                       selectedInterval === tf.label
// //                         ? 'bg-green-500 text-white'
// //                         : 'bg-[#1e2538] text-gray-400 hover:bg-[#2a2e3d]'
// //                     }`}
// //                   >
// //                     {tf.label}
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>
            
// //             <div className="flex items-center gap-4">
// //               <div className="text-right">
// //                 <div className="text-2xl font-bold text-white">
// //                   ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// //                 </div>
// //                 <div className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
// //                   {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
// //                 </div>
// //               </div>
              
// //               <button
// //                 onClick={() => updateChart()}
// //                 className="p-2 rounded-lg bg-[#1e2538] hover:bg-[#2a2e3d] transition"
// //               >
// //                 <FiRefreshCw className="text-gray-400" />
// //               </button>
// //             </div>
// //           </div>
          
// //           {/* 24h Stats */}
// //           <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-[#1e2538]">
// //             <div>
// //               <div className="text-xs text-gray-500">24h High</div>
// //               <div className="text-sm text-white">${high24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
// //             </div>
// //             <div>
// //               <div className="text-xs text-gray-500">24h Low</div>
// //               <div className="text-sm text-white">${low24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
// //             </div>
// //             <div>
// //               <div className="text-xs text-gray-500">24h Volume</div>
// //               <div className="text-sm text-white">${(volume / 1000000).toFixed(2)}M</div>
// //             </div>
// //           </div>
// //         </div>
        
// //         {/* Chart Container */}
// //         <div className="bg-[#131824] rounded-lg p-4">
// //           {loading && (
// //             <div className="flex items-center justify-center h-[500px]">
// //               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
// //             </div>
// //           )}
// //           <div ref={chartContainerRef} className="w-full h-[500px]" />
// //         </div>
        
// //         {/* Indicator Info */}
// //         <div className="bg-[#131824] rounded-lg p-4 mt-4">
// //           <div className="flex gap-4 text-xs">
// //             <div className="flex items-center gap-2">
// //               <div className="w-3 h-3 rounded-full bg-[#2962FF]"></div>
// //               <span className="text-gray-400">EMA 7</span>
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <div className="w-3 h-3 rounded-full bg-[#FF6D00]"></div>
// //               <span className="text-gray-400">EMA 25</span>
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <div className="w-3 h-3 rounded-full bg-[#E040FB]"></div>
// //               <span className="text-gray-400">EMA 99</span>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }



// // 'use client';

// // import { useEffect, useRef, useState } from 'react';
// // import { createChart, IChartApi, CandlestickSeries, LineSeries } from 'lightweight-charts';
// // import axios from 'axios';
// // import { FiRefreshCw } from 'react-icons/fi';

// // interface ChartData {
// //   time: number;
// //   open: number;
// //   high: number;
// //   low: number;
// //   close: number;
// // }

// // export default function TradingChart() {
// //   const chartContainerRef = useRef<HTMLDivElement>(null);
// //   const chartRef = useRef<IChartApi | null>(null);
// //   const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD');
// //   const [selectedInterval, setSelectedInterval] = useState('60');
// //   const [currentPrice, setCurrentPrice] = useState(0);
// //   const [priceChange, setPriceChange] = useState(0);
// //   const [high24h, setHigh24h] = useState(0);
// //   const [low24h, setLow24h] = useState(0);
// //   const [volume, setVolume] = useState(0);
// //   const [loading, setLoading] = useState(true);

// //   const symbols = [
// //     { name: 'BTC/USD', pair: 'XBT/USD' },
// //     { name: 'ETH/USD', pair: 'ETH/USD' },
// //     { name: 'SOL/USD', pair: 'SOL/USD' },
// //     { name: 'ADA/USD', pair: 'ADA/USD' },
// //     { name: 'DOT/USD', pair: 'DOT/USD' },
// //     { name: 'AVAX/USD', pair: 'AVAX/USD' },
// //     { name: 'MATIC/USD', pair: 'MATIC/USD' }
// //   ];

// //   const timeframes = [
// //     { label: '1m', value: '1' },
// //     { label: '5m', value: '5' },
// //     { label: '15m', value: '15' },
// //     { label: '30m', value: '30' },
// //     { label: '1h', value: '60' },
// //     { label: '4h', value: '240' },
// //     { label: '1d', value: '1440' }
// //   ];

// //   // Fetch OHLC data from Kraken
// //   const fetchChartData = async (pair: string, interval: string) => {
// //     try {
// //       // Format pair for Kraken API (remove slash)
// //       const krakenPair = pair.replace('/', '');
      
// //       const response = await axios.get('https://api.kraken.com/0/public/OHLC', {
// //         params: {
// //           pair: krakenPair,
// //           interval: interval,
// //         },
// //         timeout: 10000
// //       });
      
// //       // Check if we got data
// //       if (!response.data.result) {
// //         throw new Error('No result from API');
// //       }
      
// //       const data = response.data.result[krakenPair];
      
// //       if (!data || data.length === 0) {
// //         // Try alternative pair format
// //         const altPair = pair.replace('/', '').toUpperCase();
// //         const altData = response.data.result[altPair];
// //         if (!altData || altData.length === 0) {
// //           throw new Error('No data received');
// //         }
// //         const formattedData: ChartData[] = altData.map((item: any) => ({
// //           time: item[0],
// //           open: parseFloat(item[1]),
// //           high: parseFloat(item[2]),
// //           low: parseFloat(item[3]),
// //           close: parseFloat(item[4]),
// //         }));
// //         return formattedData;
// //       }
      
// //       const formattedData: ChartData[] = data.map((item: any) => ({
// //         time: item[0],
// //         open: parseFloat(item[1]),
// //         high: parseFloat(item[2]),
// //         low: parseFloat(item[3]),
// //         close: parseFloat(item[4]),
// //       }));
      
// //       return formattedData;
// //     } catch (error) {
// //       console.error('Error fetching from Kraken:', error);
// //       return generateMockData();
// //     }
// //   };

// //   // Fetch ticker data from Kraken
// //   const fetchTickerData = async (pair: string) => {
// //     try {
// //       const krakenPair = pair.replace('/', '');
      
// //       const response = await axios.get('https://api.kraken.com/0/public/Ticker', {
// //         params: { pair: krakenPair },
// //         timeout: 10000
// //       });
      
// //       const ticker = response.data.result[krakenPair];
      
// //       if (ticker) {
// //         const current = parseFloat(ticker.c[0]);
// //         const open = parseFloat(ticker.o);
// //         const change = ((current - open) / open) * 100;
        
// //         setCurrentPrice(current);
// //         setPriceChange(change);
// //         setHigh24h(parseFloat(ticker.h[1]));
// //         setLow24h(parseFloat(ticker.l[1]));
// //         setVolume(parseFloat(ticker.v[1]));
// //       }
// //     } catch (error) {
// //       console.error('Error fetching ticker:', error);
// //       // Set mock data
// //       setCurrentPrice(50000);
// //       setPriceChange(2.5);
// //       setHigh24h(51000);
// //       setLow24h(49000);
// //       setVolume(15000);
// //     }
// //   };

// //   const generateMockData = (): ChartData[] => {
// //     const data: ChartData[] = [];
// //     let price = 50000;
// //     const now = Math.floor(Date.now() / 1000);
    
// //     for (let i = 200; i > 0; i--) {
// //       const change = (Math.random() - 0.5) * 200;
// //       price += change;
// //       data.push({
// //         time: now - i * 300,
// //         open: price - change / 2,
// //         high: price + Math.abs(change) + Math.random() * 50,
// //         low: price - Math.abs(change) - Math.random() * 50,
// //         close: price,
// //       });
// //     }
    
// //     return data;
// //   };

// //   // Calculate EMA
// //   const calculateEMA = (data: ChartData[], period: number): { time: number; value: number }[] => {
// //     const ema: { time: number; value: number }[] = [];
// //     const multiplier = 2 / (period + 1);
    
// //     for (let i = 0; i < data.length; i++) {
// //       if (i < period - 1) {
// //         ema.push({ time: data[i].time, value: data[i].close });
// //         continue;
// //       }
      
// //       if (i === period - 1) {
// //         const sum = data.slice(0, period).reduce((acc, d) => acc + d.close, 0);
// //         ema.push({ time: data[i].time, value: sum / period });
// //       } else {
// //         const emaValue = (data[i].close - ema[i - 1].value) * multiplier + ema[i - 1].value;
// //         ema.push({ time: data[i].time, value: emaValue });
// //       }
// //     }
    
// //     return ema;
// //   };

// //   const updateChart = async () => {
// //     setLoading(true);
    
// //     try {
// //       const selectedPair = symbols.find(s => s.name === selectedSymbol)?.pair || 'XBT/USD';
// //       const intervalValue = timeframes.find(t => t.label === selectedInterval)?.value || '60';
      
// //       const data = await fetchChartData(selectedPair, intervalValue);
// //       await fetchTickerData(selectedPair);
      
// //       // Safely remove old chart
// //       if (chartRef.current) {
// //         try {
// //           chartRef.current.remove();
// //         } catch (e) {
// //           console.log('Chart already disposed');
// //         }
// //         chartRef.current = null;
// //       }
      
// //       if (!chartContainerRef.current) {
// //         setLoading(false);
// //         return;
// //       }
      
// //       // Create new chart
// //       const chart = createChart(chartContainerRef.current, {
// //         width: chartContainerRef.current.clientWidth,
// //         height: 500,
// //         layout: {
// //           background: { color: '#131824' },
// //           textColor: '#d1d4dc',
// //         },
// //         grid: {
// //           vertLines: { color: '#1e2538' },
// //           horzLines: { color: '#1e2538' },
// //         },
// //         crosshair: {
// //           mode: 1,
// //         },
// //         rightPriceScale: {
// //           borderColor: '#2a2e3d',
// //         },
// //         timeScale: {
// //           borderColor: '#2a2e3d',
// //           timeVisible: true,
// //           secondsVisible: false,
// //         },
// //       });
      
// //       chartRef.current = chart;
      
// //       // Add candlestick series
// //       const candlestickSeries = chart.addSeries(CandlestickSeries, {
// //         upColor: '#26a69a',
// //         downColor: '#ef5350',
// //         borderVisible: false,
// //         wickUpColor: '#26a69a',
// //         wickDownColor: '#ef5350',
// //       });
      
// //       candlestickSeries.setData(data);
      
// //       // Add EMA indicators only if enough data
// //       if (data.length > 99) {
// //         const ema7 = calculateEMA(data, 7);
// //         const ema7Series = chart.addSeries(LineSeries, {
// //           color: '#2962FF',
// //           lineWidth: 1,
// //           title: 'EMA 7',
// //         });
// //         ema7Series.setData(ema7);
        
// //         const ema25 = calculateEMA(data, 25);
// //         const ema25Series = chart.addSeries(LineSeries, {
// //           color: '#FF6D00',
// //           lineWidth: 1,
// //           title: 'EMA 25',
// //         });
// //         ema25Series.setData(ema25);
        
// //         const ema99 = calculateEMA(data, 99);
// //         const ema99Series = chart.addSeries(LineSeries, {
// //           color: '#E040FB',
// //           lineWidth: 1,
// //           title: 'EMA 99',
// //         });
// //         ema99Series.setData(ema99);
// //       }
      
// //       chart.timeScale().fitContent();
// //     } catch (error) {
// //       console.error('Error updating chart:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     updateChart();
    
// //     const handleResize = () => {
// //       if (chartRef.current && chartContainerRef.current) {
// //         try {
// //           chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
// //         } catch (e) {
// //           console.log('Error resizing chart');
// //         }
// //       }
// //     };
    
// //     window.addEventListener('resize', handleResize);
    
// //     // Refresh every 30 seconds
// //     const interval = setInterval(() => {
// //       updateChart();
// //     }, 30000);
    
// //     return () => {
// //       window.removeEventListener('resize', handleResize);
// //       clearInterval(interval);
// //       if (chartRef.current) {
// //         try {
// //           chartRef.current.remove();
// //         } catch (e) {
// //           console.log('Chart already disposed on cleanup');
// //         }
// //       }
// //     };
// //   }, [selectedSymbol, selectedInterval]);

// //   return (
// //     <div className="bg-[#0a0e1a] min-h-screen p-4">
// //       <div className="max-w-7xl mx-auto">
// //         {/* Header */}
// //         <div className="bg-[#131824] rounded-lg p-4 mb-4">
// //           <div className="flex flex-wrap items-center justify-between gap-4">
// //             <div className="flex items-center gap-4 flex-wrap">
// //               <select
// //                 value={selectedSymbol}
// //                 onChange={(e) => setSelectedSymbol(e.target.value)}
// //                 className="bg-[#1e2538] text-white px-4 py-2 rounded-lg font-bold cursor-pointer"
// //               >
// //                 {symbols.map(sym => (
// //                   <option key={sym.name} value={sym.name}>{sym.name}</option>
// //                 ))}
// //               </select>
              
// //               <div className="flex gap-1 flex-wrap">
// //                 {timeframes.map(tf => (
// //                   <button
// //                     key={tf.label}
// //                     onClick={() => setSelectedInterval(tf.label)}
// //                     className={`px-3 py-1 rounded text-sm font-medium transition ${
// //                       selectedInterval === tf.label
// //                         ? 'bg-green-500 text-white'
// //                         : 'bg-[#1e2538] text-gray-400 hover:bg-[#2a2e3d]'
// //                     }`}
// //                   >
// //                     {tf.label}
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>
            
// //             <div className="flex items-center gap-4">
// //               <div className="text-right">
// //                 <div className="text-2xl font-bold text-white">
// //                   ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// //                 </div>
// //                 <div className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
// //                   {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
// //                 </div>
// //               </div>
              
// //               <button
// //                 onClick={() => updateChart()}
// //                 className="p-2 rounded-lg bg-[#1e2538] hover:bg-[#2a2e3d] transition"
// //               >
// //                 <FiRefreshCw className="text-gray-400" />
// //               </button>
// //             </div>
// //           </div>
          
// //           {/* 24h Stats */}
// //           <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-[#1e2538]">
// //             <div>
// //               <div className="text-xs text-gray-500">24h High</div>
// //               <div className="text-sm text-white">${high24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
// //             </div>
// //             <div>
// //               <div className="text-xs text-gray-500">24h Low</div>
// //               <div className="text-sm text-white">${low24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
// //             </div>
// //             <div>
// //               <div className="text-xs text-gray-500">24h Volume</div>
// //               <div className="text-sm text-white">{(volume / 1000000).toFixed(2)}M</div>
// //             </div>
// //           </div>
// //         </div>
        
// //         {/* Chart Container */}
// //         <div className="bg-[#131824] rounded-lg p-4">
// //           {loading && (
// //             <div className="flex items-center justify-center h-[500px]">
// //               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
// //             </div>
// //           )}
// //           <div ref={chartContainerRef} className="w-full h-[500px]" />
// //         </div>
        
// //         {/* Indicator Info */}
// //         <div className="bg-[#131824] rounded-lg p-4 mt-4">
// //           <div className="flex gap-4 text-xs">
// //             <div className="flex items-center gap-2">
// //               <div className="w-3 h-3 rounded-full bg-[#2962FF]"></div>
// //               <span className="text-gray-400">EMA 7</span>
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <div className="w-3 h-3 rounded-full bg-[#FF6D00]"></div>
// //               <span className="text-gray-400">EMA 25</span>
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <div className="w-3 h-3 rounded-full bg-[#E040FB]"></div>
// //               <span className="text-gray-400">EMA 99</span>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }




// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import { createChart, IChartApi, CandlestickSeries, LineSeries, Time } from 'lightweight-charts';
// import axios from 'axios';
// import { FiRefreshCw } from 'react-icons/fi';

// interface ChartData {
//   time: Time;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// }

// interface EMAData {
//   time: Time;
//   value: number;
// }

// export default function TradingChart() {
//   const chartContainerRef = useRef<HTMLDivElement>(null);
//   const chartRef = useRef<IChartApi | null>(null);
//   const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD');
//   const [selectedInterval, setSelectedInterval] = useState('60');
//   const [currentPrice, setCurrentPrice] = useState(0);
//   const [priceChange, setPriceChange] = useState(0);
//   const [high24h, setHigh24h] = useState(0);
//   const [low24h, setLow24h] = useState(0);
//   const [volume, setVolume] = useState(0);
//   const [loading, setLoading] = useState(true);

//   const symbols = [
//     { name: 'BTC/USD', pair: 'XBT/USD' },
//     { name: 'ETH/USD', pair: 'ETH/USD' },
//     { name: 'SOL/USD', pair: 'SOL/USD' },
//     { name: 'ADA/USD', pair: 'ADA/USD' },
//     { name: 'DOT/USD', pair: 'DOT/USD' },
//     { name: 'AVAX/USD', pair: 'AVAX/USD' },
//     { name: 'MATIC/USD', pair: 'MATIC/USD' }
//   ];

//   const timeframes = [
//     { label: '1m', value: '1' },
//     { label: '5m', value: '5' },
//     { label: '15m', value: '15' },
//     { label: '30m', value: '30' },
//     { label: '1h', value: '60' },
//     { label: '4h', value: '240' },
//     { label: '1d', value: '1440' }
//   ];

//   // Fetch OHLC data from Kraken
//   const fetchChartData = async (pair: string, interval: string): Promise<ChartData[]> => {
//     try {
//       const krakenPair = pair.replace('/', '');
      
//       const response = await axios.get('https://api.kraken.com/0/public/OHLC', {
//         params: {
//           pair: krakenPair,
//           interval: interval,
//         },
//         timeout: 10000
//       });
      
//       if (!response.data.result) {
//         throw new Error('No result from API');
//       }
      
//       const data = response.data.result[krakenPair];
      
//       if (!data || data.length === 0) {
//         const altPair = pair.replace('/', '').toUpperCase();
//         const altData = response.data.result[altPair];
//         if (!altData || altData.length === 0) {
//           throw new Error('No data received');
//         }
//         const formattedData: ChartData[] = altData.map((item: any) => ({
//           time: item[0] as Time,
//           open: parseFloat(item[1]),
//           high: parseFloat(item[2]),
//           low: parseFloat(item[3]),
//           close: parseFloat(item[4]),
//         }));
//         return formattedData;
//       }
      
//       const formattedData: ChartData[] = data.map((item: any) => ({
//         time: item[0] as Time,
//         open: parseFloat(item[1]),
//         high: parseFloat(item[2]),
//         low: parseFloat(item[3]),
//         close: parseFloat(item[4]),
//       }));
      
//       return formattedData;
//     } catch (error) {
//       console.error('Error fetching from Kraken:', error);
//       return generateMockData();
//     }
//   };

//   // Fetch ticker data from Kraken
//   const fetchTickerData = async (pair: string) => {
//     try {
//       const krakenPair = pair.replace('/', '');
      
//       const response = await axios.get('https://api.kraken.com/0/public/Ticker', {
//         params: { pair: krakenPair },
//         timeout: 10000
//       });
      
//       const ticker = response.data.result[krakenPair];
      
//       if (ticker) {
//         const current = parseFloat(ticker.c[0]);
//         const open = parseFloat(ticker.o);
//         const change = ((current - open) / open) * 100;
        
//         setCurrentPrice(current);
//         setPriceChange(change);
//         setHigh24h(parseFloat(ticker.h[1]));
//         setLow24h(parseFloat(ticker.l[1]));
//         setVolume(parseFloat(ticker.v[1]));
//       }
//     } catch (error) {
//       console.error('Error fetching ticker:', error);
//       setCurrentPrice(50000);
//       setPriceChange(2.5);
//       setHigh24h(51000);
//       setLow24h(49000);
//       setVolume(15000);
//     }
//   };

//   const generateMockData = (): ChartData[] => {
//     const data: ChartData[] = [];
//     let price = 50000;
//     const now = Math.floor(Date.now() / 1000);
    
//     for (let i = 200; i > 0; i--) {
//       const change = (Math.random() - 0.5) * 200;
//       price += change;
//       data.push({
//         time: (now - i * 300) as Time,
//         open: price - change / 2,
//         high: price + Math.abs(change) + Math.random() * 50,
//         low: price - Math.abs(change) - Math.random() * 50,
//         close: price,
//       });
//     }
    
//     return data;
//   };

//   // Calculate EMA
//   const calculateEMA = (data: ChartData[], period: number): EMAData[] => {
//     const ema: EMAData[] = [];
//     const multiplier = 2 / (period + 1);
    
//     for (let i = 0; i < data.length; i++) {
//       if (i < period - 1) {
//         ema.push({ time: data[i].time, value: data[i].close });
//         continue;
//       }
      
//       if (i === period - 1) {
//         const sum = data.slice(0, period).reduce((acc, d) => acc + d.close, 0);
//         ema.push({ time: data[i].time, value: sum / period });
//       } else {
//         const emaValue = (data[i].close - ema[i - 1].value) * multiplier + ema[i - 1].value;
//         ema.push({ time: data[i].time, value: emaValue });
//       }
//     }
    
//     return ema;
//   };

//   const updateChart = async () => {
//     setLoading(true);
    
//     try {
//       const selectedPair = symbols.find(s => s.name === selectedSymbol)?.pair || 'XBT/USD';
//       const intervalValue = timeframes.find(t => t.label === selectedInterval)?.value || '60';
      
//       const data = await fetchChartData(selectedPair, intervalValue);
//       await fetchTickerData(selectedPair);
      
//       if (chartRef.current) {
//         try {
//           chartRef.current.remove();
//         } catch (e) {
//           console.log('Chart already disposed');
//         }
//         chartRef.current = null;
//       }
      
//       if (!chartContainerRef.current) {
//         setLoading(false);
//         return;
//       }
      
//       const chart = createChart(chartContainerRef.current, {
//         width: chartContainerRef.current.clientWidth,
//         height: 500,
//         layout: {
//           background: { color: '#131824' },
//           textColor: '#d1d4dc',
//         },
//         grid: {
//           vertLines: { color: '#1e2538' },
//           horzLines: { color: '#1e2538' },
//         },
//         crosshair: {
//           mode: 1,
//         },
//         rightPriceScale: {
//           borderColor: '#2a2e3d',
//         },
//         timeScale: {
//           borderColor: '#2a2e3d',
//           timeVisible: true,
//           secondsVisible: false,
//         },
//       });
      
//       chartRef.current = chart;
      
//       const candlestickSeries = chart.addSeries(CandlestickSeries, {
//         upColor: '#26a69a',
//         downColor: '#ef5350',
//         borderVisible: false,
//         wickUpColor: '#26a69a',
//         wickDownColor: '#ef5350',
//       });
      
//       candlestickSeries.setData(data);
      
//       if (data.length > 99) {
//         const ema7 = calculateEMA(data, 7);
//         const ema7Series = chart.addSeries(LineSeries, {
//           color: '#2962FF',
//           lineWidth: 1,
//           title: 'EMA 7',
//         });
//         ema7Series.setData(ema7);
        
//         const ema25 = calculateEMA(data, 25);
//         const ema25Series = chart.addSeries(LineSeries, {
//           color: '#FF6D00',
//           lineWidth: 1,
//           title: 'EMA 25',
//         });
//         ema25Series.setData(ema25);
        
//         const ema99 = calculateEMA(data, 99);
//         const ema99Series = chart.addSeries(LineSeries, {
//           color: '#E040FB',
//           lineWidth: 1,
//           title: 'EMA 99',
//         });
//         ema99Series.setData(ema99);
//       }
      
//       chart.timeScale().fitContent();
//     } catch (error) {
//       console.error('Error updating chart:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     updateChart();
    
//     const handleResize = () => {
//       if (chartRef.current && chartContainerRef.current) {
//         try {
//           chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
//         } catch (e) {
//           console.log('Error resizing chart');
//         }
//       }
//     };
    
//     window.addEventListener('resize', handleResize);
    
//     const interval = setInterval(() => {
//       updateChart();
//     }, 30000);
    
//     return () => {
//       window.removeEventListener('resize', handleResize);
//       clearInterval(interval);
//       if (chartRef.current) {
//         try {
//           chartRef.current.remove();
//         } catch (e) {
//           console.log('Chart already disposed on cleanup');
//         }
//       }
//     };
//   }, [selectedSymbol, selectedInterval]);

//   return (
//     <div className="bg-[#0a0e1a] min-h-screen p-4">
//       <div className="max-w-7xl mx-auto">
//         <div className="bg-[#131824] rounded-lg p-4 mb-4">
//           <div className="flex flex-wrap items-center justify-between gap-4">
//             <div className="flex items-center gap-4 flex-wrap">
//               <select
//                 value={selectedSymbol}
//                 onChange={(e) => setSelectedSymbol(e.target.value)}
//                 className="bg-[#1e2538] text-white px-4 py-2 rounded-lg font-bold cursor-pointer"
//               >
//                 {symbols.map(sym => (
//                   <option key={sym.name} value={sym.name}>{sym.name}</option>
//                 ))}
//               </select>
              
//               <div className="flex gap-1 flex-wrap">
//                 {timeframes.map(tf => (
//                   <button
//                     key={tf.label}
//                     onClick={() => setSelectedInterval(tf.label)}
//                     className={`px-3 py-1 rounded text-sm font-medium transition ${
//                       selectedInterval === tf.label
//                         ? 'bg-green-500 text-white'
//                         : 'bg-[#1e2538] text-gray-400 hover:bg-[#2a2e3d]'
//                     }`}
//                   >
//                     {tf.label}
//                   </button>
//                 ))}
//               </div>
//             </div>
            
//             <div className="flex items-center gap-4">
//               <div className="text-right">
//                 <div className="text-2xl font-bold text-white">
//                   ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                 </div>
//                 <div className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
//                   {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
//                 </div>
//               </div>
              
//               <button
//                 onClick={() => updateChart()}
//                 className="p-2 rounded-lg bg-[#1e2538] hover:bg-[#2a2e3d] transition"
//               >
//                 <FiRefreshCw className="text-gray-400" />
//               </button>
//             </div>
//           </div>
          
//           <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-[#1e2538]">
//             <div>
//               <div className="text-xs text-gray-500">24h High</div>
//               <div className="text-sm text-white">${high24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
//             </div>
//             <div>
//               <div className="text-xs text-gray-500">24h Low</div>
//               <div className="text-sm text-white">${low24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
//             </div>
//             <div>
//               <div className="text-xs text-gray-500">24h Volume</div>
//               <div className="text-sm text-white">{(volume / 1000000).toFixed(2)}M</div>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-[#131824] rounded-lg p-4">
//           {loading && (
//             <div className="flex items-center justify-center h-[500px]">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
//             </div>
//           )}
//           <div ref={chartContainerRef} className="w-full h-[500px]" />
//         </div>
        
//         <div className="bg-[#131824] rounded-lg p-4 mt-4">
//           <div className="flex gap-4 text-xs">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 rounded-full bg-[#2962FF]"></div>
//               <span className="text-gray-400">EMA 7</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 rounded-full bg-[#FF6D00]"></div>
//               <span className="text-gray-400">EMA 25</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 rounded-full bg-[#E040FB]"></div>
//               <span className="text-gray-400">EMA 99</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, CandlestickSeries, LineSeries, Time } from 'lightweight-charts';
import axios from 'axios';
import { FiRefreshCw } from 'react-icons/fi';

interface ChartData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface EMAData {
  time: Time;
  value: number;
}

export default function TradingChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD');
  const [selectedInterval, setSelectedInterval] = useState('60');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [high24h, setHigh24h] = useState(0);
  const [low24h, setLow24h] = useState(0);
  const [volume, setVolume] = useState(0);
  const [loading, setLoading] = useState(true);

  const symbols = [
    { name: 'BTC/USD', pair: 'XXBTZUSD' },
    { name: 'ETH/USD', pair: 'XETHZUSD' },
    { name: 'SOL/USD', pair: 'SOLUSD' },
    { name: 'ADA/USD', pair: 'ADAUSD' },
    { name: 'DOT/USD', pair: 'DOTUSD' },
    { name: 'MATIC/USD', pair: 'MATICUSD' }
  ];

  const timeframes = [
    { label: '1m', value: '1' },
    { label: '5m', value: '5' },
    { label: '15m', value: '15' },
    { label: '30m', value: '30' },
    { label: '1h', value: '60' },
    { label: '4h', value: '240' },
    { label: '1d', value: '1440' }
  ];

//   // Fetch OHLC data from Kraken
//   const fetchChartData = async (pair: string, interval: string): Promise<ChartData[]> => {
//     try {
//       const response = await axios.get('https://api.kraken.com/0/public/OHLC', {
//         params: {
//           pair: pair,
//           interval: interval,
//         },
//         timeout: 10000
//       });
      
//       if (!response.data.result) {
//         throw new Error('No result from API');
//       }
      
//       const data = response.data.result[pair];
      
//       if (!data || data.length === 0) {
//         console.log(`No data for pair: ${pair}, using mock data`);
//         return generateMockData();
//       }
      
//       const formattedData: ChartData[] = data.map((item: any) => ({
//         time: item[0] as Time,
//         open: parseFloat(item[1]),
//         high: parseFloat(item[2]),
//         low: parseFloat(item[3]),
//         close: parseFloat(item[4]),
//       }));
      
//       return formattedData;
//     } catch (error) {
//       console.error('Error fetching from Kraken:', error);
//       return generateMockData();
//     }
//   };

//   // Fetch ticker data from Kraken
//   const fetchTickerData = async (pair: string) => {
//     try {
//       const response = await axios.get('https://api.kraken.com/0/public/Ticker', {
//         params: { pair: pair },
//         timeout: 10000
//       });
      
//       const ticker = response.data.result[pair];
      
//       if (ticker) {
//         const current = parseFloat(ticker.c[0]);
//         const open = parseFloat(ticker.o);
//         const change = ((current - open) / open) * 100;
        
//         setCurrentPrice(current);
//         setPriceChange(change);
//         setHigh24h(parseFloat(ticker.h[1]));
//         setLow24h(parseFloat(ticker.l[1]));
//         setVolume(parseFloat(ticker.v[1]));
//       } else {
//         // Set mock data if no ticker data
//         setMockPriceData();
//       }
//     } catch (error) {
//       console.error('Error fetching ticker:', error);
//       setMockPriceData();
//     }
//   };


// Update fetchChartData
const fetchChartData = async (pair: string, interval: string): Promise<ChartData[]> => {
  try {
    const response = await axios.get('/api/kraken-chart', {
      params: {
        pair: pair,
        interval: interval,
      },
      timeout: 10000
    });
    
    // Don't throw error - just use mock data
    const data = response.data.result?.[pair];
    
    if (!data || data.length === 0) {
      console.log(`No data for pair: ${pair}, using mock data`);
      return generateMockData();
    }
    
    const formattedData: ChartData[] = data.map((item: any) => ({
      time: item[0] as Time,
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
    }));
    
    return formattedData.length > 0 ? formattedData : generateMockData();
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return generateMockData();
  }
};

// Update fetchTickerData
const fetchTickerData = async (pair: string) => {
  try {
    const response = await axios.get('/api/kraken-ticker', {
      params: { pair: pair },
      timeout: 10000
    });
    
    const ticker = response.data.result?.[pair];
    
    if (ticker && ticker.c) {
      const current = parseFloat(ticker.c[0]);
      const open = parseFloat(ticker.o);
      const change = ((current - open) / open) * 100;
      
      setCurrentPrice(current);
      setPriceChange(change);
      setHigh24h(parseFloat(ticker.h[1]) || current * 1.02);
      setLow24h(parseFloat(ticker.l[1]) || current * 0.98);
      setVolume(parseFloat(ticker.v[1]) || 10000);
    } else {
      setMockPriceData();
    }
  } catch (error) {
    console.error('Error fetching ticker:', error);
    setMockPriceData();
  }
};

  const setMockPriceData = () => {
    setCurrentPrice(50000);
    setPriceChange(2.5);
    setHigh24h(51000);
    setLow24h(49000);
    setVolume(15000);
  };

  const generateMockData = (): ChartData[] => {
    const data: ChartData[] = [];
    let price = selectedSymbol === 'BTC/USD' ? 50000 : 
                selectedSymbol === 'ETH/USD' ? 3000 :
                selectedSymbol === 'SOL/USD' ? 100 : 50;
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 200; i > 0; i--) {
      const change = (Math.random() - 0.5) * (price * 0.02);
      price += change;
      data.push({
        time: (now - i * 300) as Time,
        open: price - change / 2,
        high: price + Math.abs(change) + Math.random() * (price * 0.01),
        low: price - Math.abs(change) - Math.random() * (price * 0.01),
        close: price,
      });
    }
    
    return data;
  };

  // Calculate EMA
  const calculateEMA = (data: ChartData[], period: number): EMAData[] => {
    const ema: EMAData[] = [];
    const multiplier = 2 / (period + 1);
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        ema.push({ time: data[i].time, value: data[i].close });
        continue;
      }
      
      if (i === period - 1) {
        const sum = data.slice(0, period).reduce((acc, d) => acc + d.close, 0);
        ema.push({ time: data[i].time, value: sum / period });
      } else {
        const emaValue = (data[i].close - ema[i - 1].value) * multiplier + ema[i - 1].value;
        ema.push({ time: data[i].time, value: emaValue });
      }
    }
    
    return ema;
  };

  const updateChart = async () => {
    setLoading(true);
    
    try {
      const selectedPair = symbols.find(s => s.name === selectedSymbol)?.pair || 'XXBTZUSD';
      const intervalValue = timeframes.find(t => t.label === selectedInterval)?.value || '60';
      
      const data = await fetchChartData(selectedPair, intervalValue);
      await fetchTickerData(selectedPair);
      
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {
          console.log('Chart already disposed');
        }
        chartRef.current = null;
      }
      
      if (!chartContainerRef.current) {
        setLoading(false);
        return;
      }
      
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 500,
        layout: {
          background: { color: '#131824' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: '#1e2538' },
          horzLines: { color: '#1e2538' },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: '#2a2e3d',
        },
        timeScale: {
          borderColor: '#2a2e3d',
          timeVisible: true,
          secondsVisible: false,
        },
      });
      
      chartRef.current = chart;
      
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      
      candlestickSeries.setData(data);
      
      if (data.length > 99) {
        const ema7 = calculateEMA(data, 7);
        const ema7Series = chart.addSeries(LineSeries, {
          color: '#2962FF',
          lineWidth: 1,
          title: 'EMA 7',
        });
        ema7Series.setData(ema7);
        
        const ema25 = calculateEMA(data, 25);
        const ema25Series = chart.addSeries(LineSeries, {
          color: '#FF6D00',
          lineWidth: 1,
          title: 'EMA 25',
        });
        ema25Series.setData(ema25);
        
        const ema99 = calculateEMA(data, 99);
        const ema99Series = chart.addSeries(LineSeries, {
          color: '#E040FB',
          lineWidth: 1,
          title: 'EMA 99',
        });
        ema99Series.setData(ema99);
      }
      
      chart.timeScale().fitContent();
    } catch (error) {
      console.error('Error updating chart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateChart();
    
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        try {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        } catch (e) {
          console.log('Error resizing chart');
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    const interval = setInterval(() => {
      updateChart();
    }, 30000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {
          console.log('Chart already disposed on cleanup');
        }
      }
    };
  }, [selectedSymbol, selectedInterval]);

  return (
    <div className="bg-[#0a0e1a] min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#131824] rounded-lg p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-[#1e2538] text-white px-4 py-2 rounded-lg font-bold cursor-pointer"
              >
                {symbols.map(sym => (
                  <option key={sym.name} value={sym.name}>{sym.name}</option>
                ))}
              </select>
              
              <div className="flex gap-1 flex-wrap">
                {timeframes.map(tf => (
                  <button
                    key={tf.label}
                    onClick={() => setSelectedInterval(tf.label)}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      selectedInterval === tf.label
                        ? 'bg-green-500 text-white'
                        : 'bg-[#1e2538] text-gray-400 hover:bg-[#2a2e3d]'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
                </div>
              </div>
              
              <button
                onClick={() => updateChart()}
                className="p-2 rounded-lg bg-[#1e2538] hover:bg-[#2a2e3d] transition"
              >
                <FiRefreshCw className="text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-[#1e2538]">
            <div>
              <div className="text-xs text-gray-500">24h High</div>
              <div className="text-sm text-white">${high24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">24h Low</div>
              <div className="text-sm text-white">${low24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">24h Volume</div>
              <div className="text-sm text-white">{(volume / 1000000).toFixed(2)}M</div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#131824] rounded-lg p-4">
          {loading && (
            <div className="flex items-center justify-center h-[500px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          )}
          <div ref={chartContainerRef} className="w-full h-[500px]" />
        </div>
        
        <div className="bg-[#131824] rounded-lg p-4 mt-4">
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#2962FF]"></div>
              <span className="text-gray-400">EMA 7</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF6D00]"></div>
              <span className="text-gray-400">EMA 25</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#E040FB]"></div>
              <span className="text-gray-400">EMA 99</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}